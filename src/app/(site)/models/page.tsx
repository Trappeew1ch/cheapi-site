import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, ImageIcon, Mic, Sparkles, Terminal } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { ModelsExplorer } from "@/components/models-explorer";
import { ModelIcon } from "@/components/model-icon";
import { FAMILIES, MODEL_COUNT, MODELS, modelsByFamily } from "@/lib/models";
import { DEFAULT_TOPUP_RUB, modelPricePerMillion } from "@/lib/pricing";
import { formatRub, plural } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Каталог моделей — GPT, Claude, Kimi, GLM, DeepSeek",
  description:
    "Все AI-модели CheApi: GPT-6.1, Claude, Kimi K3.1 Pro, GLM-5.3, DeepSeek, изображения, транскрибация и эмбеддинги. Цены за миллион токенов и описания.",
  alternates: { canonical: "/models" },
};

export default async function ModelsPage({ searchParams }: PageProps<"/models">) {
  const { family } = await searchParams;
  const initialFamily =
    family === "gpt" ||
    family === "claude" ||
    family === "kimi" ||
    family === "glm" ||
    family === "deepseek"
      ? family
      : undefined;

  const minPrice = Math.min(
    ...MODELS.map((model) => modelPricePerMillion(model.coef, DEFAULT_TOPUP_RUB)),
  );

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Каталог AI-моделей CheApi",
    numberOfItems: MODELS.length,
    itemListElement: MODELS.map((model, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE.url}/models/${model.id}`,
      name: model.name,
    })),
  };

  return (
    <main>
      <JsonLd data={itemListJsonLd} />

      <PageHero
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Модели" }]}
        eyebrow="Каталог"
        title={
          <>
            {MODEL_COUNT} {plural(MODEL_COUNT, "модель", "модели", "моделей")}.
            <br />
            <span className="text-gradient">Один ключ.</span>
          </>
        }
        description="Текстовые модели, генерация изображений, транскрибация и эмбеддинги. Сравнивайте по цене и задаче — переключение занимает одну строку в запросе."
        actions={
          <>
            <Link href="/register" className="btn btn-primary btn-lg">
              Получить ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="btn btn-ghost btn-lg">
              Цены и токены
            </Link>
          </>
        }
        aside={
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {[
              {
                value: String(MODEL_COUNT),
                label: plural(MODEL_COUNT, "модель", "модели", "моделей"),
                icon: Boxes,
              },
              {
                value: formatRub(minPrice, 2),
                label: "минимальная цена / 1 млн",
                icon: Sparkles,
              },
              { value: "4", label: "семейства", icon: Terminal },
              { value: "3", label: "типа кроме текста", icon: ImageIcon },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-line bg-white/80 px-4 py-4 backdrop-blur"
              >
                <stat.icon className="size-4 text-green-deep" aria-hidden="true" />
                <div className="mt-3 text-[1.35rem] font-bold leading-none tracking-[-0.03em] tabular-nums">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-[0.6875rem] leading-snug text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        }
      />

      <section className="container-page py-10 lg:py-14">
        <ModelsExplorer initialFamily={initialFamily} />

        <div className="mt-14 grid gap-3 lg:grid-cols-4">
          {[
            {
              family: "gpt" as const,
              text: "Код, агенты, изображения и аудио. От экономной Luna до топовой Astra.",
            },
            {
              family: "claude" as const,
              text: "Opus, Sonnet, Haiku и Fable. Сильный код и аккуратная работа с текстом.",
            },
            {
              family: "kimi" as const,
              text: "1M контекст, агентный код и зрение. K3.1 Pro для больших репозиториев.",
            },
            {
              family: "glm" as const,
              text: "Открытая линейка Z.ai: быстро, недорого, хорошо для Cursor и массовых задач.",
            },
            {
              family: "deepseek" as const,
              text: "Самая низкая цена за миллион. Для больших объёмов и фоновой обработки.",
            },
          ].map((item) => {
            const family = FAMILIES[item.family];
            const models = modelsByFamily(item.family);
            return (
              <Link
                key={item.family}
                href={`/models?family=${item.family}`}
                className="card card-hover group p-5"
              >
                <div className="flex items-center justify-between">
                  <ModelIcon family={item.family} size={32} />
                  <span className="font-mono text-[0.6875rem] text-muted">
                    {models.length} {plural(models.length, "модель", "модели", "моделей")}
                  </span>
                </div>
                <h2 className="mt-4 text-[1.0625rem] font-semibold tracking-[-0.02em]">
                  {family.name}
                </h2>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                  {item.text}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-green-deep">
                  Смотреть семейство
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-14 rounded-[28px] border border-line bg-white p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <Mic className="size-4 text-[#1d6ea8]" aria-hidden="true" />
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted">
                Не только текст
              </p>
            </div>
            <h2 className="mt-3 text-[1.5rem] font-bold tracking-[-0.03em]">
              Изображения, аудио и эмбеддинги — по тому же ключу
            </h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
              Генерируйте картинки, расшифровывайте встречи и стройте RAG на
              одном балансе. Формат запросов — как у OpenAI, переписывать код не
              нужно.
            </p>
          </div>
          <div className="mt-6 flex shrink-0 flex-wrap gap-2 lg:mt-0">
            <Link href="/docs#images" className="btn btn-ghost btn-sm">
              Images API
            </Link>
            <Link href="/docs#audio" className="btn btn-ghost btn-sm">
              Audio API
            </Link>
            <Link href="/docs#embeddings" className="btn btn-primary btn-sm">
              Документация
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
