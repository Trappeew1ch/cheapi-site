import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Info,
  Lightbulb,
} from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { RichText } from "@/components/rich-text";
import {
  slugifyHeading,
  type BlogBlock,
} from "@/content/blog";
import { cn } from "@/lib/format";

function Callout({
  tone,
  title,
  text,
}: {
  tone: "tip" | "note" | "warning";
  title?: string;
  text: string;
}) {
  const styles = {
    tip: {
      box: "border-green/25 bg-green-soft/60",
      icon: "bg-green/15 text-green-deep",
      title: "text-green-deep",
      Icon: Lightbulb,
      fallback: "Полезно знать",
    },
    note: {
      box: "border-sky/70 bg-sky/20",
      icon: "bg-sky/50 text-[#1d5f86]",
      title: "text-[#1d5f86]",
      Icon: Info,
      fallback: "Примечание",
    },
    warning: {
      box: "border-peach/60 bg-peach/15",
      icon: "bg-peach/45 text-[#8a4410]",
      title: "text-[#8a4410]",
      Icon: AlertTriangle,
      fallback: "Обратите внимание",
    },
  }[tone];

  return (
    <div className={cn("my-6 rounded-2xl border p-4 sm:p-5", styles.box)}>
      <div className="flex items-start gap-3">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", styles.icon)}>
          <styles.Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className={cn("text-[0.8125rem] font-bold", styles.title)}>
            {title ?? styles.fallback}
          </div>
          <p className="!mb-0 mt-1 text-[0.875rem] leading-relaxed text-ink-soft">
            <RichText text={text} />
          </p>
        </div>
      </div>
    </div>
  );
}

function CtaBlock({
  title,
  text,
  primary,
  secondary,
  note,
}: {
  title: string;
  text: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  note?: string;
}) {
  return (
    <div className="not-prose relative my-8 overflow-hidden rounded-[24px] bg-ink p-6 text-white sm:p-7">
      <div
        className="pointer-events-none absolute -right-12 -top-16 size-52 rounded-full bg-green/25 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 right-24 size-44 rounded-full bg-lime/15 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-lime">
          CheApi
        </p>
        <div className="mt-2 text-[1.3rem] font-bold leading-tight tracking-[-0.02em] sm:text-[1.5rem]">
          {title}
        </div>
        <p className="mt-2 max-w-lg text-[0.875rem] leading-relaxed text-white/60">
          <RichText text={text} />
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={primary.href} className="btn btn-lime btn-sm">
            {primary.label}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="btn btn-sm border border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              {secondary.label}
            </Link>
          )}
        </div>
        {note && <p className="mt-3 text-[0.6875rem] text-white/35">{note}</p>}
      </div>
    </div>
  );
}

function TableBlock({
  head,
  rows,
  caption,
}: {
  head: string[];
  rows: string[][];
  caption?: string;
}) {
  return (
    <div className="my-6">
      {rows.length > 0 && (
        <p className="!mb-2 text-[0.6875rem] text-muted sm:hidden">
          Таблица прокручивается по горизонтали →
        </p>
      )}
      <div className="table-wrap">
        <table className="data-table min-w-[520px]">
          <thead>
            <tr>
              {head.map((cell) => (
                <th key={cell}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    <RichText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <p className="!mb-0 mt-2 text-[0.75rem] text-muted">{caption}</p>}
    </div>
  );
}

export function BlogBlockView({ block }: { block: BlogBlock }) {
  if (block.type === "h2") {
    return (
      <h2 id={slugifyHeading(block.text)} className="scroll-mt-28">
        {block.text}
      </h2>
    );
  }
  if (block.type === "h3") {
    return <h3 id={slugifyHeading(block.text)}>{block.text}</h3>;
  }
  if (block.type === "p") {
    return (
      <p>
        <RichText text={block.text} />
      </p>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote className="my-6 rounded-r-xl border-l-2 border-green bg-green-soft/40 px-5 py-4 text-[1rem] italic text-ink-soft">
        <RichText text={block.text} />
        {block.source && (
          <footer className="mt-2 text-[0.75rem] not-italic text-muted">
            — {block.source}
          </footer>
        )}
      </blockquote>
    );
  }
  if (block.type === "ul") {
    return (
      <ul>
        {block.items.map((item, index) => (
          <li key={index}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "ol") {
    return (
      <ol>
        {block.items.map((item, index) => (
          <li key={index}>
            <RichText text={item} />
          </li>
        ))}
      </ol>
    );
  }
  if (block.type === "callout") {
    return <Callout {...block} />;
  }
  if (block.type === "cta") {
    return <CtaBlock {...block} />;
  }
  if (block.type === "table") {
    return <TableBlock {...block} />;
  }
  if (block.type === "stats") {
    return (
      <div className="not-prose my-6 grid gap-2 sm:grid-cols-3">
        {block.items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-line bg-white p-4">
            <div className="text-[1.35rem] font-bold tracking-[-0.03em] text-ink">
              {item.value}
            </div>
            <div className="mt-1 text-[0.75rem] leading-snug text-muted">{item.label}</div>
          </div>
        ))}
      </div>
    );
  }
  if (block.type === "faq") {
    return (
      <div className="not-prose my-6 grid gap-2">
        {block.items.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-line bg-white px-4 py-3"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.875rem] font-semibold text-ink">
              {item.q}
              <span className="text-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
              <RichText text={item.a} />
            </div>
          </details>
        ))}
      </div>
    );
  }
  return (
    <CodeBlock
      code={block.code}
      filename={block.filename}
      tone="light"
      className="my-5"
    />
  );
}

export function BlogBlocks({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => (
        <BlogBlockView key={index} block={block} />
      ))}
    </>
  );
}

export function faqItemsFromBlocks(blocks: BlogBlock[]) {
  return blocks.flatMap((block) => (block.type === "faq" ? block.items : []));
}

export function wordCountFromBlocks(blocks: BlogBlock[]): number {
  return blocks.reduce((total, block) => {
    switch (block.type) {
      case "p":
      case "h2":
      case "h3":
      case "quote":
      case "callout":
        return total + block.text.split(/\s+/).length;
      case "ul":
      case "ol":
        return total + block.items.join(" ").split(/\s+/).length;
      case "faq":
        return (
          total +
          block.items.map((item) => `${item.q} ${item.a}`).join(" ").split(/\s+/).length
        );
      case "stats":
        return (
          total +
          block.items.map((item) => `${item.value} ${item.label}`).join(" ").split(/\s+/).length
        );
      case "table":
        return (
          total +
          [block.head.join(" "), ...block.rows.flat()].join(" ").split(/\s+/).length
        );
      case "cta":
        return total + `${block.title} ${block.text}`.split(/\s+/).length;
      default:
        return total;
    }
  }, 0);
}
