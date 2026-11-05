"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Coins, Loader2 } from "lucide-react";
import { formatTokens } from "@/lib/format";

export function AdminCredit({
  users,
  rate,
}: {
  users: Array<{ id: string; email: string; balance_tokens: number }>;
  rate: number;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [amount, setAmount] = useState("500");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const rub = Math.round(Number(amount) || 0);
  const tokens = Math.round((rub / rate) * 1_000_000);

  async function credit() {
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/credit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, amountRub: rub, note }),
      });
      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error ?? "Не удалось начислить.");
      setNotice({ kind: "ok", text: data.message ?? "Начислено." });
      setNote("");
      router.refresh();
    } catch (cause) {
      setNotice({ kind: "error", text: cause instanceof Error ? cause.message : "Ошибка." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="rounded-2xl border border-line bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void credit();
      }}
    >
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-lime-soft text-green-deep">
          <Coins className="size-4" />
        </span>
        <div>
          <h2 className="text-[1rem] font-semibold">Ручное начисление</h2>
          <p className="text-[0.6875rem] text-muted">Для компенсаций и оплаты по счёту</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <label htmlFor="admin-user" className="label">
            Пользователь
          </label>
          <select
            id="admin-user"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="field text-[0.8125rem]"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} · {formatTokens(user.balance_tokens)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-amount" className="label">
              Сумма, ₽
            </label>
            <input
              id="admin-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="admin-note" className="label">
              Комментарий
            </label>
            <input
              id="admin-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Invoice #123"
              maxLength={60}
              className="field"
            />
          </div>
        </div>

        <div className="rounded-xl border border-line bg-cream/60 px-3.5 py-2.5 text-[0.75rem] text-muted">
          Будет начислено <strong className="text-ink">{formatTokens(tokens)}</strong> токенов по
          ставке {rate.toFixed(2)} ₽ / 1 млн.
        </div>

        {notice && (
          <div
            className={
              notice.kind === "ok"
                ? "flex items-start gap-2 rounded-xl border border-green/25 bg-green-soft px-3 py-2.5 text-[0.75rem] text-green-deep"
                : "flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3 py-2.5 text-[0.75rem] text-danger"
            }
          >
            {notice.kind === "ok" ? (
              <Check className="mt-0.5 size-3.5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            )}
            {notice.text}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || tokens <= 0 || !userId}
          className="btn btn-primary btn-sm w-fit disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Coins className="size-3.5" />}
          Начислить
        </button>
      </div>
    </form>
  );
}
