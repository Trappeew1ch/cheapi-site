import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatDate, formatRub, formatTokens } from "@/lib/format";
import { PageHead } from "@/components/dashboard-ui";
import { LogoutButton, PasswordForm, ProfileForm } from "@/components/settings-forms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Настройки" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="grid gap-6">
      <PageHead
        eyebrow="Аккаунт"
        title="Настройки"
        description="Профиль, пароль и данные аккаунта. Email используется для входа и чеков — изменить его можно через поддержку."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
            <UserRound className="size-3.5" />
            Аккаунт
          </div>
          <div className="mt-2 truncate text-[0.875rem] font-medium">{user.email}</div>
          <div className="mt-0.5 text-[0.6875rem] text-muted">с {formatDate(user.created_at)}</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
            <KeyRound className="size-3.5" />
            Баланс
          </div>
          <div className="mt-2 text-[0.875rem] font-medium">{formatTokens(user.balance_tokens)} токенов</div>
          <div className="mt-0.5 text-[0.6875rem] text-muted">
            ≈ {formatRub((user.balance_tokens * user.rate_rub_per_m) / 1_000_000)} ·{" "}
            {formatRub(user.rate_rub_per_m)} / 1 млн
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
            <ShieldCheck className="size-3.5" />
            Статус
          </div>
          <div className="mt-2 text-[0.875rem] font-medium">
            {user.role === "admin" ? "Администратор" : "Активный аккаунт"}
          </div>
          <div className="mt-0.5 text-[0.6875rem] text-muted">ID: {user.id.slice(0, 14)}…</div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Профиль</h2>
          <p className="mt-0.5 text-[0.8125rem] text-muted">
            Контакт для быстрой связи по вопросам аккаунта.
          </p>
          <div className="mt-4">
            <ProfileForm telegram={user.telegram} />
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <div className="flex items-center gap-2 text-[0.75rem] text-muted">
              <Mail className="size-3.5" />
              Email
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-[0.875rem] font-medium">{user.email}</span>
              <span className="rounded-full bg-cream px-2 py-0.5 text-[0.625rem] font-medium text-muted">
                подтверждён
              </span>
            </div>
            <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-muted">
              Для смены email напишите на{" "}
              <a href={`mailto:${SITE.email}`} className="font-medium text-green-deep hover:underline">
                {SITE.email}
              </a>{" "}
              с адреса регистрации.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Пароль</h2>
          <p className="mt-0.5 text-[0.8125rem] text-muted">
            Регулярная смена пароля снижает риск компрометации.
          </p>
          <div className="mt-4">
            <PasswordForm />
          </div>
        </section>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Сессии</h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
            Выход завершает текущую сессию на этом устройстве. Если вы подозреваете, что кто-то
            получил доступ, смените пароль и отзовите все API-ключи.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LogoutButton />
            <Link href="/dashboard/keys" className="btn btn-ghost btn-sm">
              <KeyRound className="size-3.5" />
              Отозвать ключи
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-cream/70 p-5">
          <h2 className="text-[1rem] font-semibold">Удаление аккаунта</h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
            Удаление необратимо: история запросов и ключи исчезнут. Неизрасходованный остаток
            возвращается по{" "}
            <Link href="/refund" className="font-medium text-green-deep hover:underline">
              политике возврата
            </Link>
            .
          </p>
          <a
            href={`mailto:${SITE.email}?subject=${encodeURIComponent("Удаление аккаунта CheApi")}`}
            className="btn btn-white btn-sm mt-3"
          >
            Запросить удаление
          </a>
        </div>
      </section>
    </div>
  );
}
