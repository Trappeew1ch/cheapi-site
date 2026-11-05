"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/format";

export type StatusComponent = {
  name: string;
  status: "operational" | "degraded" | "down" | "unknown";
  note: string;
};

export type StatusPayload = {
  status: "operational" | "degraded" | "down";
  label: string;
  checkedAt: string;
  components: StatusComponent[];
};

const TONE = {
  operational: {
    dot: "bg-green",
    text: "text-green-deep",
    bg: "bg-green-soft",
    label: "Работает",
  },
  degraded: {
    dot: "bg-[#e8a23a]",
    text: "text-[#9a6a12]",
    bg: "bg-[#fff6e3]",
    label: "Ограничено",
  },
  down: {
    dot: "bg-danger",
    text: "text-danger",
    bg: "bg-[#fef3f2]",
    label: "Недоступно",
  },
  unknown: {
    dot: "bg-muted",
    text: "text-muted",
    bg: "bg-cream-deep",
    label: "Нет данных",
  },
} as const;

export function LiveStatus({ initial }: { initial: StatusPayload }) {
  const [data, setData] = useState(initial);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const response = await fetch("/api/status", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as StatusPayload;
        if (!cancelled) {
          setData(payload);
          setUpdated(true);
        }
      } catch {
        // Keep the last known state.
      }
    }

    const timer = window.setInterval(check, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const tone = TONE[data.status];

  return (
    <div className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <span className={cn("inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em]", tone.bg, tone.text)}>
          <span className={cn("size-1.5 rounded-full", tone.dot, data.status === "operational" && "animate-pulse-dot")} />
          {data.label}
        </span>
        <span className="font-mono text-[0.625rem] text-muted">
          {updated ? "только что" : "live"}
        </span>
      </div>

      <div className="mt-4 text-[1.35rem] font-bold tracking-[-0.03em]">
        {data.status === "operational"
          ? "Все системы работают"
          : data.status === "degraded"
            ? "Частичное ограничение"
            : "Сервис недоступен"}
      </div>
      <p className="mt-1 text-[0.8125rem] text-muted">
        Проверка каждые 60 секунд · API, кабинет и платежи
      </p>

      <div className="mt-5 grid gap-2 border-t border-line pt-4">
        {data.components.slice(0, 5).map((component) => {
          const itemTone = TONE[component.status];
          return (
            <div key={component.name} className="flex items-center justify-between gap-3">
              <span className="text-[0.8125rem] text-ink-soft">{component.name}</span>
              <span className={cn("inline-flex items-center gap-1.5 text-[0.75rem] font-medium", itemTone.text)}>
                <span className={cn("size-1.5 rounded-full", itemTone.dot)} />
                {itemTone.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
