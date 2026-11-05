"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/format";

export function CopyButton({
  value,
  label = "Копировать",
  className,
  compact = false,
  tone = "dark",
}: {
  value: string;
  label?: string;
  className?: string;
  compact?: boolean;
  tone?: "dark" | "light";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.75rem] font-medium transition-colors",
        tone === "dark"
          ? "text-white/55 hover:bg-white/10 hover:text-white"
          : "text-muted hover:bg-white/70 hover:text-ink",
        compact && "px-1.5",
        className,
      )}
      aria-label={copied ? "Скопировано" : label}
    >
      {copied ? (
        <Check className="size-3.5 text-lime" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      {!compact && <span>{copied ? "Скопировано" : label}</span>}
    </button>
  );
}
