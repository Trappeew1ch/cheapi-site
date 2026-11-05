import type { ReactNode } from "react";
import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/lib/site";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

export function LegalPage({
  title,
  description,
  updated,
  sections,
  intro,
  slug,
}: {
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
  intro?: ReactNode;
  slug: string;
}) {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          description,
          url: `${SITE.url}/${slug}`,
          dateModified: updated,
          publisher: {
            "@type": "Organization",
            name: SITE.legalName,
            url: SITE.url,
          },
        }}
      />

      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Документы", href: "/offer" },
          { label: title },
        ]}
        eyebrow="Документы"
        size="compact"
        title={title}
        description={description}
        actions={
          <p className="text-[0.8125rem] text-muted">
            Редакция от {updated} ·{" "}
            <Link href="/contacts" className="font-medium text-green-deep hover:underline">
              Связаться с нами
            </Link>
          </p>
        }
      />

      <section className="container-page py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
                <FileText className="size-3.5" aria-hidden="true" />
                Содержание
              </div>
              <nav className="mt-3 grid gap-0.5" aria-label="Содержание документа">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-lg px-2 py-1.5 text-[0.75rem] leading-snug text-muted transition-colors hover:bg-cream hover:text-ink"
                  >
                    {index + 1}. {section.title}
                  </a>
                ))}
              </nav>
            </div>
            <div className="mt-3 rounded-2xl border border-line bg-cream/70 p-4">
              <ShieldCheck className="size-4 text-green-deep" aria-hidden="true" />
              <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
                Вопросы по документу —{" "}
                <a
                  href={`mailto:${SITE.email}`}
                  className="font-semibold text-green-deep hover:underline"
                >
                  {SITE.email}
                </a>
              </p>
            </div>
          </aside>

          <article className="prose-che min-w-0 max-w-[760px]">
            {intro && (
              <div className="mb-7 rounded-2xl border border-line bg-white p-5 text-[0.9375rem] leading-relaxed">
                {intro}
              </div>
            )}
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2>
                  {index + 1}. {section.title}
                </h2>
                {section.body}
              </section>
            ))}
            <div className="mt-10 border-t border-line pt-5 text-[0.8125rem] leading-relaxed text-muted">
              <p>
                {SITE.legalName} · ИНН {SITE.legal.inn} · ОГРН {SITE.legal.ogrn}
                <br />
                {SITE.legal.address}
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
