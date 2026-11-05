import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  createSession,
  getUserByEmail,
  normalizeEmail,
  verifyUserPassword,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  const user = getUserByEmail(email);
  if (!user || !verifyUserPassword(user, password)) {
    return NextResponse.json(
      { error: "Неверный email или пароль." },
      { status: 401 },
    );
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
