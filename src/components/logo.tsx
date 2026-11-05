import Link from "next/link";
import { cn } from "@/lib/format";

export function Logo({
  className,
  compact = false,
  tone = "dark",
}: {
  className?: string;
  compact?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <Link
      href="/"
      aria-label="CheApi — на главную"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl",
        tone === "light" ? "text-white" : "text-ink",
        className,
      )}
    >
      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[11px] bg-ink text-lime shadow-[0_6px_16px_-8px_rgba(11,31,22,0.8)] transition-transform duration-300 group-hover:-rotate-3">
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6.5 5.5 12 12l-5.5 6.5" />
          <path d="M13 5.5 18.5 12 13 18.5" opacity=".55" />
        </svg>
        <span className="absolute -right-2 -bottom-2 size-4 rounded-full bg-green/40 blur-[6px]" />
      </span>
      {!compact && (
        <span
          className={cn(
            "text-[1.32rem] font-extrabold leading-none tracking-[-0.04em]",
            tone === "light" ? "text-white" : "text-ink",
          )}
        >
          che
          <span className={tone === "light" ? "text-lime" : "text-green-deep"}>
            api
          </span>
        </span>
      )}
    </Link>
  );
}
