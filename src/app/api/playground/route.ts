import { NextResponse } from "next/server";
import { assertSameOrigin, getSessionUser, getUserById } from "@/lib/auth";
import { resolveModel } from "@/lib/models";
import { handleProxy } from "@/lib/upstream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const buckets = new Map<string, { count: number; resetAt: number }>();

function limited(userId: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(userId);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(userId, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (bucket.count >= 20) return true;
  bucket.count += 1;
  return false;
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  if (limited(session.id)) {
    return NextResponse.json(
      { error: "В песочнице можно отправить не более 20 запросов в минуту." },
      { status: 429 },
    );
  }

  let body: {
    model?: string;
    messages?: ChatMessage[];
    system?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const model = resolveModel(body.model ?? "");
  if (!model || model.kind !== "chat") {
    return NextResponse.json(
      { error: "Выберите текстовую модель из каталога." },
      { status: 400 },
    );
  }

  const history = (body.messages ?? [])
    .filter((message) => message && typeof message.content === "string")
    .slice(-20)
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content.slice(0, 12_000),
    }));

  if (history.length === 0) {
    return NextResponse.json({ error: "Введите сообщение." }, { status: 400 });
  }

  const messages = body.system?.trim()
    ? [{ role: "system", content: body.system.slice(0, 4_000) }, ...history]
    : history;

  const user = getUserById(session.id);
  if (!user) {
    return NextResponse.json({ error: "Аккаунт не найден." }, { status: 404 });
  }

  const upstreamRequest = new Request("http://cheapi.local/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: model.id,
      messages,
      stream: false,
    }),
  });

  const response = await handleProxy(upstreamRequest, "chat/completions", {
    user,
    keyId: null,
    path: "chat/completions",
  });

  const text = await response.text();

  if (!response.ok) {
    let message = "Не удалось получить ответ модели.";
    try {
      const parsed = JSON.parse(text) as {
        error?: { message?: string };
        message?: string;
      };
      message = parsed.error?.message ?? parsed.message ?? message;
    } catch {
      // ignore
    }
    return NextResponse.json({ error: message }, { status: response.status });
  }

  let content = "";
  let usage: unknown = null;
  try {
    const parsed = JSON.parse(text) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: unknown;
    };
    content = parsed.choices?.[0]?.message?.content ?? "";
    usage = parsed.usage ?? null;
  } catch {
    content = text;
  }

  const updated = getUserById(session.id);

  return NextResponse.json({
    ok: true,
    content,
    usage,
    model: model.id,
    balance_tokens: updated?.balance_tokens ?? 0,
  });
}
