import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { fulfillYooKassaTopup, type TopupRow } from "@/lib/topups";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("payment_id");
  if (!id) {
    return NextResponse.json({ error: "Не указан payment_id." }, { status: 400 });
  }

  const topup = get<TopupRow>(
    "SELECT * FROM topups WHERE provider_id = ? AND user_id = ?",
    id,
    user.id,
  );
  if (!topup) {
    return NextResponse.json({ error: "Платёж не найден." }, { status: 404 });
  }

  if (topup.status === "succeeded") {
    return NextResponse.json({
      ok: true,
      status: "succeeded",
      tokens: topup.tokens,
    });
  }

  const result = await fulfillYooKassaTopup(id);
  return NextResponse.json({
    ok: result.ok,
    status: result.status,
    tokens: result.tokens ?? topup.tokens,
  });
}
