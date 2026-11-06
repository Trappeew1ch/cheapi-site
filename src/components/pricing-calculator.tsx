"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Info, Sparkles, Zap } from "lucide-react";
import { FAMILIES, MODELS, type FamilyId } from "@/lib/models";
import { OFFICIAL_SOURCE, formatMultiplier, officialMultiplier } from "@/content/official-prices";
import {
  DEFAULT_TOPUP_RUB,
  MAX_TOPUP_RUB,
  MIN_TOPUP_RUB,
  TOPUP_PRESETS,
  modelPricePerMillion,
  rateForRub,
  tokensForRub,
  volumeDiscount,
} from "@/lib/pricing";
import {
  WORK_MODES,
  formatWorkTime,
  hoursForModel,
  rawTokensForModel,
} from "@/lib/workload";
import { cn, formatRub, formatTokens } from "@/lib/format";
import { ModelIcon } from "@/components/model-icon";

const FAMILY_TABS: FamilyId[] = ["gpt", "claude", "kimi", "glm", "deepseek"];

export function PricingCalculator({
  className,
  defaultAmount = DEFAULT_TOPUP_RUB,
}: {
  showAll?: boolean;
  defaultAmount?: number;
  className?: string;
}) {
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [family, setFamily] = useState<FamilyId>("gpt");

  const safeAmount = Math.min(
    MAX_TOPUP_RUB,
    Math.max(MIN_TOPUP_RUB, Number(amount) || MIN_TOPUP_RUB),
  );

  const tokens = tokensForRub(safeAmount);
  const rate = rateForRub(safeAmount);
  const discount = volumeDiscount(safeAmount);

  const rows = useMemo(
    () =>
      MODELS.filter(
        (model) => model.family === family && model.kind === "chat",
      ).sort((a, b) => a.coef - b.coef || a.name.localeCompare(b.name)),
    [family],
  );

  const familyModels = useMemo(
    () => MODELS.filter((model) => model.family === family),
    [family],
  );

  const reference =
    familyModels.find((model) => model.kind === "chat") ?? familyModels[0];
  const referenceHours = reference
    ? hoursForModel(tokens, reference.coef, "coding")
    : 0;
  const referenceRaw = reference
    ? rawTokensForModel(tokens, reference.coef)
    : 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[28px] border border-line bg-paper shadow-soft",
        className,
      )}
    >
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-5 sm:p-7 lg:p-9">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-green-soft text-green-deep">
              <Zap className="size-3.5" aria-hidden="true" />
            </span>
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-green-deep">
              Калькулятор
            </span>
          </div>

          <h2 className="mt-3 text-[1.55rem] font-bold tracking-[-0.035em] sm:text-[1.75rem]">
            Сколько хватит?
          </h2>
          <p className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">
            Введите сумму — покажем токены и часы работы для каждой модели.
          </p>

          <label htmlFor="topup-amount" className="label mt-6">
            Пополнение
          </label>
          <div className="relative">
            <input
              id="topup-amount"
              type="number"
              inputMode="numeric"
              min={MIN_TOPUP_RUB}
              max={MAX_TOPUP_RUB}
              step={25}
              value={Number.isFinite(amount) ? amount : ""}
              onChange={(event) => setAmount(Number(event.target.value))}
              onBlur={() => setAmount(safeAmount)}
              className="field !h-[62px] !rounded-2xl !text-[1.7rem] font-bold tracking-[-0.03em] tabular-nums"
            />
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[1.3rem] font-semibold text-muted">
              ₽
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {TOPUP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-semibold transition-colors",
                  safeAmount === preset
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-white text-ink-soft hover:border-line-strong",
                )}
                aria-pressed={safeAmount === preset}
              >
                {preset.toLocaleString("ru-RU")} ₽
              </button>
            ))}
          </div>

          <div className="mt-5">
            <Link href="/register" className="btn btn-primary w-full">
              Забрать 5 млн и ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="mt-2.5 text-center text-[0.6875rem] text-muted sm:text-left">
            Регистрация без карты. 5 млн токенов уже на балансе.
          </p>
        </div>

        <div className="relative overflow-hidden bg-[linear-gradient(140deg,#efffd0_0%,#d8ff6a_48%,#b7ec5f_100%)] p-5 sm:p-7 lg:p-9">
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border border-ink/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-6 top-6 size-32 rounded-full border border-ink/10"
            aria-hidden="true"
          />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink/55">
                  На баланс
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white/35 px-2 py-1 text-[0.625rem] font-semibold text-ink/70">
                  <Sparkles className="size-3" aria-hidden="true" />
                  +5 млн новым
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                <span className="text-[clamp(2.3rem,5vw,3.1rem)] font-bold leading-none tracking-[-0.05em]">
                  {formatTokens(tokens)}
                </span>
                <span className="text-[0.9375rem] font-semibold text-ink/60">
                  базовых токенов
                </span>
              </div>

              <div className="mt-5 h-px w-full bg-ink/15" />

              <div className="mt-4">
                <div className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink/50">
                  {reference ? `На ${reference.name}` : "Оценка работы"}
                </div>
                <div className="mt-1 text-[1.65rem] font-bold leading-tight tracking-[-0.03em] sm:text-[1.9rem]">
                  {formatWorkTime(referenceHours)}
                </div>
                <p className="mt-1 text-[0.8125rem] leading-snug text-ink/65">
                  {formatTokens(referenceRaw)} реальных токенов модели ·{" "}
                  {WORK_MODES.coding.label.toLowerCase()}
                </p>
              </div>

              <dl className="mt-4 space-y-2 text-[0.8125rem]">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink/55">1 млн базовых</dt>
                  <dd className="font-bold tabular-nums">{formatRub(rate, 2)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-ink/55">Регистрация</dt>
                  <dd className="font-bold">5 млн бесплатно</dd>
                </div>
              </dl>
            </div>

            <p className="relative mt-5 rounded-xl border border-ink/10 bg-white/35 px-3 py-2 text-[0.75rem] leading-snug text-ink/70">
              {discount > 0.005
                ? `Крупный баланс выгоднее на ${Math.round(discount * 100)}%. Токены не сгорают.`
                : "Токены не сгорают. Платите только за фактические запросы."}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-line px-4 py-5 sm:px-6 sm:py-6 lg:px-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-full bg-cream p-1"
            role="tablist"
            aria-label="Семейства моделей"
          >
            {FAMILY_TABS.map((id) => {
              const meta = FAMILIES[id];
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={family === id}
                  onClick={() => setFamily(id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.75rem] font-semibold transition-colors",
                    family === id
                      ? "bg-white text-ink shadow-sm"
                      : "text-muted hover:text-ink",
                  )}
                >
                  <ModelIcon family={id} size={16} plain className="rounded-[5px]" />
                  {meta.name}
                </button>
              );
            })}
          </div>
          <p className="text-[0.6875rem] text-muted">
            {rows.length} моделей · {WORK_MODES.coding.short.toLowerCase()} · 4 ч в день
          </p>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="data-table min-w-[720px]">
            <thead>
              <tr>
                <th>Модель</th>
                <th>Хватит на</th>
                <th>1 млн</th>
                <th>Сравнение с официальными тарифами</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((model) => {
                const price = modelPricePerMillion(model.coef, safeAmount);
                const hours = hoursForModel(tokens, model.coef, "coding");
                const mult = officialMultiplier(model.id, model.coef, rate);
                const cheaper = mult !== null && mult >= 1.05;
                return (
                  <tr key={model.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <ModelIcon
                          model={model}
                          size={24}
                          plain
                          className="rounded-lg"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-[0.8125rem] font-semibold text-ink">
                            {model.name}
                          </div>
                          <div className="font-mono text-[0.625rem] text-muted">
                            {model.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-[0.8125rem] font-semibold tabular-nums">
                      {formatWorkTime(hours)}
                    </td>
                    <td className="whitespace-nowrap text-[0.8125rem] font-semibold tabular-nums">
                      {formatRub(price, 2)}
                    </td>
                    <td className="whitespace-nowrap text-[0.8125rem] tabular-nums">
                      {mult === null ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <span
                          className={
                            cheaper ? "font-semibold text-green-deep" : "text-muted"
                          }
                          title="Стандартный запрос: 10 000 входных + 2 000 выходных токенов. Курс 81 ₽/$."
                        >
                          {formatMultiplier(mult)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-1.5 text-[0.6875rem] leading-relaxed text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Сравнение с официальными тарифами ({OFFICIAL_SOURCE.name}): тот же
            стандартный запрос из 10 000 входных и 2 000 выходных токенов, курс
            81 ₽/$. Полный рейтинг моделей — на странице бенчмарков.
          </p>
          <Link
            href="/docs#billing"
            className="inline-flex shrink-0 items-center gap-1 text-[0.75rem] font-semibold text-green-deep hover:underline"
          >
            Как считается списание
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
