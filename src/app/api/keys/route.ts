import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  createApiKey,
  getApiKeys,
  getSessionUser,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = (await request.json()) as { name?: string };
  } catch {
    body = {};
  }

  const active = getApiKeys(user.id).filter((key) => !key.revoked_at);
  if (active.length >= 10) {
    return NextResponse.json(
      { error: "Достигнут лимит: 10 активных ключей. Отзовите старый ключ." },
      { status: 400 },
    );
  }

  const created = createApiKey(user.id, body.name ?? "API key");
  return NextResponse.json({
    ok: true,
    id: created.id,
    key: created.key,
    name: created.name,
  });
}
