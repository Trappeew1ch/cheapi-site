import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  createSession,
  createUser,
  getUserByEmail,
  isValidEmail,
  normalizeEmail,
  passwordProblem,
} from "@/lib/auth";

export const runtime = "nodejs";

type Body = {
  email?: string;
  password?: string;
  telegram?: string;
  consent?: boolean;
};

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Укажите корректный email." },
      { status: 400 },
    );
  }

  const problem = passwordProblem(password);
  if (problem) {
    return NextResponse.json({ error: problem }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json(
      { error: "Нужно принять условия соглашения и политику конфиденциальности." },
      { status: 400 },
    );
  }

  if (getUserByEmail(email)) {
    return NextResponse.json(
      { error: "Аккаунт с таким email уже существует. Войдите." },
      { status: 409 },
    );
  }

  const user = createUser(email, password, body.telegram);
  await createSession(user.id);

  return NextResponse.json({ ok: true, email: user.email });
}
