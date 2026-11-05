import { NextResponse } from "next/server";
import { fulfillYooKassaTopup } from "@/lib/topups";

export const runtime = "nodejs";

type Notification = {
  type?: string;
  event?: string;
  object?: { id?: string; status?: string };
};

/**
 * YooKassa does not sign notifications, so the payment is re-fetched from the
 * API and validated (status, amount, currency, metadata) before any credit.
 */
export async function POST(request: Request) {
  let body: Notification;
  try {
    body = (await request.json()) as Notification;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const paymentId = body.object?.id;
  if (body.type !== "notification" || !paymentId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (
    body.event !== "payment.succeeded" &&
    body.event !== "payment.canceled"
  ) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (body.event === "payment.canceled") {
    return NextResponse.json({ ok: true });
  }

  const result = await fulfillYooKassaTopup(paymentId);
  if (!result.ok) {
    return NextResponse.json({ ok: false, status: result.status }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
