import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Gauge, Sparkles } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/ui";
import { BenchmarksTable, type BenchmarkRow } from "@/components/benchmarks-table";
import { BENCHMARKS, BENCHMARK_SOURCE, modelsWithBenchmark } from "@/content/benchmarks";
import { MODELS } from "@/lib/models";
import { DEFAULT_TOPUP_RUB, modelPricePerMillion } from "@/lib/pricing";
import { formatRub } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Бенчмарки AI-моделей 2026 — рейтинг Artificial Analysis",
  description:
    "Рейтинг GPT, Claude, Kimi, GLM и DeepSeek по независимому Intelligence Index Artificial Analysis. Баллы, цена задачи и скорость — рядом с ценами CheApi в рублях.",
  alternates: { canonical: "/benchmarks" },
  openGraph: {
    title: "Рейтинг AI-моделей по бенчмаркам — CheApi",
    description:
      "Независимый Intelligence Index, цены CheApi в рублях и стоимость задачи в одном рейтинге.",
    url: "/benchmarks",
    type: "website",
  },
};

export default function BenchmarksPage() {
  const rows: BenchmarkRow[] = MODELS.map((model) => {
    const benchmark = BENCHMARKS[model.id];
    return {
      id: model.id,
      name: model.name,
      family: model.family,
      kind: model.kind,
      coef: model.coef,
      price: modelPricePerMillion(model.coef, DEFAULT_TOPUP_RUB),
      score: benchmark?.score ?? null,
      costPerTask: benchmark?.costPerTask ?? null,
      outputSpeed: benchmark?.outputSpeed ?? null,
      latency: benchmark?.latency ?? null,
      variant: benchmark?.variant ?? "—",
    };
  });

  const scored = rows.filter((row) => row.score !== null);
  const best = [...scored].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const bestValue = [...scored].sort(
    (a, b) => (a.price / (a.score ?? 1)) - (b.price / (b.score ?? 1)),
  )[0];
  const kimi = rows.find((row) => row.id === "kimi-k3.1-pro");

  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Рейтинг AI-моделей CheApi по Artificial Analysis",
            numberOfItems: scored.length,
            itemListElement: [...scored]
              .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
              .map((row, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: row.name,
                url: `${SITE.url}/models/${row.id}`,
              })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
              {
                "@type": "ListItem",
                position: 2,
                name: "Бенчмарки",
                item: `${SITE.url}/benchmarks`,
              },
            ],
          },
        ]}
      />

      <PageHero
        size="compact"
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Бенчмарки" }]}
        eyebrow="Независимый рейтинг"
        title={
          <>
            Рейтинг моделей
            <br />
            <span className="text-gradient">по бенчмаркам</span>
          </>
        }
        description="Интеллект, стоимость задачи и скорость из Artificial Analysis — рядом с ценой CheApi в рублях. Чтобы выбрать модель по данным, а не по обещаниям."
        actions={
          <>
            <Link href="/register" className="btn btn-primary">
              Получить 5 млн токенов
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={BENCHMARK_SOURCE.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Источник: {BENCHMARK_SOURCE.name}
            </a>
          </>
        }
        aside={
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-1 lg:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white p-4">
              <Award className="size-4 text-green-deep" aria-hidden="true" />
              <div className="mt-2 text-[1.4rem] font-bold tracking-[-0.03em]">
                {best?.score ?? "—"}
              </div>
              <div className="text-[0.6875rem] leading-snug text-muted">
                лучший балл · {best?.name ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <Sparkles className="size-4 text-green-deep" aria-hidden="true" />
              <div className="mt-2 text-[1.4rem] font-bold tracking-[-0.03em]">
                {kimi?.score ?? "—"}
              </div>
              <div className="text-[0.6875rem] leading-snug text-muted">
                Kimi K3.1 Pro · 1M контекст
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <Gauge className="size-4 text-green-deep" aria-hidden="true" />
              <div className="mt-2 text-[1.4rem] font-bold tracking-[-0.03em]">
                {modelsWithBenchmark()}
              </div>
              <div className="text-[0.6875rem] leading-snug text-muted">
                моделей с замером
              </div>
            </div>
          </div>
        }
      />

      <section className="container-page py-12 lg:py-16">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.75rem] leading-relaxed text-muted">
            {BENCHMARK_SOURCE.index} · обновлено {BENCHMARK_SOURCE.updated}
          </p>
          {bestValue && (
            <p className="text-[0.75rem] text-muted">
              Лучший балл на рубль:{" "}
              <span className="font-semibold text-ink">{bestValue.name}</span> ·{" "}
              {formatRub(bestValue.price, 2)} за 1 млн
            </p>
          )}
        </div>
        <BenchmarksTable rows={rows} />
        <p className="mt-3 max-w-3xl text-[0.75rem] leading-relaxed text-muted">
          {BENCHMARK_SOURCE.note} Баллы AA измеряют общий интеллект, а не
          стоимость запроса. Цена CheApi за 1 млн указана при пополнении на 600 ₽
          и уже включает коэффициент модели.
        </p>
      </section>

      <section className="border-y border-line/80 bg-white/45 py-12 lg:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Как читать"
            title="Балл — не приговор"
            description="Рейтинг помогает отсеять модели, но решение принимается на ваших задачах. Три правила, которые экономят бюджет."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Смотрите на задачу",
                text: "Высокий Intelligence Index не гарантирует лучший код в вашем репозитории. Проверьте 20–30 реальных задач.",
              },
              {
                title: "Считайте стоимость задачи",
                text: "Цена за миллион и цена решённой задачи — разные вещи. Модель может быть дешевле, но делать больше попыток.",
              },
              {
                title: "Начните с дешёвой",
                text: "DeepSeek и GLM Flash закрывают рутину. Флагманы включайте точечно, когда ошибка дороже токенов.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <h3 className="text-[0.9375rem] font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/models" className="btn btn-white btn-sm">
              Каталог моделей
            </Link>
            <Link href="/pricing" className="btn btn-ghost btn-sm">
              Посчитать стоимость
            </Link>
            <Link href="/blog/kak-vybrat-model" className="btn btn-ghost btn-sm">
              Как выбрать модель
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="rounded-[28px] bg-ink p-6 text-white sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-xl">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-lime">
              Проверить на своих задачах
            </p>
            <h2 className="mt-2 text-[1.7rem] font-bold leading-tight tracking-[-0.03em]">
              5 млн токенов и все модели в одном ключе
            </h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-white/55">
              Хватит, чтобы сравнить Kimi, Claude, GPT и DeepSeek на реальных
              промптах. Без карты и подписки.
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
