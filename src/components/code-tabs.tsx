"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/format";

export type CodeTab = {
  label: string;
  code: string;
  filename?: string;
};

export function CodeTabs({
  tabs,
  className,
}: {
  tabs: CodeTab[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const current = tabs[active];

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1712] shadow-[0_30px_60px_-36px_rgba(11,31,22,0.8)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <div className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "shrink-0 rounded-lg px-2.5 py-1.5 text-[0.75rem] font-medium transition-colors",
                index === active
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white/80",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {current.filename && (
            <span className="hidden font-mono text-[0.68rem] text-white/35 sm:block">
              {current.filename}
            </span>
          )}
          <CopyButton value={current.code} compact />
        </div>
      </div>
      <pre className="code-scroll overflow-x-auto p-4 font-mono text-[0.78rem] leading-[1.75] text-[#d7e5dc] sm:text-[0.8125rem]">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
