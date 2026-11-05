import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Rss, Send } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { BlogPostCard } from "@/components/blog-post-card";
import { POSTS, BLOG_TAGS } from "@/content/blog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Блог — API, модели и экономика токенов",
  description:
    "Практические статьи о подключении Codex и Claude Code, выборе моделей, кешировании промптов и стоимости токенов. Без маркетинга и воды.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Блог CheApi",
            url: `${SITE.url}/blog`,
            inLanguage: "ru-RU",
            blogPost: POSTS.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              datePublished: post.date,
              dateModified: post.updated ?? post.date,
              url: `${SITE.url}/blog/${post.slug}`,
              author: { "@type": "Organization", name: post.author },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
              { "@type": "ListItem", position: 2, name: "Блог", item: `${SITE.url}/blog` },
            ],
          },
        ]}
      />

      <PageHero
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Блог" }]}
        eyebrow="Блог"
        title={
          <>
            Про API, модели
            <br />
            <span className="text-gradient">и деньги</span>
          </>
        }
        description="Практические разборы без «10 промптов, которые изменят всё». Как подключить инструменты, выбрать модель и не переплатить за токены."
        actions={
          <>
            <Link href="/register" className="btn btn-primary btn-lg">
              Получить API-ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={SITE.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-lg"
            >
              <Send className="size-4" aria-hidden="true" />
              Telegram
            </a>
            <Link href="/blog/rss.xml" className="btn btn-ghost btn-lg">
              <Rss className="size-4" aria-hidden="true" />
              RSS
            </Link>
          </>
        }
      />

      <section className="container-page py-12 lg:py-16">
        <div className="mb-5 flex flex-wrap gap-2">
          {BLOG_TAGS.map((tag) => {
            const count = POSTS.filter((post) => post.tag === tag.name).length;
            return (
              <Link
                key={tag.slug}
                href={`/blog/tag/${tag.slug}`}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                {tag.name}
                <span className="ml-1.5 font-mono text-[0.625rem] text-muted">{count}</span>
              </Link>
            );
          })}
        </div>

        <BlogPostCard post={featured} featured />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="mt-10 relative overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-green/25 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-xl">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-lime">
              Проверить на практике
            </p>
            <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-[-0.03em]">
              Одна статья — это теория. Подключите API и посмотрите на своих задачах.
            </h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-white/55">
              5 млн токенов новым аккаунтам, ключ сразу после регистрации. Карта
              не нужна.
            </p>
          </div>
          <div className="relative mt-5 flex shrink-0 flex-wrap gap-2 lg:mt-0">
            <Link href="/register" className="btn btn-lime">
              Создать ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/pricing"
              className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              Цены
            </Link>
          </div>
        </div>

        <div className="mt-12 rounded-[28px] border border-line bg-[linear-gradient(120deg,#efffd0,#d8ff6a_55%,#b8f05c)] p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-xl">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ink/65">
              Telegram-канал
            </p>
            <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-[-0.03em]">
              Новые статьи и модели — без спама
            </h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-ink/65">
              Пишем, когда есть что сказать: разборы, обновления каталога,
              промокоды и заметки о ценах.
            </p>
          </div>
          <a
            href={SITE.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-5 shrink-0 lg:mt-0"
          >
            Открыть канал
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
