"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Send,
} from "lucide-react";
import { cn } from "@/lib/format";

function PasswordField({
  value,
  onChange,
  autoComplete,
  placeholder = "Минимум 8 символов",
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        id="password"
        name="password"
        type={visible ? "text" : "password"}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field pl-10 pr-11"
        minLength={8}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-cream hover:text-ink"
        aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-3 text-[0.8125rem] leading-snug text-danger"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    ok?: boolean;
  };
  if (!response.ok) {
    throw new Error(data.error ?? "Что-то пошло не так. Попробуйте ещё раз.");
  }
  return data;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"form" | "demo" | null>(null);

  async function submit(nextEmail: string, nextPassword: string, kind: "form" | "demo") {
    setError(null);
    setPending(kind);
    try {
      await postJson("/api/auth/login", { email: nextEmail, password: nextPassword });
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось войти.");
      setPending(null);
    }
  }

  return (
    <div>
      <p className="eyebrow">Вход</p>
      <h1 className="mt-3 text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[2.35rem]">
        С возвращением
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
        Войдите, чтобы управлять ключами, балансом и историей запросов.
      </p>

      <form
        className="mt-7 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(email, password, "form");
        }}
      >
        {error && <ErrorBox message={error} />}

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="field pl-10"
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="password" className="label mb-0">
              Пароль
            </label>
            <Link
              href="/contacts"
              className="text-[0.75rem] font-medium text-green-deep hover:underline"
            >
              Забыли пароль?
            </Link>
          </div>
          <PasswordField
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Ваш пароль"
          />
        </div>

        <button
          type="submit"
          disabled={pending !== null}
          className="btn btn-primary mt-1 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === "form" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Входим…
            </>
          ) : (
            <>
              Войти
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[0.75rem] text-muted">
        <span className="h-px flex-1 bg-line" />
        или посмотрите изнутри
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        disabled={pending !== null}
        onClick={() => {
          setEmail("demo@cheapi.ru");
          setPassword("demo1234");
          void submit("demo@cheapi.ru", "demo1234", "demo");
        }}
        className="btn btn-white w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending === "demo" ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Открываем демо…
          </>
        ) : (
          <>
            <span className="size-2 rounded-full bg-green" aria-hidden="true" />
            Демо-аккаунт с балансом
          </>
        )}
      </button>
      <p className="mt-2.5 text-center text-[0.75rem] leading-relaxed text-muted">
        demo@cheapi.ru · демо-баланс и история запросов
      </p>

      <p className="mt-8 text-center text-[0.875rem] text-muted">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-semibold text-green-deep hover:underline">
          Создать бесплатно
        </Link>
      </p>
    </div>
  );
}

const RULES = [
  { label: "8 символов или больше", test: (value: string) => value.length >= 8 },
  { label: "Буква и цифра", test: (value: string) => /[a-zA-Zа-яА-Я]/.test(value) && /[0-9]/.test(value) },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telegram, setTelegram] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const passwordOk = RULES.every((rule) => rule.test(password));

  async function submit() {
    setError(null);
    setPending(true);
    try {
      await postJson("/api/auth/register", {
        email,
        password,
        telegram: telegram || undefined,
        consent,
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось создать аккаунт.");
      setPending(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Регистрация</p>
      <h1 className="mt-3 text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[2.35rem]">
        Начните за минуту
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
        Без карты и подписки. На баланс сразу придёт{" "}
        <span className="font-semibold text-ink">5 000 000 токенов</span> — этого
        хватит на первые сотни запросов.
      </p>

      <form
        className="mt-7 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!passwordOk) {
            setError("Пароль должен содержать минимум 8 символов, букву и цифру.");
            return;
          }
          void submit();
        }}
      >
        {error && <ErrorBox message={error} />}

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="field pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">
            Пароль
          </label>
          <PasswordField
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {RULES.map((rule) => {
              const passed = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-1.5 text-[0.75rem] transition-colors",
                    passed ? "text-green-deep" : "text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-3.5 place-items-center rounded-full border",
                      passed ? "border-green bg-green/10" : "border-line-strong",
                    )}
                  >
                    {passed && <Check className="size-2.5" strokeWidth={3} />}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <label htmlFor="telegram" className="label">
            Telegram <span className="font-normal text-muted">— необязательно</span>
          </label>
          <div className="relative">
            <Send
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="telegram"
              name="telegram"
              type="text"
              autoComplete="off"
              value={telegram}
              onChange={(event) => setTelegram(event.target.value)}
              placeholder="@username"
              className="field pl-10"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-white/60 p-3 text-[0.8125rem] leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[#12b76a]"
            required
          />
          <span>
            Принимаю{" "}
            <Link
              href="/offer"
              target="_blank"
              className="font-medium text-green-deep hover:underline"
            >
              пользовательское соглашение
            </Link>{" "}
            и{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-medium text-green-deep hover:underline"
            >
              политику конфиденциальности
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary mt-1 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Создаём аккаунт…
            </>
          ) : (
            <>
              Создать аккаунт
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-[0.75rem] leading-relaxed text-muted">
        Карта не нужна. Приветственные токены не требуют пополнения.
      </p>

      <p className="mt-7 text-center text-[0.875rem] text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-green-deep hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
