import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { assertSameOrigin, getSessionUser } from "@/lib/auth";
import { newId, run } from "@/lib/db";
import { SITE } from "@/lib/site";
import {
  MAX_TOPUP_RUB,
  MIN_TOPUP_RUB,
  tokensForRub,
} from "@/lib/pricing";
import { createYooKassaPayment, isYooKassaConfigured } from "@/lib/yookassa";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Запрос отклонён." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  if (!isYooKassaConfigured()) {
    return NextResponse.json(
      {
        error:
          "Оплата картой временно недоступна: платёжный провайдер ещё не подключён. Напишите в Telegram — пополним вручную.",
      },
      { status: 503 },
    );
  }

  let body: { amount?: number };
  try {
    body = (await request.json()) as { amount?: number };
  } catch {
    body = {};
  }

  const amount = Math.round(Number(body.amount) || 0);
  if (amount < MIN_TOPUP_RUB || amount > MAX_TOPUP_RUB) {
    return NextResponse.json(
      {
        error: `Сумма должна быть от ${MIN_TOPUP_RUB} до ${MAX_TOPUP_RUB.toLocaleString("ru-RU")} ₽.`,
      },
      { status: 400 },
    );
  }

  const tokens = tokensForRub(amount);
  const topupId = newId("top");

  run(
    "INSERT INTO topups (id, user_id, amount_rub, tokens, status, provider, created_at) VALUES (?, ?, ?, ?, 'pending', 'yookassa', ?)",
    topupId,
    user.id,
    amount,
    tokens,
    new Date().toISOString(),
  );

  try {
    const payment = await createYooKassaPayment({
      amountRub: amount,
      description: `CheApi: пополнение баланса на ${amount.toLocaleString("ru-RU")} ₽`,
      returnUrl: `${SITE.url}/dashboard/billing?topup=success`,
      metadata: {
        topup_id: topupId,
        user_id: user.id,
        nonce: crypto.randomBytes(8).toString("hex"),
      },
    });

    run(
      "UPDATE topups SET provider_id = ? WHERE id = ?",
      payment.id,
      topupId,
    );

    return NextResponse.json({
      ok: true,
      payment_id: payment.id,
      confirmation_url: payment.confirmation?.confirmation_url,
    });
  } catch (error) {
    run("UPDATE topups SET status = 'failed' WHERE id = ?", topupId);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Не удалось создать платёж. Попробуйте позже.",
      },
      { status: 502 },
    );
  }
}
