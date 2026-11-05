import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleCheck,
  KeyRound,
  ShieldCheck,
  Terminal,
  Wallet,
} from "lucide-react";
import { Faq, type FaqItem } from "@/components/faq";
import { ModelIcon } from "@/components/model-icon";
import { PricingCalculator } from "@/components/pricing-calculator";
import { BENCHMARKS, BENCHMARK_SOURCE } from "@/content/benchmarks";
import { MODEL_MAP, MODELS } from "@/lib/models";
import { plural } from "@/lib/format";
import { formatWorkTime, hoursForModel } from "@/lib/workload";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "API GPT, Claude, Kimi и DeepSeek в рублях",
  description:
    "GPT, Claude, Kimi, GLM и DeepSeek через один API. 5 млн токенов бесплатно, оплата в рублях, без подписки. Посчитайте, на сколько часов хватит баланса.",
  alternates: { canonical: "/" },
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Что это за сервис?",
    answer:
      "CheApi — один API-ключ для GPT, Claude, Kimi, GLM и DeepSeek с оплатой в рублях. Подключаете base_url, отправляете запросы и платите только за токены — без подписки и зарубежной карты.",
  },
  {
    question: "Что я получу бесплатно?",
    answer:
      "5 млн базовых токенов сразу после регистрации. Этого хватит примерно на 11 часов кодинга на GPT 6.1 Terra или на 1,5 часа на Kimi K3.1 Pro. Карта не нужна.",
  },
  {
    question: "Сколько стоит дальше?",
    answer:
      "От 25 ₽ за пополнение. При 600 ₽ ставка — 11,42 ₽ за 1 млн базовых токенов, цена модели уже включает её коэффициент. Например, стандартный запрос к GPT 6 Astra у нас в 10,5 раза дешевле официальных тарифов.",
  },
  {
    question: "Что сделать прямо сейчас?",
    answer:
      "Зарегистрируйтесь, скопируйте ключ, замените base_url на https://cheapi.ru/v1 и отправьте первый запрос. Всё это занимает пару минут, инструкция — в документации.",
  },
];

const HERO_MODELS = ["gpt-6.1-terra", "gpt-6.1-sol", "kimi-k3.1-pro"];

const RATING_IDS = [
  "claude-opus-5-5",
  "gpt-6-astra",
  "gpt-6.1-sol",
  "claude-sonnet-5-5",
  "kimi-k3.1-pro",
  "deepseek-flash",
];

const STEPS = [
  {
    icon: KeyRound,
    title: "1. Получите ключ",
    text: "Регистрация по email. Ключ и 5 млн токенов — сразу в кабинете.",
  },
  {
    icon: Terminal,
    title: "2. Вставьте base_url",
    text: "https://cheapi.ru/v1 — для OpenAI-клиентов. Для Claude Code — отдельный адрес.",
  },
  {
    icon: Wallet,
    title: "3. Отправьте запрос",
    text: "Токены спишутся из бесплатных 5 млн. Дальше — пополнение от 25 ₽.",
  },
];

