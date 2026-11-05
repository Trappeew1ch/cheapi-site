"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Loader2,
  LogOut,
  Save,
  Send,
  ShieldCheck,
} from "lucide-react";

function Notice({ kind, text }: { kind: "ok" | "error"; text: string }) {
  return (
    <div
      role="status"
      className={
        kind === "ok"
          ? "flex items-start gap-2 rounded-xl border border-green/25 bg-green-soft px-3.5 py-2.5 text-[0.75rem] text-green-deep"
          : "flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-[0.75rem] text-danger"
      }
    >
      {kind === "ok" ? (
        <Check className="mt-0.5 size-3.5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      )}
      {text}
    </div>
  );
}

export function ProfileForm({ telegram }: { telegram: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(telegram ?? "");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function save() {
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ telegram: value }),
      });
      const data = (await response.json()) as { error?: string; telegram?: string | null };
      if (!response.ok) throw new Error(data.error ?? "Не удалось сохранить.");
      setNotice({ kind: "ok", text: "Профиль обновлён." });
      setValue(data.telegram ?? "");
      router.refresh();
    } catch (cause) {
      setNotice({ kind: "error", text: cause instanceof Error ? cause.message : "Ошибка." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      {notice && <Notice {...notice} />}
      <div>
        <label htmlFor="telegram" className="label">
          Telegram для поддержки
        </label>
        <div className="relative">
          <Send
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="telegram"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="@username"
            maxLength={64}
            className="field pl-10"
          />
        </div>
        <p className="mt-1.5 text-[0.6875rem] text-muted">
          Используется только для связи по вашему аккаунту. Не публикуется.
        </p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-sm w-fit disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
        Сохранить
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function save() {
    if (next !== confirm) {
      setNotice({ kind: "error", text: "Новые пароли не совпадают." });
      return;
    }
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Не удалось сменить пароль.");
      setNotice({ kind: "ok", text: "Пароль изменён. Новые входы — только с новым паролем." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (cause) {
      setNotice({ kind: "error", text: cause instanceof Error ? cause.message : "Ошибка." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      {notice && <Notice {...notice} />}
      <div>
        <label htmlFor="current-password" className="label">
          Текущий пароль
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          className="field"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="new-password" className="label">
            Новый пароль
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            minLength={8}
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="label">
            Повторите пароль
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            minLength={8}
            className="field"
            required
          />
        </div>
      </div>
      <p className="text-[0.6875rem] text-muted">
        Минимум 8 символов, хотя бы одна буква и одна цифра.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-sm w-fit disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5" />}
        Сменить пароль
      </button>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          router.replace("/");
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
      className="btn btn-ghost btn-sm w-fit disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
      Выйти из аккаунта
    </button>
  );
}
