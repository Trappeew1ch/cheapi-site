import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Send,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { CopyButton } from "@/components/copy-button";
import {
  BlogBlocks,
  faqItemsFromBlocks,
  wordCountFromBlocks,
} from "@/components/blog-blocks";
import { POSTS, getPost, relatedPosts, slugifyHeading, tagSlug, type BlogBlock } from "@/content/blog";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Статья не найдена" };

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: [post.tag],
      images: [
        {
          url: `/blog/${post.slug}/og`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [`/blog/${post.slug}/og`],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const headings = post.blocks.filter(
    (block): block is Extract<BlogBlock, { type: "h2" }> => block.type === "h2",
  );
  const related = relatedPosts(post, 3);
  const faqItems = faqItemsFromBlocks(post.blocks);
  const wordCount = wordCountFromBlocks(post.blocks);
  const updated = post.updated ?? post.date;

  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: updated,
            inLanguage: "ru-RU",
            author: { "@type": "Organization", name: post.author, url: SITE.url },
            publisher: {
              "@type": "Organization",
              name: SITE.name,
              url: SITE.url,
              logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE.url}/blog/${post.slug}` },
            url: `${SITE.url}/blog/${post.slug}`,
            articleSection: post.tag,
            keywords: post.keywords?.join(", "),
            wordCount,
            image: `${SITE.url}/blog/${post.slug}/og`,
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: `${SITE.url}/blog/${post.slug}/og`,
              width: 1200,
              height: 630,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
              { "@type": "ListItem", position: 2, name: "Блог", item: `${SITE.url}/blog` },
              {
                "@type": "ListItem",
                position: 3,
                name: post.tag,
                item: `${SITE.url}/blog/tag/${tagSlug(post.tag)}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: post.title,
                item: `${SITE.url}/blog/${post.slug}`,
              },
            ],
          },
          ...(faqItems.length > 0
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqItems.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: item.a },
                  })),
                },
              ]
            : []),
        ]}
      />

      <PageHero
        size="compact"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Блог", href: "/blog" },
          { label: post.tag, href: `/blog/tag/${tagSlug(post.tag)}` },
          { label: post.title },
        ]}
        eyebrow={`${post.tag} · ${post.updated ? `обновлено ${formatDate(updated)}` : formatDate(post.date)}`}
        title={post.title}
        description={post.description}
        actions={
          <div className="flex flex-wrap items-center gap-3 text-[0.8125rem] text-muted">
            <span className="font-medium text-ink-soft">{post.author}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingTime} мин чтения
            </span>
            <CopyButton
              value={`${SITE.url}/blog/${post.slug}`}
              label="Скопировать ссылку"
              tone="light"
              className="border border-line bg-white px-2.5 py-1.5 hover:bg-cream"
            />
          </div>
        }
      />

      <section className="container-page py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-14">
          <article className="prose-che min-w-0 max-w-[720px]">
            {headings.length > 0 && (
              <details className="not-prose mb-6 rounded-2xl border border-line bg-white p-4 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[0.8125rem] font-semibold">
                  Содержание статьи
                  <span className="text-muted">+</span>
                </summary>
                <nav className="mt-3 grid gap-1" aria-label="Содержание статьи">
                  {headings.map((heading) => (
                    <a
                      key={heading.text}
                      href={`#${slugifyHeading(heading.text)}`}
                      className="rounded-lg px-2 py-1.5 text-[0.8125rem] text-ink-soft hover:bg-cream"
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </details>
            )}

            <BlogBlocks blocks={post.blocks} />

            <div className="mt-12 rounded-2xl border border-line bg-white p-6">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-green-deep">
                Попробовать
              </p>
              <h2 className="!mt-2 !mb-2 text-[1.35rem]">5 млн токенов на тесты</h2>
              <p className="!mb-4 text-[0.875rem]">
                Зарегистрируйтесь, получите ключ и проверьте модели на своих
                задачах. Карта не нужна.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/register" className="btn btn-primary btn-sm">
                  Создать аккаунт
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
                <Link href="/pricing" className="btn btn-ghost btn-sm">
                  Посчитать бюджет
                </Link>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-soft hover:text-ink"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Все статьи
              </Link>
              <a
                href={SITE.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-green-deep hover:underline"
              >
                <Send className="size-3.5" aria-hidden="true" />
                Обсудить в Telegram
              </a>
            </div>
          </article>

          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            {headings.length > 0 && (
              <div className="card p-5">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
                  В статье
                </p>
                <nav className="mt-3 grid gap-1 text-[0.8125rem]" aria-label="Содержание статьи">
                  {headings.map((heading) => (
                    <a
                      key={heading.text}
                      href={`#${slugifyHeading(heading.text)}`}
                      className="rounded-lg px-2 py-1.5 text-ink-soft transition-colors hover:bg-cream hover:text-ink"
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            <div className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-ink font-mono text-[0.6875rem] font-bold text-lime">
                  CA
                </span>
                <div>
                  <p className="text-[0.8125rem] font-semibold">{post.author}</p>
                  <p className="text-[0.6875rem] text-muted">Редакция CheApi</p>
                </div>
              </div>
              <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
                Проверяем конфиги и цены на реальных запросах. Обновлено{" "}
                {formatDate(updated)}.
              </p>
              <Link
                href="/editorial"
                className="mt-2 inline-flex text-[0.75rem] font-medium text-green-deep hover:underline"
              >
                Как мы проверяем материалы
              </Link>
              <p className="mt-3 border-t border-line pt-3 text-[0.6875rem] leading-relaxed text-muted">
                CheApi — независимый API-сервис. Не аффилирован с OpenAI,
                Anthropic, Z.ai или DeepSeek.
              </p>
            </div>

            <a
              href={SITE.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-line bg-lime-soft/50 p-4 text-[0.8125rem] font-semibold hover:border-line-strong"
            >
              Telegram-канал
              <ArrowUpRight className="size-4 text-muted" aria-hidden="true" />
            </a>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line/80 bg-white/45 py-14">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Читать дальше</p>
                <h2 className="h3 mt-2">Похожие материалы</h2>
              </div>
              <Link href="/blog" className="hidden btn btn-white btn-sm sm:inline-flex">
                Все статьи
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group card card-hover flex flex-col p-5"
                >
                  <div className="flex items-center gap-2 text-[0.6875rem] text-muted">
                    <span className="rounded-full bg-lime-soft px-2 py-0.5 font-bold uppercase tracking-[0.06em] text-green-deep">
                      {item.tag}
                    </span>
                    <span>{item.readingTime} мин</span>
                  </div>
                  <h3 className="mt-3 text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] group-hover:text-green-deep">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-green-deep">
                    Читать
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
