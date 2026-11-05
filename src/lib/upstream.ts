import "server-only";
import { newId, run, transaction, type UserRow } from "@/lib/db";
import { resolveModel, type Model } from "@/lib/models";
import { chargedTokens, estimateTokens, type Usage } from "@/lib/pricing";

const UPSTREAM_BASE = (process.env.CODEX_SALE_BASE ?? "https://codex.sale").replace(
  /\/$/,
  "",
);
const UPSTREAM_KEY = process.env.CODEX_SALE_API_KEY ?? "";
const UPSTREAM_TIMEOUT = Number(process.env.UPSTREAM_TIMEOUT_MS ?? 180_000);

const PASS_THROUGH_HEADERS = [
  "content-type",
  "anthropic-version",
  "anthropic-beta",
  "x-request-id",
  "openai-processing-ms",
];

export type ProxyContext = {
  user: UserRow;
  keyId: string | null;
  path: string;
};

function upstreamUrl(path: string): string {
  if (path === "messages" || path === "messages/count_tokens") {
    return `${UPSTREAM_BASE}/v1/${path}`;
  }
  return `${UPSTREAM_BASE}/v1/${path}`;
}

function isAnthropicPath(path: string): boolean {
  return path.startsWith("messages");
}

export function errorResponse(
  path: string,
  status: number,
  message: string,
  code = "request_error",
): Response {
  if (isAnthropicPath(path)) {
    return Response.json(
      {
        type: "error",
        error: { type: code, message },
      },
      { status, headers: corsHeaders() },
    );
  }

  return Response.json(
    {
      error: {
        message,
        type: code,
        code,
      },
    },
    { status, headers: corsHeaders() },
  );
}

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, x-api-key, anthropic-version, anthropic-beta, openai-beta, x-stainless-lang",
    "Access-Control-Max-Age": "86400",
  };
}

