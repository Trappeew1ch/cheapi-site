import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CircleCheck,
  KeyRound,
  Plus,
  Send,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { MODEL_MAP, resolveModel } from "@/lib/models";
import { formatRelative, formatRub, formatTokens, plural } from "@/lib/format";
import {
  getDailyUsage,
  getKeysSummary,
  getModelUsage,
  getRecentUsage,
  getStats,
  getTopups,
} from "@/lib/dashboard";
import { CodeBlock } from "@/components/code-block";
import { ModelIcon } from "@/components/model-icon";
import { PageHead, StatCard, StatusPill, UsageChart } from "@/components/dashboard-ui";
import { SITE } from "@/lib/site";
import { formatWorkTime, hoursForModel } from "@/lib/workload";

export const metadata: Metadata = { title: "Обзор" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, daily, models, recent, keys, topups] = await Promise.all([
    Promise.resolve(getStats(user.id)),
    Promise.resolve(getDailyUsage(user.id)),
    Promise.resolve(getModelUsage(user.id)),
    Promise.resolve(getRecentUsage(user.id, 8)),
    Promise.resolve(getKeysSummary(user.id)),
    Promise.resolve(getTopups(user.id, 3)),
  ]);

  const balanceRub = (user.balance_tokens * user.rate_rub_per_m) / 1_000_000;
  const spend = stats.rub;
  const needsOnboarding = keys.active === 0 || stats.requests === 0;
  const displayName = user.email.split("@")[0].split("+")[0];
  const codingModel = MODEL_MAP.get("gpt-6.1-sol");
  const codingHours = hoursForModel(
    user.balance_tokens,
    codingModel?.coef ?? 4,
    "coding",
  );

  return (
    <div className="grid gap-6">
      <PageHead
        eyebrow="Кабинет"
        title={`Привет, ${displayName}`}
        description="Баланс, расход токенов и быстрый старт. Всё, что нужно, чтобы подключить модели к вашему проекту."
        actions={
          <>
            <Link href="/dashboard/keys" className="btn btn-white btn-sm">
              <KeyRound className="size-4" aria-hidden="true" />
              Ключи
            </Link>
            <Link href="/dashboard/billing" className="btn btn-primary btn-sm">
              <Plus className="size-4" aria-hidden="true" />
              Пополнить
            </Link>
          </>
        }
      />

      {needsOnboarding && (
        <section className="rounded-2xl border border-green/25 bg-[linear-gradient(120deg,#f2ffd6,#e4f8ed_70%,#e7f3fd)] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-green-deep">
                Первый запуск
              </p>
              <h2 className="mt-1 text-[1.2rem] font-bold tracking-[-0.02em]">
                5 млн токенов уже на балансе
              </h2>
              <p className="mt-1 max-w-xl text-[0.8125rem] leading-relaxed text-ink-soft">
                Три шага до первого ответа модели. Ключ создаётся в один клик,
                карта для старта не нужна.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-[0.6875rem] font-semibold text-ink-soft">
              {keys.active > 0 ? "Остался 1 шаг" : "Осталось 2 шага"}
            </span>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            <Link
              href="/dashboard/keys"
              className="flex items-start gap-2.5 rounded-xl border border-ink/10 bg-white/65 p-3.5 transition-colors hover:bg-white"
            >
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-green-deep">
                {keys.active > 0 ? (
                  <CircleCheck className="size-4" aria-hidden="true" />
                ) : (
                  <KeyRound className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <span>
                <span className="block text-[0.8125rem] font-semibold">
                  {keys.active > 0 ? "Ключ создан" : "Создайте ключ"}
                </span>
                <span className="mt-0.5 block text-[0.6875rem] leading-snug text-muted">
                  Полная строка показывается один раз
                </span>
              </span>
            </Link>

            <div className="flex items-start gap-2.5 rounded-xl border border-ink/10 bg-white/65 p-3.5">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-green-deep">
                <Terminal className="size-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.8125rem] font-semibold">
                  Подставьте base URL
                </span>
                <code className="mt-0.5 block truncate font-mono text-[0.625rem] text-muted">
                  https://cheapi.ru/v1
                </code>
              </span>
            </div>

            <Link
              href="/dashboard/playground"
              className="flex items-start gap-2.5 rounded-xl border border-ink/10 bg-white/65 p-3.5 transition-colors hover:bg-white"
            >
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white text-green-deep">
                {stats.requests > 0 ? (
                  <CircleCheck className="size-4" aria-hidden="true" />
                ) : (
                  <Send className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <span>
                <span className="block text-[0.8125rem] font-semibold">
                  {stats.requests > 0 ? "Первый запрос готов" : "Отправьте запрос"}
                </span>
                <span className="mt-0.5 block text-[0.6875rem] leading-snug text-muted">
                  Проверьте модель в песочнице
                </span>
              </span>
            </Link>
          </div>

          <Link
            href={keys.active === 0 ? "/dashboard/keys" : "/dashboard/playground"}
            className="btn btn-primary btn-sm mt-4"
          >
            {keys.active === 0 ? "Создать API-ключ" : "Открыть песочницу"}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-white sm:p-6">
          <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-green/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 right-16 size-32 rounded-full bg-lime/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white/45">
                Доступный баланс
              </span>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[0.625rem] font-medium text-white/55">
                {formatRub(user.rate_rub_per_m, 2)} / 1 млн
              </span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[2.4rem] font-bold leading-none tracking-[-0.045em] sm:text-[2.9rem]">
                {formatTokens(user.balance_tokens)}
              </span>
              <span className="pb-1 text-[0.8125rem] text-white/45">токенов</span>
            </div>
            <p className="mt-2 text-[0.8125rem] text-white/55">
              ≈ {formatRub(balanceRub)} · {formatWorkTime(codingHours)} кодинга
              на {codingModel?.name ?? "GPT"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/billing" className="btn btn-lime btn-sm">
                <Wallet className="size-3.5" aria-hidden="true" />
                Пополнить баланс
              </Link>
              <Link
                href="/dashboard/usage"
                className="btn btn-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                История
              </Link>
            </div>
          </div>
        </div>

        <StatCard
          label="Запросы за 30 дней"
          value={stats.requests.toLocaleString("ru-RU")}
          hint={`${stats.todayRequests.toLocaleString("ru-RU")} за последние 24 часа`}
          icon={<Zap className="size-4" />}
        />
        <StatCard
          label="Расход за 30 дней"
          value={formatRub(spend)}
          hint={`${formatTokens(stats.tokens)} токенов · ${stats.latency ? `${Math.round(stats.latency)} мс в среднем` : "пока нет данных"}`}
          icon={<BarChart3 className="size-4" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Расход токенов</h2>
              <p className="mt-0.5 text-[0.75rem] text-muted">Последние 14 дней</p>
            </div>
            <Link
              href="/dashboard/usage"
              className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-green-deep hover:underline"
            >
              Подробнее
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4">
            <UsageChart data={daily} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Быстрый старт</h2>
          <p className="mt-0.5 text-[0.75rem] leading-relaxed text-muted">
            Подставьте ключ и базовый URL — остальное заработает как с OpenAI.
          </p>
          <CodeBlock
            tone="light"
            className="mt-4"
            filename=".env"
            code={`OPENAI_BASE_URL="${SITE.apiBase}"
OPENAI_API_KEY="che_sk_..."`}
          />
          <div className="mt-4 grid gap-2">
            <Link
              href="/dashboard/instructions"
              className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-[0.8125rem] font-medium transition-colors hover:border-line-strong hover:bg-cream"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="size-4 text-green-deep" aria-hidden="true" />
                Инструкции для Codex и Claude Code
              </span>
              <ArrowRight className="size-3.5 text-muted" aria-hidden="true" />
            </Link>
            <Link
              href="/docs"
              className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5 text-[0.8125rem] font-medium transition-colors hover:border-line-strong hover:bg-cream"
            >
              <span className="flex items-center gap-2">
                <ArrowUpRight className="size-4 text-green-deep" aria-hidden="true" />
                API-документация
              </span>
              <ArrowRight className="size-3.5 text-muted" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Последние запросы</h2>
            <Link href="/dashboard/usage" className="text-[0.75rem] font-semibold text-green-deep hover:underline">
              Все запросы
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center text-[0.875rem] text-muted">
              Запросов пока нет. Отправьте первый через песочницу или API.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Модель</th>
                    <th>Токены</th>
                    <th className="hidden sm:table-cell">Стоимость</th>
                    <th>Статус</th>
                    <th className="hidden text-right sm:table-cell">Когда</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => {
                    const model = resolveModel(row.model);
                    return (
                      <tr key={row.id}>
                        <td>
                          <div className="font-medium">{model?.name ?? row.model}</div>
                          <div className="font-mono text-[0.625rem] text-muted">{row.endpoint}</div>
                        </td>
                        <td className="whitespace-nowrap font-mono text-[0.75rem]">
                          {formatTokens(row.charged_tokens)}
                        </td>
                        <td className="hidden whitespace-nowrap text-[0.75rem] sm:table-cell">{formatRub(row.cost_rub)}</td>
                        <td>
                          <StatusPill status={row.status} />
                        </td>
                        <td className="hidden whitespace-nowrap text-right text-[0.75rem] text-muted sm:table-cell">
                          {formatRelative(row.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Модели</h2>
              <Link href="/models" className="text-[0.75rem] font-semibold text-green-deep hover:underline">
                Каталог
              </Link>
            </div>
            {models.length === 0 ? (
              <p className="mt-3 text-[0.8125rem] text-muted">Статистика появится после первых запросов.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {models.slice(0, 4).map((item) => {
                  const model = resolveModel(item.model);
                  const share = stats.tokens ? (item.tokens / stats.tokens) * 100 : 0;
                  return (
                    <div key={item.model}>
                      <div className="flex items-center justify-between gap-2 text-[0.8125rem]">
                        <span className="flex min-w-0 items-center gap-2">
                          <ModelIcon model={model} size={18} plain className="rounded-md" />
                          <span className="truncate font-medium">{model?.name ?? item.model}</span>
                        </span>
                        <span className="shrink-0 text-[0.75rem] text-muted">{formatRub(item.rub)}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-deep">
                        <div
                          className="h-full rounded-full bg-green"
                          style={{ width: `${Math.max(3, Math.min(100, share))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Ключи</h2>
              <Link href="/dashboard/keys" className="text-[0.75rem] font-semibold text-green-deep hover:underline">
                Управлять
              </Link>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[1.6rem] font-bold tracking-[-0.03em]">{keys.active}</span>
              <span className="pb-1 text-[0.75rem] text-muted">
                {plural(keys.active, "активный", "активных", "активных")} из 10
              </span>
            </div>
            <p className="mt-1 text-[0.75rem] text-muted">
              {keys.total > 0
                ? `${keys.total} создано · ${keys.used} использовались`
                : "Создайте первый ключ, чтобы начать."}
            </p>
            <Link href="/dashboard/keys" className="btn btn-white btn-sm mt-4 w-full">
              <KeyRound className="size-3.5" aria-hidden="true" />
              {keys.total === 0 ? "Создать ключ" : "Посмотреть ключи"}
            </Link>
          </div>
        </div>
      </section>

      {topups.length > 0 && (
        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Последние пополнения</h2>
            <Link href="/dashboard/billing" className="text-[0.75rem] font-semibold text-green-deep hover:underline">
              Все платежи
            </Link>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {topups.map((topup) => (
              <div key={topup.id} className="rounded-xl border border-line bg-cream/50 px-3.5 py-3">
                <div className="text-[0.95rem] font-semibold">{formatRub(topup.amount_rub)}</div>
                <div className="mt-0.5 text-[0.6875rem] text-muted">
                  {formatTokens(topup.tokens)} токенов · {formatRelative(topup.created_at)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
