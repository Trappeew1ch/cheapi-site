import { NextResponse } from "next/server";
import { assertSameOrigin, getSessionUser } from "@/lib/auth";
import { get, newId, run, transaction } from "@/lib/db";
import { formatRub } from "@/lib/format";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 403 });
  }

  let body: { userId?: string; tokens?: number; amountRub?: number; note?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const target = body.userId
    ? get<{ id: string; rate_rub_per_m: number }>(
        "SELECT id, rate_rub_per_m FROM users WHERE id = ?",
        body.userId,
      )
    : undefined;

  if (!target) {
    return NextResponse.json({ error: "Пользователь не найден." }, { status: 404 });
  }

  const rate = Number(target.rate_rub_per_m) || 11.418;
  const tokens = Math.round(
    Number(body.tokens) || (Number(body.amountRub) || 0) / (rate / 1_000_000),
  );

  if (!Number.isFinite(tokens) || tokens <= 0 || tokens > 10_000_000_000) {
    return NextResponse.json({ error: "Укажите корректную сумму." }, { status: 400 });
  }

  const now = new Date().toISOString();
  transaction(() => {
    run(
      "UPDATE users SET balance_tokens = balance_tokens + ? WHERE id = ?",
      tokens,
      target.id,
    );
    run(
      "INSERT INTO topups (id, user_id, amount_rub, tokens, status, provider, promo_code, created_at, paid_at) VALUES (?, ?, ?, ?, 'succeeded', 'manual', ?, ?, ?)",
      newId("top"),
      target.id,
      (tokens * rate) / 1_000_000,
      tokens,
      body.note?.slice(0, 60) ?? "ADMIN",
      now,
      now,
    );
  });

  return NextResponse.json({
    ok: true,
    tokens,
    message: `Начислено ${formatRub((tokens * rate) / 1_000_000)} (${tokens.toLocaleString("ru-RU")} токенов)`,
  });
}
