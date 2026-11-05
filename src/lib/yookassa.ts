import "server-only";

const API_URL = "https://api.yookassa.ru/v3";

export type YooKassaPayment = {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  amount: { value: string; currency: string };
  confirmation?: { type: string; confirmation_url?: string };
  metadata?: Record<string, string>;
  created_at?: string;
};

export function isYooKassaConfigured(): boolean {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function authHeader(): string {
  const shopId = process.env.YOOKASSA_SHOP_ID ?? "";
  const secret = process.env.YOOKASSA_SECRET_KEY ?? "";
  return `Basic ${Buffer.from(`${shopId}:${secret}`).toString("base64")}`;
}

export async function createYooKassaPayment(input: {
  amountRub: number;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
}): Promise<YooKassaPayment> {
  const idempotenceKey = crypto.randomUUID();

  const response = await fetch(`${API_URL}/payments`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Idempotence-Key": idempotenceKey,
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: {
        value: input.amountRub.toFixed(2),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: input.returnUrl,
      },
      description: input.description.slice(0, 128),
      metadata: input.metadata,
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as YooKassaPayment & {
    description?: string;
    type?: string;
  };

  if (!response.ok) {
    const description =
      (payload as unknown as { description?: string }).description ??
      "ЮKassa отклонила создание платежа.";
    throw new Error(description);
  }

  return payload;
}

export async function getYooKassaPayment(id: string): Promise<YooKassaPayment> {
  const response = await fetch(`${API_URL}/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ЮKassa вернула ${response.status}`);
  }

  return (await response.json()) as YooKassaPayment;
}
