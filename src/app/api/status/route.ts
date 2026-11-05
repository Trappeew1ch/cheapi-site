import { NextResponse } from "next/server";
import { get } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = true;
  try {
    get<{ ok: number }>("SELECT 1 AS ok");
  } catch {
    dbOk = false;
  }

  const upstream = Boolean(process.env.CODEX_SALE_API_KEY);
  const payments = Boolean(
    process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY,
  );

  const components = [
    {
      name: "API-шлюз",
      status: dbOk ? ("operational" as const) : ("down" as const),
      note: "Маршрутизация и биллинг",
    },
    {
      name: "База данных",
      status: dbOk ? ("operational" as const) : ("down" as const),
      note: "Аккаунты, ключи, история",
    },
    {
      name: "AI-провайдер",
      status: upstream ? ("operational" as const) : ("degraded" as const),
      note: upstream ? "Upstream подключён" : "Ключ провайдера не настроен",
    },
    {
      name: "Платежи",
      status: payments ? ("operational" as const) : ("degraded" as const),
      note: payments ? "ЮKassa подключена" : "Ожидает подключения ЮKassa",
    },
    {
      name: "Кабинет",
      status: "operational" as const,
      note: "Веб-интерфейс",
    },
  ];

  const overall = components.some((component) => component.status === "down")
    ? ("down" as const)
    : components.some((component) => component.status === "degraded")
      ? ("degraded" as const)
      : ("operational" as const);

  return NextResponse.json(
    {
      status: overall,
      label:
        overall === "operational"
          ? "Все системы работают"
          : overall === "degraded"
            ? "Есть ограничения"
            : "Сервис недоступен",
      checkedAt: new Date().toISOString(),
      components,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
