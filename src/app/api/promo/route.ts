import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  getSessionUser,
} from "@/lib/auth";
import { get, newId, run, transaction } from "@/lib/db";
import { formatTokens } from "@/lib/format";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = (await request.json()) as { code?: string };
  } catch {
    body = {};
  }

  const code = (body.code ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Введите промокод." }, { status: 400 });
  }

  const promo = get<{
    code: string;
    tokens: number;
    max_uses: number;
    uses: number;
    active: number;
  }>("SELECT * FROM promo_codes WHERE code = ?", code);

  if (!promo || !promo.active) {
    return NextResponse.json({ error: "Промокод не найден или неактивен." }, { status: 404 });
  }

  if (promo.uses >= promo.max_uses) {
    return NextResponse.json({ error: "Лимит использований промокода исчерпан." }, { status: 400 });
  }

  const already = get<{ code: string }>(
    "SELECT code FROM promo_redemptions WHERE code = ? AND user_id = ?",
    code,
    user.id,
  );
  if (already) {
    return NextResponse.json({ error: "Вы уже активировали этот промокод." }, { status: 400 });
  }

  const now = new Date().toISOString();
  transaction(() => {
    run(
      "INSERT INTO promo_redemptions (code, user_id, redeemed_at) VALUES (?, ?, ?)",
      code,
      user.id,
      now,
    );
    run("UPDATE promo_codes SET uses = uses + 1 WHERE code = ?", code);
    run(
      "UPDATE users SET balance_tokens = balance_tokens + ? WHERE id = ?",
      promo.tokens,
      user.id,
    );
    run(
      "INSERT INTO topups (id, user_id, amount_rub, tokens, status, provider, promo_code, created_at, paid_at) VALUES (?, ?, ?, ?, 'succeeded', 'promo', ?, ?, ?)",
      newId("top"),
      user.id,
      (promo.tokens * Number(user.rate_rub_per_m)) / 1_000_000,
      promo.tokens,
      code,
      now,
      now,
    );
  });

  return NextResponse.json({
    ok: true,
    tokens: promo.tokens,
    message: `Промокод активирован: +${formatTokens(promo.tokens)} токенов`,
  });
}
