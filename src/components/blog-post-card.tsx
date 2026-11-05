import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { BlogPost } from "@/content/blog";
import { formatDate } from "@/lib/format";

export function BlogPostCard({
  post,
  featured = false,
}: {
  post: BlogPost;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={
        featured
          ? "group relative grid overflow-hidden rounded-[28px] border border-line bg-white p-6 shadow-soft transition-shadow hover:shadow-lift sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:gap-10"
          : "group card card-hover flex flex-col p-6"
      }
    >
      {featured && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_70%_30%,rgba(216,255,106,0.55),transparent_60%),radial-gradient(circle_at_30%_80%,rgba(191,227,255,0.5),transparent_55%)] lg:block"
          aria-hidden="true"
        />
      )}
      <div className="relative min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[0.6875rem]">
          <span className="rounded-full bg-lime-soft px-2.5 py-1 font-bold uppercase tracking-[0.06em] text-green-deep">
            {post.tag}
          </span>
          <span className="text-muted">{formatDate(post.updated ?? post.date)}</span>
          <span className="inline-flex items-center gap-1 text-muted">
            <Clock className="size-3" aria-hidden="true" />
            {post.readingTime} мин
          </span>
          {post.featured && (
            <span className="rounded-full border border-line bg-white px-2.5 py-1 font-semibold text-ink-soft">
              Главное
            </span>
          )}
        </div>
        <h2
          className={
            featured
              ? "mt-4 max-w-2xl text-[clamp(1.6rem,3.2vw,2.4rem)] font-bold leading-[1.06] tracking-[-0.035em] group-hover:text-green-deep"
              : "mt-3 text-[1.25rem] font-bold leading-[1.15] tracking-[-0.025em] group-hover:text-green-deep"
          }
        >
          {post.title}
        </h2>
        <p
          className={
            featured
              ? "mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-muted"
              : "mt-2 line-clamp-3 text-[0.875rem] leading-relaxed text-muted"
          }
        >
          {post.description}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-green-deep">
          Читать
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>

      {featured && (
        <div className="relative mt-8 hidden lg:mt-0 lg:block">
          <div className="rotate-2 rounded-2xl border border-line bg-white/80 p-4 backdrop-blur">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <span className="font-mono text-[0.625rem] text-muted">article.md</span>
              <span className="flex gap-1">
                <span className="size-1.5 rounded-full bg-green" />
                <span className="size-1.5 rounded-full bg-peach" />
                <span className="size-1.5 rounded-full bg-sky" />
              </span>
            </div>
            <div className="mt-3 space-y-1.5">
              {[90, 70, 82, 56, 76, 64].map((width, index) => (
                <div
                  key={index}
                  className="h-2 rounded-full bg-cream-deep"
                  style={{ width: `${width}%` }}
                />
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-ink px-3 py-2 font-mono text-[0.625rem] text-lime">
              npm i -g @anthropic-ai/claude-code
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}
