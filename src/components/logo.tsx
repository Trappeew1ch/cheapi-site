import Image from "next/image";
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
      <Image
        src="/icons/brand-tag-v2.png"
        alt=""
        width={36}
        height={36}
        priority
        className="size-9 shrink-0 rounded-[11px] object-cover shadow-[0_6px_16px_-8px_rgba(11,31,22,0.8)] transition-transform duration-300 group-hover:-rotate-3"
      />
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
