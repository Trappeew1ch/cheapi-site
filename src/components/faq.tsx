import { Plus } from "lucide-react";
import type { ReactNode } from "react";

export type FaqItem = { question: string; answer: ReactNode };

export function Faq({
  items,
  className,
}: {
  items: FaqItem[];
  className?: string;
}) {
  return (
    <div className={className}>
      {items.map((item) => (
        <details key={item.question} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <span className="text-[1rem] font-semibold leading-snug text-ink sm:text-[1.0625rem]">
              {item.question}
            </span>
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-white text-ink-soft transition-transform duration-200 group-open:rotate-45">
              <Plus className="size-3.5" aria-hidden="true" />
            </span>
          </summary>
          <div className="max-w-3xl pb-6 pr-10 text-[0.9375rem] leading-relaxed text-muted">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
