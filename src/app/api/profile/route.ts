import { NextResponse } from "next/server";
import { assertSameOrigin, getSessionUser, getUserById } from "@/lib/auth";
import { run } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  let body: { telegram?: string };
  try {
    body = (await request.json()) as { telegram?: string };
  } catch {
    body = {};
  }

  const telegram = (body.telegram ?? "")
    .trim()
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "@")
    .replace(/^@?/, "@")
    .slice(0, 64);

  run(
    "UPDATE users SET telegram = ? WHERE id = ?",
    telegram === "@" ? null : telegram,
    session.id,
  );

  const updated = getUserById(session.id);
  return NextResponse.json({ ok: true, telegram: updated?.telegram ?? null });
}
