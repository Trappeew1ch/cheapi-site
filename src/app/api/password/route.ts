import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  getSessionUser,
  getUserById,
  passwordProblem,
  verifyUserPassword,
} from "@/lib/auth";
import { hashPassword, run } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  let body: { current?: string; next?: string };
  try {
    body = (await request.json()) as { current?: string; next?: string };
  } catch {
    body = {};
  }

  const user = getUserById(session.id);
  if (!user || !verifyUserPassword(user, body.current ?? "")) {
    return NextResponse.json({ error: "Текущий пароль неверен." }, { status: 400 });
  }

  const problem = passwordProblem(body.next ?? "");
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 });
  }

  run(
    "UPDATE users SET password_hash = ? WHERE id = ?",
    hashPassword(body.next!),
    session.id,
  );

  return NextResponse.json({ ok: true });
}
