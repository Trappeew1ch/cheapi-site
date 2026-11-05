import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Info, ReceiptText, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTopups } from "@/lib/dashboard";
import { isYooKassaConfigured } from "@/lib/yookassa";
import { formatDateTime, formatRub, formatTokens } from "@/lib/format";
import { PageHead, TopupStatus } from "@/components/dashboard-ui";
import {
  PaymentReturnNotice,
  PromoForm,
  TopUpPanel,
} from "@/components/topup-panel";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Баланс и оплата" };

const PROVIDERS: Record<string, string> = {
  yookassa: "ЮKassa",
  promo: "Промо",
  manual: "Вручную",
};

export default async function BillingPage({ searchParams }: PageProps<"/dashboard/billing">) {
  const user = await requireUser();
  const params = await searchParams;
  const topups = getTopups(user.id);

  const balanceRub = (user.balance_tokens * user.rate_rub_per_m) / 1_000_000;
  const paid = topups
    .filter((topup) => topup.status === "succeeded" && topup.provider === "yookassa")
    .reduce((sum, topup) => sum + Number(topup.amount_rub), 0);

  return (
    <div className="grid gap-6">
      {params.topup === "success" && <PaymentReturnNotice />}

      <PageHead
        eyebrow="Оплата"
        title="Баланс и оплата"
        description="Пополняйте баланс в рублях — токены не сгорают. Чем больше сумма, тем ниже цена за миллион."
        actions={
          <Link href="/pricing" className="btn btn-white btn-sm">
            Тарифы
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-muted">
            Баланс
          </span>
          <div className="mt-2 text-[1.5rem] font-bold tracking-[-0.03em]">
            {formatTokens(user.balance_tokens)}
          </div>
          <div className="mt-0.5 text-[0.75rem] text-muted">токенов · ≈ {formatRub(balanceRub)}</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-muted">
            Всего оплачено
          </span>
          <div className="mt-2 text-[1.5rem] font-bold tracking-[-0.03em]">{formatRub(paid, 0)}</div>
          <div className="mt-0.5 text-[0.75rem] text-muted">картой через ЮKassa</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.13em] text-muted">
            Ваша ставка
          </span>
          <div className="mt-2 text-[1.5rem] font-bold tracking-[-0.03em]">
            {formatRub(user.rate_rub_per_m)}
          </div>
          <div className="mt-0.5 text-[0.75rem] text-muted">за 1 млн базовых токенов</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <TopUpPanel configured={isYooKassaConfigured()} />

        <div className="grid content-start gap-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-green-soft text-green-deep">
                <Wallet className="size-4" />
              </span>
              <h2 className="text-[1rem] font-semibold">Как это работает</h2>
            </div>
            <ol className="mt-4 grid gap-3 text-[0.8125rem] leading-relaxed text-muted">
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-cream text-[0.625rem] font-bold text-ink">
                  1
                </span>
                Выберите сумму и оплатите картой или через СБП.
              </li>
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-cream text-[0.625rem] font-bold text-ink">
                  2
                </span>
                Токены зачислятся автоматически, обычно за несколько секунд.
              </li>
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-cream text-[0.625rem] font-bold text-ink">
                  3
                </span>
                Тратьте их на запросы — стоимость видна в истории до списания.
              </li>
            </ol>
            <p className="mt-4 border-t border-line pt-3 text-[0.6875rem] leading-relaxed text-muted">
              Нужен счёт для юрлица или ИП? Напишите на{" "}
              <a href={`mailto:${SITE.email}`} className="font-medium text-green-deep hover:underline">
                {SITE.email}
              </a>{" "}
              — выставим с закрывающими документами.
            </p>
          </div>

          <PromoForm />

          <div className="flex items-start gap-2 rounded-xl border border-line bg-cream/70 px-3.5 py-3 text-[0.75rem] leading-relaxed text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Токены не имеют срока действия. Неизрасходованный остаток можно вернуть по{" "}
              <Link href="/refund" className="font-medium text-green-deep hover:underline">
                политике возврата
              </Link>
              .
            </span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">История платежей</h2>
            <p className="mt-0.5 text-[0.75rem] text-muted">Пополнения и бонусные начисления</p>
          </div>
          <ReceiptText className="size-4 text-muted" aria-hidden="true" />
        </div>

        {topups.length === 0 ? (
          <div className="px-5 py-10 text-center text-[0.875rem] text-muted">
            Платежей пока нет. Первое пополнение появится здесь.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th className="hidden sm:table-cell">Токены</th>
                  <th className="hidden sm:table-cell">Способ</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {topups.map((topup) => (
                  <tr key={topup.id}>
                    <td className="whitespace-nowrap text-[0.75rem] text-muted">
                      {formatDateTime(topup.created_at)}
                    </td>
                    <td className="whitespace-nowrap font-medium">{formatRub(topup.amount_rub)}</td>
                    <td className="hidden whitespace-nowrap text-[0.75rem] sm:table-cell">
                      {formatTokens(topup.tokens)}
                    </td>
                    <td className="hidden whitespace-nowrap text-[0.75rem] text-muted sm:table-cell">
                      {PROVIDERS[topup.provider] ?? topup.provider}
                      {topup.promo_code ? ` · ${topup.promo_code}` : ""}
                    </td>
                    <td>
                      <TopupStatus status={topup.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
