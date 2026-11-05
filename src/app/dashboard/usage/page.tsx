import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Clock, Coins, Zap } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { resolveModel } from "@/lib/models";
import { formatPercent, formatRub, formatTokens } from "@/lib/format";
import {
  getAllUsage,
  getDailyUsage,
  getModelUsage,
  getStats,
} from "@/lib/dashboard";
import { PageHead, StatCard, UsageChart } from "@/components/dashboard-ui";
import { UsageTable, type UsageItem } from "@/components/usage-table";

export const metadata: Metadata = { title: "Использование" };

export default async function UsagePage() {
  const user = await requireUser();
  const [stats, daily, models, rows] = await Promise.all([
    Promise.resolve(getStats(user.id, 30)),
    Promise.resolve(getDailyUsage(user.id, 14)),
    Promise.resolve(getModelUsage(user.id, 30, 20)),
    Promise.resolve(getAllUsage(user.id, 200)),
  ]);

  const names: Record<string, string> = {};
  for (const row of rows) names[row.model] = resolveModel(row.model)?.name ?? row.model;
  for (const item of models) names[item.model] = resolveModel(item.model)?.name ?? item.model;

  const modelTotal = models.reduce((sum, item) => sum + item.tokens, 0);

  const items: UsageItem[] = rows.map((row) => ({
    id: row.id,
    model: row.model,
    endpoint: row.endpoint,
    input_tokens: Number(row.input_tokens),
    output_tokens: Number(row.output_tokens),
    cached_tokens: Number(row.cached_tokens),
    charged_tokens: Number(row.charged_tokens),
    cost_rub: Number(row.cost_rub),
    status: Number(row.status),
    latency_ms: Number(row.latency_ms),
    created_at: row.created_at,
  }));

  return (
    <div className="grid gap-6">
      <PageHead
        eyebrow="Аналитика"
        title="Использование"
        description="Сколько токенов уходит, какие модели вы используете и сколько это стоит. Данные обновляются после каждого запроса."
        actions={
          <Link href="/dashboard/billing" className="btn btn-primary btn-sm">
            Пополнить
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Запросы · 30 дней"
          value={stats.requests.toLocaleString("ru-RU")}
          hint={`${stats.todayRequests.toLocaleString("ru-RU")} за 24 часа`}
          icon={<Zap className="size-4" />}
        />
        <StatCard
          label="Токены · 30 дней"
          value={formatTokens(stats.tokens)}
          hint={`${formatTokens(stats.todayTokens)} за 24 часа`}
          icon={<Coins className="size-4" />}
        />
        <StatCard
          label="Расход · 30 дней"
          value={formatRub(stats.rub)}
          hint="по фактическим списаниям"
          icon={<BarChart3 className="size-4" />}
        />
        <StatCard
          label="Средняя задержка"
          value={stats.latency ? `${Math.round(stats.latency).toLocaleString("ru-RU")} мс` : "—"}
          hint="от запроса до ответа"
          icon={<Clock className="size-4" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Динамика расхода</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted">Токены по дням за две недели</p>
          <div className="mt-4">
            <UsageChart data={daily} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">По моделям</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted">Доля в расходе токенов за 30 дней</p>

          {models.length === 0 ? (
            <p className="mt-6 text-[0.8125rem] text-muted">
              Пока нет данных. Отправьте запрос через API или песочницу.
            </p>
          ) : (
            <div className="mt-4 grid gap-3.5">
              {models.slice(0, 7).map((item) => {
                const share = modelTotal ? item.tokens / modelTotal : 0;
                return (
                  <div key={item.model}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[0.8125rem] font-medium">
                        {names[item.model] ?? item.model}
                      </span>
                      <span className="shrink-0 text-[0.6875rem] text-muted">
                        {formatPercent(share)} · {formatRub(item.rub)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-deep">
                        <div
                          className="h-full rounded-full bg-green"
                          style={{ width: `${Math.max(2, share * 100)}%` }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right font-mono text-[0.625rem] text-muted">
                        {formatTokens(item.tokens)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <UsageTable rows={items} names={names} />
    </div>
  );
}
