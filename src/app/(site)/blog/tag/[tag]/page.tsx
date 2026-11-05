import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { BlogPostCard } from "@/components/blog-post-card";
import { BLOG_TAGS, POSTS, tagBySlug } from "@/content/blog";
import { plural } from "@/lib/format";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_TAGS.map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = tagBySlug(slug);
  if (!tag) return { title: "Тема не найдена" };

  return {
    title: `${tag.name} — статьи и инструкции`,
    description: tag.description,
    alternates: { canonical: `/blog/tag/${tag.slug}` },
    openGraph: {
      title: `${tag.name} — блог CheApi`,
      description: tag.description,
      url: `/blog/tag/${tag.slug}`,
      type: "website",
    },
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: slug } = await params;
  const tag = tagBySlug(slug);
  if (!tag) notFound();

  const posts = POSTS.filter((post) => post.tag === tag.name);

  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${tag.name} — блог CheApi`,
            description: tag.description,
            url: `${SITE.url}/blog/tag/${tag.slug}`,
            inLanguage: "ru-RU",
            isPartOf: { "@type": "Blog", name: "Блог CheApi", url: `${SITE.url}/blog` },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: posts.length,
              itemListElement: posts.map((post, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: post.title,
                url: `${SITE.url}/blog/${post.slug}`,
              })),
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
                name: tag.name,
                item: `${SITE.url}/blog/tag/${tag.slug}`,
              },
            ],
          },
        ]}
      />

      <PageHero
        size="compact"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Блог", href: "/blog" },
          { label: tag.name },
        ]}
        eyebrow={`Тема · ${posts.length} ${plural(posts.length, "материал", "материала", "материалов")}`}
        title={tag.name}
        description={tag.description}
        actions={
          <>
            <Link href="/register" className="btn btn-primary">
              Получить API-ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/blog" className="btn btn-ghost">
              Все статьи
            </Link>
          </>
        }
      />

      <section className="container-page py-10 lg:py-14">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
          {BLOG_TAGS.filter((item) => item.slug !== tag.slug).map((item) => (
            <Link
              key={item.slug}
              href={`/blog/tag/${item.slug}`}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-[0.75rem] font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-[28px] bg-ink p-6 text-white sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-xl">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-lime">
              CheApi
            </p>
            <h2 className="mt-2 text-[1.6rem] font-bold leading-tight tracking-[-0.03em]">
              Проверьте модели на своих задачах
            </h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-white/55">
              5 млн токенов новым аккаунтам. Один ключ к GPT, Claude, GLM и
              DeepSeek, оплата в рублях.
            </p>
          </div>
          <Link href="/register" className="btn btn-lime mt-5 shrink-0 lg:mt-0">
            Создать ключ
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
