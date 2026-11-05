"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CreditCard,
  Gift,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  MAX_TOPUP_RUB,
  MIN_TOPUP_RUB,
  TOPUP_PRESETS,
  rateForRub,
  tokensForRub,
  volumeDiscount,
} from "@/lib/pricing";
import { formatRub, formatTokens } from "@/lib/format";
import { cn } from "@/lib/format";

export function TopUpPanel({ configured }: { configured: boolean }) {
  const [amount, setAmount] = useState<number>(TOPUP_PRESETS[0].rub);
  const [custom, setCustom] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effective = custom ? Math.round(Number(custom) || 0) : amount;
  const valid = effective >= MIN_TOPUP_RUB && effective <= MAX_TOPUP_RUB;
  const tokens = valid ? tokensForRub(effective) : 0;
  const rate = valid ? rateForRub(effective) : 0;
  const discount = valid ? volumeDiscount(effective) : 0;

  async function pay() {
    if (!valid) {
      setError(`Сумма должна быть от ${MIN_TOPUP_RUB} до ${MAX_TOPUP_RUB.toLocaleString("ru-RU")} ₽.`);
      return;
    }
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/payments/yookassa/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: effective }),
      });
      const data = (await response.json()) as {
        error?: string;
        confirmation_url?: string;
      };
      if (!response.ok || !data.confirmation_url) {
        throw new Error(data.error ?? "Не удалось создать платёж.");
      }
      window.location.href = data.confirmation_url;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ошибка оплаты.");
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.1rem] font-semibold tracking-[-0.02em]">Пополнить баланс</h2>
          <p className="mt-0.5 text-[0.8125rem] text-muted">
            Один платёж — токены без срока действия.
          </p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-green-soft px-2.5 py-1 text-[0.6875rem] font-semibold text-green-deep sm:inline-flex">
          <Lock className="size-3" />
          ЮKassa
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TOPUP_PRESETS.map((preset) => {
          const selected = !custom && amount === preset.rub;
          return (
            <button
              key={preset.rub}
              type="button"
              onClick={() => {
                setAmount(preset.rub);
                setCustom("");
              }}
              title={preset.hint}
              className={cn(
                "rounded-xl border px-3 py-3 text-left transition-colors",
                selected
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-ink hover:border-line-strong hover:bg-cream",
              )}
            >
              <div className="text-[0.95rem] font-semibold">{formatRub(preset.rub, 0)}</div>
              <div className={cn("mt-0.5 text-[0.6875rem] font-medium", selected ? "text-white/70" : "text-ink-soft")}>
                {preset.label}
              </div>
              <div className={cn("mt-0.5 text-[0.625rem]", selected ? "text-white/50" : "text-muted")}>
                {formatTokens(tokensForRub(preset.rub))} токенов
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted">
        Оценка для топовых моделей: 4 часа кодинга в день, 5 дней в неделю.
      </p>

      <div className="mt-3">
        <label htmlFor="custom-amount" className="label">
          Или своя сумма
        </label>
        <div className="relative">
          <input
            id="custom-amount"
            type="number"
            inputMode="numeric"
            min={MIN_TOPUP_RUB}
            max={MAX_TOPUP_RUB}
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            placeholder={`От ${MIN_TOPUP_RUB} до ${MAX_TOPUP_RUB.toLocaleString("ru-RU")} ₽`}
            className="field pr-10"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.875rem] text-muted">
            ₽
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-cream/60 p-4">
        <div className="flex items-center justify-between text-[0.8125rem]">
          <span className="text-muted">Получите на баланс</span>
          <span className="font-semibold">
            {valid ? `${formatTokens(tokens)} токенов` : "—"}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[0.8125rem]">
          <span className="text-muted">Цена за 1 млн токенов</span>
          <span className="font-semibold">{valid ? formatRub(rate) : "—"}</span>
        </div>
        {discount > 0.01 && (
          <div className="mt-1.5 flex items-center justify-between text-[0.8125rem]">
            <span className="text-muted">Выгода к минимальному тарифу</span>
            <span className="font-semibold text-green-deep">−{Math.round(discount * 100)}%</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {!configured && !error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-peach/50 bg-peach/10 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-[#8a4410]">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          Приём карт ещё не включён. Напишите в Telegram — пополним вручную или подскажем, когда
          оплата станет доступна.
        </div>
      )}

      <button
        type="button"
        onClick={() => void pay()}
        disabled={pending || !valid}
        className="btn btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Создаём платёж…
          </>
        ) : (
          <>
            <CreditCard className="size-4" />
            Оплатить {valid ? formatRub(effective, 0) : ""}
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
      <p className="mt-2.5 text-center text-[0.6875rem] leading-relaxed text-muted">
        МИР, СБП, ЮMoney. Данные карты обрабатывает ЮKassa — мы их не видим.
      </p>
    </div>
  );
}

export function PromoForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function redeem() {
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      const response = await fetch("/api/promo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error ?? "Не удалось активировать промокод.");
      setMessage(data.message ?? "Промокод активирован.");
      setCode("");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ошибка.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-lime-soft text-green-deep">
          <Gift className="size-4" />
        </span>
        <h2 className="text-[1rem] font-semibold">Промокод</h2>
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void redeem();
        }}
      >
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="CHE5M"
          maxLength={32}
          className="field font-mono uppercase"
        />
        <button
          type="submit"
          disabled={pending || code.trim().length === 0}
          className="btn btn-green btn-sm shrink-0 disabled:opacity-50"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          Активировать
        </button>
      </form>
      {message && (
        <p className="mt-2 flex items-center gap-1.5 text-[0.75rem] font-medium text-green-deep">
          <Check className="size-3.5" />
          {message}
        </p>
      )}
      {error && <p className="mt-2 text-[0.75rem] text-danger">{error}</p>}
      <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted">
        Один промокод на аккаунт. Бонусные токены не выводятся.
      </p>
    </div>
  );
}

export function PaymentReturnNotice() {
  const router = useRouter();

  useEffect(() => {
    const timers = [2000, 5000, 9000, 14000].map((delay) =>
      setTimeout(() => router.refresh(), delay),
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [router]);

  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-green/25 bg-green-soft px-4 py-3 text-[0.8125rem] leading-relaxed text-green-deep">
      <Check className="mt-0.5 size-4 shrink-0" />
      <span>
        Спасибо за оплату! Проверяем статус платежа — обычно это занимает несколько секунд.
        Баланс обновится автоматически.
      </span>
    </div>
  );
}
