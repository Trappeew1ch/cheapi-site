import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/format";

export function CodeBlock({
  code,
  filename,
  className,
  tone = "dark",
}: {
  code: string;
  filename?: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        tone === "dark"
          ? "border-white/10 bg-[#0a1712] shadow-[0_24px_50px_-30px_rgba(11,31,22,0.8)]"
          : "border-line bg-[#fbfaf6]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-3 border-b px-4 py-2.5",
          tone === "dark"
            ? "border-white/10 bg-white/[0.03]"
            : "border-line bg-white",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-[#ff6b5e]/80" />
            <span className="size-2 rounded-full bg-[#ffc94a]/80" />
            <span className="size-2 rounded-full bg-[#3ddc84]/80" />
          </span>
          {filename && (
            <span
              className={cn(
                "truncate font-mono text-[0.72rem]",
                tone === "dark" ? "text-white/45" : "text-muted",
              )}
            >
              {filename}
            </span>
          )}
        </div>
        <CopyButton
          value={code}
          tone={tone}
          className={tone === "light" ? "hover:bg-cream" : ""}
        />
      </div>
      <pre
        className={cn(
          "overflow-x-auto p-4 font-mono text-[0.78rem] leading-[1.75] sm:text-[0.8125rem]",
          tone === "dark" ? "text-[#d7e5dc]" : "text-ink-soft",
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
