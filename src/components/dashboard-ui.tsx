import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { formatRub, formatTokens } from "@/lib/format";
import type { DailyUsage } from "@/lib/dashboard";

export function PageHead({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-green-deep">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-[1.75rem] font-bold leading-tight tracking-[-0.035em] sm:text-[2.1rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "paper",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "paper" | "ink" | "lime";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        tone === "paper" && "border-line bg-white",
        tone === "ink" && "border-ink bg-ink text-white",
        tone === "lime" && "border-lime bg-lime text-ink",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-[0.6875rem] font-bold uppercase tracking-[0.13em]",
            tone === "paper" ? "text-muted" : "opacity-60",
          )}
        >
          {label}
        </span>
        {icon && (
          <span className={cn("opacity-50", tone === "paper" && "text-ink")}>{icon}</span>
        )}
      </div>
      <div className="mt-2 text-[1.45rem] font-bold tracking-[-0.03em] sm:text-[1.6rem]">
        {value}
      </div>
      {hint && (
        <div
          className={cn(
            "mt-1 text-[0.75rem] leading-snug",
            tone === "paper" ? "text-muted" : "opacity-55",
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

export function UsageChart({
  data,
  metric = "tokens",
}: {
  data: DailyUsage[];
  metric?: "tokens" | "requests";
}) {
  const values = data.map((day) => (metric === "tokens" ? day.tokens : day.requests));
  const max = Math.max(1, ...values);
  const total = values.reduce((sum, value) => sum + value, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[1.5rem] font-bold tracking-[-0.03em]">
            {metric === "tokens" ? formatTokens(total) : total.toLocaleString("ru-RU")}
          </div>
          <div className="text-[0.75rem] text-muted">
            {metric === "tokens" ? "токенов за 14 дней" : "запросов за 14 дней"}
          </div>
        </div>
        <div className="text-right text-[0.75rem] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-green" />
            {metric === "tokens" ? "Расход" : "Запросы"}
          </span>
        </div>
      </div>

      <div
        className="mt-5 flex h-[150px] items-end gap-[5px] sm:gap-2"
        role="img"
        aria-label={`График за 14 дней: ${metric === "tokens" ? `${formatTokens(total)} токенов` : `${total} запросов`}`}
      >
        {data.map((day) => {
          const value = metric === "tokens" ? day.tokens : day.requests;
          const height = value === 0 ? 3 : Math.max(6, Math.round((value / max) * 100));
          return (
            <div key={day.date} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className={cn(
                  "w-full rounded-t-[5px] transition-colors",
                  value === 0 ? "bg-line" : "bg-green/75 group-hover:bg-green-deep",
                )}
                style={{ height: `${height}%` }}
                title={`${day.label}: ${metric === "tokens" ? formatTokens(value) : value} · ${formatRub(day.rub)}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex gap-[5px] sm:gap-2">
        {data.map((day, index) => (
          <div
            key={day.date}
            className="flex-1 truncate text-center text-[0.5625rem] text-muted sm:text-[0.625rem]"
          >
            {index % 2 === 0 ? day.label.split(" ")[0] : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusPill({ status }: { status: number }) {
  const ok = status >= 200 && status < 300;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[0.6875rem] font-medium",
        ok ? "bg-green-soft text-green-deep" : "bg-danger/10 text-danger",
      )}
    >
      <span className={cn("size-1.5 rounded-full", ok ? "bg-green" : "bg-danger")} />
      {status}
    </span>
  );
}

export function TopupStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    succeeded: { label: "Зачислен", className: "bg-green-soft text-green-deep" },
    pending: { label: "Ожидает", className: "bg-peach/25 text-[#9a4a12]" },
    failed: { label: "Ошибка", className: "bg-danger/10 text-danger" },
    canceled: { label: "Отменён", className: "bg-line text-muted" },
  };
  const item = map[status] ?? { label: status, className: "bg-line text-muted" };
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold", item.className)}>
      {item.label}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-white/50 px-6 py-12 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-cream text-green-deep">
        {icon}
      </span>
      <h3 className="mt-3 text-[1rem] font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-[0.8125rem] leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
