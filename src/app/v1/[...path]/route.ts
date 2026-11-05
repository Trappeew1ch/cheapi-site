import { authenticateApiKey, checkRateLimit } from "@/lib/auth";
import { MODELS } from "@/lib/models";
import {
  corsHeaders,
  errorResponse,
  handleProxy,
} from "@/lib/upstream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREATED = 1_735_689_600; // 2025-01-01, stable timestamp for the catalogue

type Context = { params: Promise<{ path: string[] }> };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function unauthorized(path: string, message: string) {
  return errorResponse(path, 401, message, "invalid_api_key");
}

function modelPayload(model: (typeof MODELS)[number]) {
  return {
    id: model.id,
    object: "model",
    created: CREATED,
    owned_by: model.vendor.toLowerCase(),
  };
}

export async function GET(request: Request, ctx: Context) {
  const { path } = await ctx.params;
  const joined = path.join("/");
  const auth = authenticateApiKey(request);

  if (!auth) {
    return unauthorized(
      joined,
      "Неверный или отозванный API-ключ. Передайте его в заголовке Authorization: Bearer che_sk_…",
    );
  }

  if (joined === "models") {
    return Response.json(
      {
        object: "list",
        data: MODELS.map(modelPayload),
      },
      { headers: corsHeaders() },
    );
  }

  if (path[0] === "models" && path.length === 2) {
    const model = MODELS.find((item) => item.id === path[1]);
    if (!model) {
      return errorResponse(joined, 404, "Модель не найдена.", "model_not_found");
    }
    return Response.json(modelPayload(model), { headers: corsHeaders() });
  }

  return errorResponse(joined, 404, "Эндпоинт не найден.", "not_found");
}

export async function POST(request: Request, ctx: Context) {
  const { path } = await ctx.params;
  const joined = path.join("/");
  const auth = authenticateApiKey(request);

  if (!auth) {
    return unauthorized(
      joined,
      "Неверный или отозванный API-ключ. Передайте его в заголовке Authorization: Bearer che_sk_…",
    );
  }

  if (!checkRateLimit(auth.key.id)) {
    return errorResponse(
      joined,
      429,
      "Слишком много запросов. Лимит — 120 запросов в минуту на ключ.",
      "rate_limit_exceeded",
    );
  }

  return handleProxy(request, joined, {
    user: auth.user,
    keyId: auth.key.id,
    path: joined,
  });
}
