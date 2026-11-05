import type { Metadata } from "next";
import { BarChart3, Coins, ShieldCheck, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/lib/dashboard";
import { formatDate, formatRelative, formatRub, formatTokens } from "@/lib/format";
import { PageHead, StatCard } from "@/components/dashboard-ui";
import { AdminCredit } from "@/components/admin-credit";

export const metadata: Metadata = { title: "Администрирование" };

export default async function AdminPage() {
  const admin = await requireAdmin();
  const { users, totals } = getAdminOverview();

  return (
    <div className="grid gap-6">
      <PageHead
        eyebrow="Админ"
        title="Пользователи"
        description="Балансы, расход и ручные начисления. Все действия фиксируются в истории платежей."
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[0.75rem] text-muted">
            <ShieldCheck className="size-3.5 text-green-deep" />
            {admin.email}
          </span>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Пользователи"
          value={totals.users.toLocaleString("ru-RU")}
          hint="зарегистрировано"
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Суммарный баланс"
          value={formatTokens(totals.tokens)}
          hint="токенов у всех пользователей"
          icon={<Coins className="size-4" />}
        />
        <StatCard
          label="Оборот запросов"
          value={formatRub(totals.rub)}
          hint="списано за всё время"
          icon={<BarChart3 className="size-4" />}
        />
        <StatCard
          label="Запросы"
          value={totals.requests.toLocaleString("ru-RU")}
          hint="обработано всего"
          icon={<BarChart3 className="size-4" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.25fr]">
        <AdminCredit
          users={users.map((user) => ({
            id: user.id,
            email: user.email,
            balance_tokens: Number(user.balance_tokens),
          }))}
          rate={users[0] ? Number(users[0].rate_rub_per_m) : 11.418}
        />

        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[1rem] font-semibold">Активность</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted">Пользователи с наибольшим расходом</p>
          <div className="mt-4 grid gap-3">
            {[...users]
              .sort((a, b) => Number(b.spent) - Number(a.spent))
              .slice(0, 5)
              .map((user) => {
                const max = Math.max(1, ...users.map((item) => Number(item.spent)));
                const share = (Number(user.spent) / max) * 100;
                return (
                  <div key={user.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[0.8125rem] font-medium">{user.email}</span>
                      <span className="shrink-0 text-[0.6875rem] text-muted">
                        {formatRub(Number(user.spent))}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-deep">
                      <div
                        className="h-full rounded-full bg-green"
                        style={{ width: `${Math.max(2, share)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Все пользователи</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted">
            {users.length.toLocaleString("ru-RU")} записей · отсортировано по дате регистрации
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Роль</th>
                <th>Баланс</th>
                <th>Запросы</th>
                <th>Расход</th>
                <th>Последний запрос</th>
                <th>Регистрация</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="font-medium">{user.email}</div>
                    <div className="font-mono text-[0.625rem] text-muted">{user.id.slice(0, 16)}…</div>
                  </td>
                  <td>
                    <span
                      className={
                        user.role === "admin"
                          ? "rounded-full bg-lime-soft px-2 py-0.5 text-[0.6875rem] font-semibold text-ink"
                          : "rounded-full bg-cream px-2 py-0.5 text-[0.6875rem] font-medium text-muted"
                      }
                    >
                      {user.role === "admin" ? "admin" : "user"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-[0.75rem]">
                    {formatTokens(Number(user.balance_tokens))}
                  </td>
                  <td className="whitespace-nowrap text-[0.75rem] text-muted">
                    {Number(user.requests).toLocaleString("ru-RU")}
                  </td>
                  <td className="whitespace-nowrap text-[0.75rem]">{formatRub(Number(user.spent))}</td>
                  <td className="whitespace-nowrap text-[0.75rem] text-muted">
                    {user.last_request ? formatRelative(user.last_request) : "—"}
                  </td>
                  <td className="whitespace-nowrap text-[0.75rem] text-muted">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
