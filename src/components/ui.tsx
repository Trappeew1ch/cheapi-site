import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="h2 text-balance">{title}</h2>
      {description && (
        <p className={cn("lead mt-5 text-pretty", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}

export function Stat({
  value,
  label,
  hint,
}: {
  value: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 px-5 py-4">
      <div className="text-[1.55rem] font-bold leading-none tracking-[-0.03em]">
        {value}
      </div>
      <div className="mt-2 text-[0.8125rem] font-medium text-ink-soft">{label}</div>
      {hint && <div className="mt-1 text-[0.75rem] text-muted">{hint}</div>}
    </div>
  );
}

export function Dot({ color = "var(--color-green)" }: { color?: string }) {
  return (
    <span
      className="inline-block size-2 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}
