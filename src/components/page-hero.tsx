import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export type Crumb = { label: string; href?: string };

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  aside,
  children,
  className,
  size = "default",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
  size?: "default" | "compact";
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-line/70",
        className,
      )}
    >
      <div
        className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_62%_70%_at_50%_0%,#000_10%,transparent_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 -top-24 size-[26rem] rounded-full bg-lime/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="container-page relative pb-12 pt-8 sm:pt-10 lg:pb-16 lg:pt-12"
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Хлебные крошки">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] text-muted">
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                    {index > 0 && (
                      <ChevronRight className="size-3 text-line-strong" aria-hidden="true" />
                    )}
                    {crumb.href && !last ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-ink"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(last && "font-medium text-ink-soft")}
                        aria-current={last ? "page" : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <div
          className={cn(
            "mt-6",
            aside
              ? "grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14"
              : "max-w-3xl",
          )}
        >
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1
              className={cn(
                "text-balance font-bold tracking-[-0.045em]",
                size === "compact"
                  ? "mt-3 text-[clamp(2rem,4vw,3rem)] leading-[1.03]"
                  : "mt-3 text-[clamp(2.35rem,5.2vw,4.1rem)] leading-[0.99]",
              )}
            >
              {title}
            </h1>
            {description && (
              <p className="lead mt-5 max-w-2xl text-pretty">{description}</p>
            )}
            {actions && (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {actions}
              </div>
            )}
            {children}
          </div>
          {aside && <div className="min-w-0">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