export default function HomePage() {
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: SITE.url,
    description: SITE.shortDescription,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: "25",
      description: "Оплата по факту использования, минимальное пополнение 25 ₽",
    },
    featureList: [
      "OpenAI-совместимый API",
      "Anthropic-совместимый API",
      "GPT, Claude, Kimi, GLM, DeepSeek",
      "Оплата в рублях",
      "Без подписки",
    ],
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    logo: `${SITE.url}/icon.svg`,
    email: SITE.email,
    sameAs: [SITE.telegramChannel],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: "ru_RU",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const heroModels = HERO_MODELS.map((id) => MODEL_MAP.get(id)).filter(
    (model): model is NonNullable<typeof model> => Boolean(model),
  );
  const rating = RATING_IDS.map((id) => {
    const model = MODEL_MAP.get(id);
    const benchmark = BENCHMARKS[id];
    return model && benchmark ? { model, benchmark } : null;
  })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => (b.benchmark.score ?? 0) - (a.benchmark.score ?? 0));

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([faqJsonLd, appJsonLd, orgJsonLd, websiteJsonLd]),
        }}
      />

      <section className="relative overflow-hidden">
        <div
          className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_20%,transparent_100%)]"
          aria-hidden="true"
        />
        <div className="container-page relative pb-12 pt-10 sm:pt-14 lg:pb-16 lg:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
            <div className="min-w-0">
              <div className="badge animate-in">
                <span className="flex -space-x-1" aria-hidden="true">
                  {(["gpt", "claude", "kimi", "glm", "deepseek"] as const).map((family) => (
                    <ModelIcon
                      key={family}
                      family={family}
                      size={20}
                      plain
                      className="rounded-full ring-2 ring-cream"
                    />
                  ))}
                </span>
                {MODELS.length} {plural(MODELS.length, "модель", "модели", "моделей")} · 5 млн токенов бесплатно
              </div>

              <h1 className="h1 mt-5 text-balance">
                Нейросети по API
                <br />
                <span className="text-gradient">за рубли, за минуту.</span>
              </h1>

              <p className="lead mt-5 max-w-xl text-pretty">
                GPT, Claude, Kimi, GLM и DeepSeek через один ключ. Даём 5 млн
                токенов бесплатно — хватит примерно на 11 часов кодинга.
                Дальше — от 25 ₽, без подписки.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Получить 5 млн бесплатно
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a href="#pricing" className="btn btn-ghost btn-lg">
                  Сколько хватит мне?
                </a>
              </div>

              <div className="mt-7 grid gap-2 sm:grid-cols-3">
                {STEPS.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-line bg-white/70 p-3.5"
                  >
                    <step.icon className="size-4 text-green-deep" aria-hidden="true" />
                    <div className="mt-2 text-[0.8125rem] font-semibold leading-tight">
                      {step.title}
                    </div>
                    <div className="mt-1 text-[0.75rem] leading-snug text-muted">
                      {step.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8125rem] text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <CircleCheck className="size-4 text-green" aria-hidden="true" />
                  Без карты
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CircleCheck className="size-4 text-green" aria-hidden="true" />
                  Ключ за минуту
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CircleCheck className="size-4 text-green" aria-hidden="true" />
                  Токены не сгорают
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
              <div
                className="absolute -inset-6 rounded-[42px] bg-[radial-gradient(circle_at_30%_20%,rgba(216,255,106,0.55),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(191,227,255,0.65),transparent_55%)] blur-2xl"
                aria-hidden="true"
              />
              <div className="relative rounded-[28px] border border-line bg-white p-5 shadow-lift sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-green-deep">
                      Бесплатно после регистрации
                    </div>
                    <div className="mt-1.5 text-[1.9rem] font-bold leading-none tracking-[-0.04em]">
                      5 млн токенов
                    </div>
                  </div>
                  <span className="rounded-full bg-lime px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink">
                    0 ₽
                  </span>
                </div>

                <div className="mt-4 grid gap-2">
                  {heroModels.map((model) => {
                    const hours = hoursForModel(5_000_000, model.coef, "coding");
                    return (
                      <div
                        key={model.id}
                        className="flex items-center gap-2.5 rounded-xl border border-line bg-cream/45 px-3 py-2.5"
                      >
                        <ModelIcon model={model} size={24} plain className="rounded-lg" />
                        <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium">
                          {model.name}
                        </span>
                        <span className="shrink-0 text-[0.75rem] font-semibold text-green-deep">
                          ≈ {formatWorkTime(hours)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted">
                  Оценка для кодинг-агента: 300 тыс. токенов в час, 4 часа в день.
                </p>

                <Link href="/register" className="btn btn-primary mt-4 w-full">
                  Забрать бесплатно
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <p className="mt-2.5 text-center text-[0.6875rem] text-muted">
                  Потом — пополнение от 25 ₽. Без подписки.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="container-page scroll-mt-24 py-12 lg:py-16">
        <div className="mb-6 max-w-2xl">
          <p className="eyebrow">Цены · Модели · Рейтинг</p>
          <h2 className="h2 mt-2">Один баланс — все модели</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
            Введите сумму — увидите часы работы, цену за миллион
            и во сколько раз стандартный запрос дешевле официальных тарифов.
          </p>
        </div>
        <PricingCalculator />

        <div className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Рейтинг</p>
              <h3 className="h3 mt-2">Бенчмарки моделей</h3>
              <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-muted">
                Независимый {BENCHMARK_SOURCE.index} от {BENCHMARK_SOURCE.name}:
                интеллект, стоимость задачи и скорость. Обновлено{" "}
                {BENCHMARK_SOURCE.updated}.
              </p>
            </div>
            <Link href="/benchmarks" className="btn btn-white btn-sm shrink-0">
              Все бенчмарки
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
            {rating.map(({ model, benchmark }, index) => (
              <Link
                key={model.id}
                href={`/models/${model.id}`}
                className="group flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 hover:bg-cream/50"
              >
                <span className="w-5 font-mono text-[0.6875rem] text-muted">{index + 1}</span>
                <ModelIcon model={model} size={24} plain className="rounded-lg" />
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold">
                  {model.name}
                </span>
                <span className="hidden font-mono text-[0.6875rem] text-muted sm:block">
                  {benchmark.variant}
                </span>
                <span className="flex w-28 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-deep">
                    <span
                      className="block h-full rounded-full bg-green"
                      style={{ width: `${((benchmark.score ?? 0) / 60) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 text-right font-mono text-[0.75rem] font-semibold">
                    {benchmark.score}
                  </span>
                </span>
                <ArrowUpRight className="size-3.5 text-muted" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="mt-3 max-w-3xl text-[0.75rem] leading-relaxed text-muted">
            {BENCHMARK_SOURCE.note} Проверяйте модели на своих задачах.
          </p>
        </div>

        <p className="mt-8 text-[0.75rem] leading-relaxed text-muted">
          Полный каталог — на странице{" "}
          <Link href="/models" className="font-semibold text-green-deep hover:underline">
            моделей
          </Link>
          , детали замеров — на странице{" "}
          <Link href="/benchmarks" className="font-semibold text-green-deep hover:underline">
            бенчмарков
          </Link>
          .
        </p>
      </section>

      <section className="border-y border-line/80 bg-white/45 py-12 lg:py-16">
        <div id="faq" className="container-page grid scroll-mt-24 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Вопросы</p>
            <h2 className="h3 mt-2">Коротко о главном</h2>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-muted">
              Не нашли ответ?{" "}
              <a href={SITE.telegram} className="font-semibold text-green-deep hover:underline">
                Telegram
              </a>{" "}
              или{" "}
              <a href={`mailto:${SITE.email}`} className="font-semibold text-green-deep hover:underline">
                {SITE.email}
              </a>
              .
            </p>
          </div>
          <Faq items={FAQ_ITEMS} />
        </div>
      </section>

      <section className="container-page py-12 lg:py-16">
        <div className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-9 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-green/25 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-xl">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-lime">
              Первый запрос — сегодня
            </p>
            <h2 className="mt-2 text-[1.8rem] font-bold leading-tight tracking-[-0.03em]">
              Заберите 5 млн токенов и проверьте модели
            </h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-white/55">
              Регистрация без карты. Хватит на первые часы кодинга в
              зависимости от модели.
            </p>
          </div>
          <div className="relative mt-5 flex shrink-0 flex-wrap gap-2 lg:mt-0">
            <Link href="/register" className="btn btn-lime">
              Создать аккаунт
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/pricing"
              className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              Посчитать бюджет
            </Link>
          </div>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[0.75rem] text-muted">
          <ShieldCheck className="size-3.5 text-green-deep" aria-hidden="true" />
          Ключи хранятся как хеш. История запросов — без текстов промптов.
        </p>
      </section>
    </main>
  );
}
