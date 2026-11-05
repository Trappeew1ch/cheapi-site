import "server-only";
import { get, run, transaction } from "@/lib/db";
import { getYooKassaPayment } from "@/lib/yookassa";

export type TopupRow = {
  id: string;
  user_id: string;
  amount_rub: number;
  tokens: number;
  status: string;
  provider: string;
  provider_id: string | null;
  promo_code: string | null;
  created_at: string;
  paid_at: string | null;
};

export function getTopupById(id: string): TopupRow | undefined {
  return get<TopupRow>("SELECT * FROM topups WHERE id = ?", id);
}

export function getTopupByProviderId(providerId: string): TopupRow | undefined {
  return get<TopupRow>(
    "SELECT * FROM topups WHERE provider_id = ? ORDER BY created_at DESC LIMIT 1",
    providerId,
  );
}

/**
 * Verifies the payment with YooKassa and credits the balance exactly once.
 * Safe to call from both the webhook and the return page.
 */
export async function fulfillYooKassaTopup(providerId: string): Promise<{
  ok: boolean;
  status: string;
  tokens?: number;
}> {
  const topup = getTopupByProviderId(providerId);
  if (!topup) return { ok: false, status: "not_found" };
  if (topup.status === "succeeded") {
    return { ok: true, status: "succeeded", tokens: topup.tokens };
  }

  let payment;
  try {
    payment = await getYooKassaPayment(providerId);
  } catch {
    return { ok: false, status: "provider_error" };
  }

  if (payment.status !== "succeeded" || !payment.paid) {
    if (payment.status === "canceled") {
      run("UPDATE topups SET status = 'canceled' WHERE id = ?", topup.id);
    }
    return { ok: false, status: payment.status };
  }

  const amount = Number(payment.amount.value);
  if (
    payment.amount.currency !== "RUB" ||
    !Number.isFinite(amount) ||
    Math.abs(amount - Number(topup.amount_rub)) > 0.01
  ) {
    return { ok: false, status: "amount_mismatch" };
  }

  if (
    payment.metadata?.topup_id &&
    payment.metadata.topup_id !== topup.id
  ) {
    return { ok: false, status: "metadata_mismatch" };
  }

  const paidAt = new Date().toISOString();
  transaction(() => {
    const current = getTopupById(topup.id);
    if (!current || current.status === "succeeded") return;

    run(
      "UPDATE topups SET status = 'succeeded', paid_at = ? WHERE id = ?",
      paidAt,
      topup.id,
    );
    run(
      "UPDATE users SET balance_tokens = balance_tokens + ?, rate_rub_per_m = ? WHERE id = ?",
      topup.tokens,
      (Number(topup.amount_rub) / topup.tokens) * 1_000_000,
      topup.user_id,
    );
  });

  return { ok: true, status: "succeeded", tokens: topup.tokens };
}