async function fetchUpstream(
  path: string,
  request: Request,
  bodyText: string,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

  const headers = new Headers();
  headers.set("authorization", `Bearer ${UPSTREAM_KEY}`);
  headers.set("content-type", "application/json");
  headers.set("accept", request.headers.get("accept") ?? "application/json");
  headers.set("user-agent", "CheApi/1.0");

  for (const name of ["anthropic-version", "anthropic-beta", "openai-beta"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    return await fetch(upstreamUrl(path), {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : bodyText,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

function responseHeaders(upstream: Response, stream: boolean): Headers {
  const headers = new Headers();
  for (const name of PASS_THROUGH_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  for (const [name, value] of Object.entries(corsHeaders())) {
    headers.set(name, value);
  }
  if (stream) {
    headers.set("cache-control", "no-cache, no-transform");
    headers.set("connection", "keep-alive");
    headers.set("x-accel-buffering", "no");
  }
  return headers;
}

function normalizeUsage(raw: Record<string, unknown> | undefined): Usage {
  if (!raw) return { inputTokens: 0, outputTokens: 0, cachedTokens: 0 };

  const input = Number(
    raw.input_tokens ?? raw.prompt_tokens ?? raw.inputTokens ?? 0,
  );
  const output = Number(
    raw.output_tokens ?? raw.completion_tokens ?? raw.outputTokens ?? 0,
  );
  const details = (raw.input_tokens_details ?? raw.prompt_tokens_details) as
    | Record<string, unknown>
    | undefined;
  const cached = Number(
    details?.cached_tokens ?? raw.cache_read_input_tokens ?? raw.cached_tokens ?? 0,
  );

  return {
    inputTokens: Number.isFinite(input) ? input : 0,
    outputTokens: Number.isFinite(output) ? output : 0,
    cachedTokens: Number.isFinite(cached) ? cached : 0,
  };
}

function extractUsage(payload: Record<string, unknown>): Usage {
  if (payload.usage && typeof payload.usage === "object") {
    return normalizeUsage(payload.usage as Record<string, unknown>);
  }
  const response = payload.response as Record<string, unknown> | undefined;
  if (response?.usage) {
    return normalizeUsage(response.usage as Record<string, unknown>);
  }
  if (payload.message && typeof payload.message === "object") {
    const message = payload.message as Record<string, unknown>;
    if (message.usage) return normalizeUsage(message.usage as Record<string, unknown>);
  }
  return { inputTokens: 0, outputTokens: 0, cachedTokens: 0 };
}

function recordUsage(options: {
  user: UserRow;
  keyId: string | null;
  model: Model;
  endpoint: string;
  usage: Usage;
  status: number;
  latencyMs: number;
  forceTokens?: number;
}) {
  const { user, keyId, model, endpoint, usage, status, latencyMs, forceTokens } = options;

  const charge = Math.max(
    forceTokens ?? 0,
    chargedTokens(usage, model.coef),
    model.imageMinTokens && status < 400 ? model.imageMinTokens : 0,
  );

  if (charge <= 0) {
    run(
      "INSERT INTO usage_logs (id, user_id, key_id, model, endpoint, input_tokens, output_tokens, cached_tokens, charged_tokens, cost_rub, status, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)",
      newId("req"),
      user.id,
      keyId,
      model.id,
      endpoint,
      Math.round(usage.inputTokens),
      Math.round(usage.outputTokens),
      Math.round(usage.cachedTokens),
      status,
      latencyMs,
      new Date().toISOString(),
    );
    return;
  }

  const rate = Number(user.rate_rub_per_m) || 0;
  const cost = (charge * rate) / 1_000_000;

  transaction(() => {
    run(
      "UPDATE users SET balance_tokens = MAX(0, balance_tokens - ?) WHERE id = ?",
      charge,
      user.id,
    );
    run(
      "INSERT INTO usage_logs (id, user_id, key_id, model, endpoint, input_tokens, output_tokens, cached_tokens, charged_tokens, cost_rub, status, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      newId("req"),
      user.id,
      keyId,
      model.id,
      endpoint,
      Math.round(usage.inputTokens),
      Math.round(usage.outputTokens),
      Math.round(usage.cachedTokens),
      charge,
      cost,
      status,
      latencyMs,
      new Date().toISOString(),
    );
  });
}

function requestText(body: Record<string, unknown>): string {
  const pieces: string[] = [];
  const messages = body.messages;
  if (Array.isArray(messages)) {
    for (const message of messages) {
      if (!message || typeof message !== "object") continue;
      const content = (message as Record<string, unknown>).content;
      if (typeof content === "string") pieces.push(content);
      else if (Array.isArray(content)) {
        for (const part of content) {
          if (part && typeof part === "object") {
            const text = (part as Record<string, unknown>).text;
            if (typeof text === "string") pieces.push(text);
          }
        }
      }
    }
  }
  if (typeof body.input === "string") pieces.push(body.input);
  if (Array.isArray(body.input)) pieces.push(JSON.stringify(body.input));
  if (typeof body.system === "string") pieces.push(body.system);
  if (typeof body.prompt === "string") pieces.push(body.prompt);
  return pieces.join("\n");
}

async function consumeSse(
  stream: ReadableStream<Uint8Array>,
  model: Model,
  onDone: (usage: Usage, text: string) => void,
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let usage: Usage = { inputTokens: 0, outputTokens: 0, cachedTokens: 0 };
  let text = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split(/\n\n/);
      buffer = events.pop() ?? "";

      for (const event of events) {
        for (const line of event.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const payload = JSON.parse(data) as Record<string, unknown>;

            const candidate = extractUsage(payload);
            if (candidate.inputTokens || candidate.outputTokens || candidate.cachedTokens) {
              usage = {
                inputTokens: Math.max(usage.inputTokens, candidate.inputTokens),
                outputTokens: Math.max(usage.outputTokens, candidate.outputTokens),
                cachedTokens: Math.max(usage.cachedTokens, candidate.cachedTokens),
              };
            }

            const choices = payload.choices as Array<Record<string, unknown>> | undefined;
            if (choices?.[0]) {
              const delta = choices[0].delta as Record<string, unknown> | undefined;
              if (typeof delta?.content === "string") text += delta.content;
            }

            if (typeof payload.delta === "string") text += payload.delta;

            const deltaObj = payload.delta as Record<string, unknown> | undefined;
            if (typeof deltaObj?.text === "string") text += deltaObj.text;

            const contentBlock = payload.content_block as Record<string, unknown> | undefined;
            if (typeof contentBlock?.text === "string") text += contentBlock.text;
          } catch {
            // Ignore malformed keep-alive chunks.
          }
        }
      }
    }

    onDone(usage, text);
  } catch {
    onDone(usage, text);
  } finally {
    reader.releaseLock();
  }
}

function mockCompletion(model: Model, body: Record<string, unknown>): Response {
  const prompt = requestText(body);
  const answer =
    "Это демо-ответ CheApi: upstream-ключ ещё не настроен, запрос не тарифицируется. " +
    "Добавьте CODEX_SALE_API_KEY в .env.local — и здесь появится ответ выбранной модели.";
  const usage = {
    prompt_tokens: estimateTokens(prompt),
    completion_tokens: estimateTokens(answer),
    total_tokens: estimateTokens(prompt) + estimateTokens(answer),
  };

  return Response.json(
    {
      id: `chatcmpl_demo_${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: model.id,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: answer },
          finish_reason: "stop",
        },
      ],
      usage,
    },
    { headers: corsHeaders() },
  );
}

/**
 * Authenticated proxy entrypoint. Authentication and rate limiting happen in the
 * route handler; this function only forwards, meters and charges.
 */
export async function handleProxy(
  request: Request,
  path: string,
  context: ProxyContext,
): Promise<Response> {
  const { user, keyId } = context;
  const started = Date.now();

  if (!UPSTREAM_KEY) {
    if (process.env.NODE_ENV !== "production" && path.startsWith("chat/completions")) {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      const model = resolveModel(String(body.model ?? "gpt-6.1-sol"));
      if (model) return mockCompletion(model, body);
    }
    return errorResponse(
      path,
      Number(user.balance_tokens) > 0 ? 503 : 402,
      Number(user.balance_tokens) > 0
        ? "Upstream-провайдер не настроен. Добавьте CODEX_SALE_API_KEY."
        : "Недостаточно средств на балансе. Пополните баланс в кабинете.",
      "upstream_unavailable",
    );
  }

  let bodyText = "";
  let body: Record<string, unknown> = {};

  if (request.method !== "GET") {
    bodyText = await request.text();
    try {
      body = JSON.parse(bodyText) as Record<string, unknown>;
    } catch {
      return errorResponse(path, 400, "Тело запроса должно быть валидным JSON.", "invalid_json");
    }
  }

  const requestedModel = String(body.model ?? "");
  const model = resolveModel(requestedModel);
  if (!model) {
    return errorResponse(
      path,
      400,
      `Модель «${requestedModel || "не указана"}» не найдена. Список доступных моделей: GET /v1/models.`,
      "model_not_found",
    );
  }

  if (Number(user.balance_tokens) <= 0) {
    return errorResponse(
      path,
      402,
      "Недостаточно средств на балансе. Пополните баланс в кабинете CheApi.",
      "insufficient_balance",
    );
  }

  if (path === "messages/count_tokens") {
    if (!UPSTREAM_KEY) {
      return Response.json(
        { input_tokens: estimateTokens(requestText(body)) },
        { headers: corsHeaders() },
      );
    }
    const upstream = await fetchUpstream(path, request, bodyText).catch(() => null);
    if (!upstream) {
      return errorResponse(path, 502, "Upstream недоступен.", "upstream_error");
    }
    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders(upstream, false),
    });
  }

  const isStream = Boolean(body.stream);
  if (!isStream) {
    bodyText = JSON.stringify(body);
  }

  // Images have no token usage in the response; apply the per-image minimum.
  const imageCount =
    model.kind === "image" ? Math.max(1, Math.min(10, Number(body.n) || 1)) : 0;

  let upstream: Response;
  try {
    upstream = await fetchUpstream(path, request, bodyText);
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Upstream не ответил вовремя. Попробуйте ещё раз."
        : "Не удалось связаться с upstream-провайдером.";
    return errorResponse(path, 502, message, "upstream_error");
  }

  const latencyMs = Date.now() - started;

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    let message = `Upstream вернул ошибку ${upstream.status}.`;
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const nested = parsed.error as Record<string, unknown> | undefined;
      if (typeof nested?.message === "string") message = nested.message;
      else if (typeof parsed.message === "string") message = parsed.message;
    } catch {
      // keep the generic message
    }
    return errorResponse(path, upstream.status, message, "upstream_error");
  }

  if (isStream && upstream.body) {
    const [clientStream, billingStream] = upstream.body.tee();
    const inputEstimate = estimateTokens(requestText(body));

    void consumeSse(billingStream, model, (usage, text) => {
      const finalUsage: Usage =
        usage.inputTokens || usage.outputTokens
          ? usage
          : {
              inputTokens: inputEstimate,
              outputTokens: estimateTokens(text),
              cachedTokens: 0,
            };
      recordUsage({
        user,
        keyId,
        model,
        endpoint: `/${path}`,
        usage: finalUsage,
        status: 200,
        latencyMs: Date.now() - started,
      });
    });

    return new Response(clientStream, {
      status: 200,
      headers: responseHeaders(upstream, true),
    });
  }

  const text = await upstream.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(text) as Record<string, unknown>;
  } catch {
    // Non-JSON successful responses are passed through unchanged.
  }

  const usage = extractUsage(payload);
  const hasUsage = usage.inputTokens > 0 || usage.outputTokens > 0;

  recordUsage({
    user,
    keyId,
    model,
    endpoint: `/${path}`,
    usage: hasUsage
      ? usage
      : {
          inputTokens: estimateTokens(requestText(body)),
          outputTokens: estimateTokens(text),
          cachedTokens: 0,
        },
    status: upstream.status,
    latencyMs,
    forceTokens:
      imageCount > 0 ? imageCount * (model.imageMinTokens ?? 0) : undefined,
  });

  return new Response(text, {
    status: upstream.status,
    headers: responseHeaders(upstream, false),
  });
}

export function estimateRequestTokens(body: Record<string, unknown>): number {
  return estimateTokens(requestText(body));
}

export const upstreamConfigured = Boolean(UPSTREAM_KEY);
