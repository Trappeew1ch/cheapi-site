import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  KeyRound,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { CodeBlock } from "@/components/code-block";
import { Faq, type FaqItem } from "@/components/faq";
import { SectionHeading } from "@/components/ui";
import { MODEL_MAP } from "@/lib/models";
import { DEFAULT_TOPUP_RUB, modelPricePerMillion } from "@/lib/pricing";
import { formatCoef, formatRub } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "API Claude в России — Opus, Sonnet и Haiku с оплатой рублями",
  description:
    "Доступ к Claude Opus 5.5, Sonnet 5.5 и Haiku 5.5 через Anthropic- и OpenAI-совместимый API. Claude Code без подписки, оплата рублями, 5 млн токенов в подарок.",
  alternates: { canonical: "/api-claude" },
  openGraph: {
    title: "API Claude в России — CheApi",
    description:
      "Claude Opus, Sonnet и Haiku через один ключ. Claude Code без подписки, оплата в рублях.",
    url: "/api-claude",
    type: "website",
  },
};

const FAQ: FaqItem[] = [
  {
    question: "Можно ли пользоваться Claude Code без подписки?",
    answer:
      "Да. Claude Code подключается к Anthropic-совместимому API через ANTHROPIC_BASE_URL и ANTHROPIC_AUTH_TOKEN. Вы платите за токены, а не за месяц. Стартовые 5 млн токенов покрывают первые тесты.",
  },
  {
    question: "Какие модели Claude доступны?",
    answer:
      "Claude Opus 5.5, Sonnet 5.5, Haiku 5.5 и Fable 5.1. Opus — для сложных задач, Sonnet — универсальная модель для кода, Haiku — для быстрых и дешёвых запросов.",
  },
  {
    question: "Нужен ли VPN?",
    answer:
      "Нет. Запросы идут на cheapi.ru. Для Claude Code укажите https://cheapi.ru без /v1 на конце; для OpenAI-совместимых клиентов — https://cheapi.ru/v1.",
  },
  {
    question: "Сколько стоит Claude Sonnet 5.5?",
    answer:
      "125,60 ₽ за 1 млн токенов при пополнении на 600 ₽. Запрос на 12 000 входных и 2 000 выходных токенов стоит около 1,51 ₽. Точный расчёт — в калькуляторе.",
  },
  {
    question: "Можно ли оплатить по счёту для юрлица?",
    answer:
      "Да, напишите на hello@cheapi.ru. Согласуем счёт, договор и закрывающие документы. Для физлиц доступны карты РФ, СБП и ЮMoney.",
  },
];

const CLAUDE_IDS = ["claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5", "claude-fable-5-1"];
const claudeModels = CLAUDE_IDS.map((id) => MODEL_MAP.get(id)).filter(
  (model): model is NonNullable<typeof model> => Boolean(model),
);

export default function ApiClaudePage() {
  const sonnet = MODEL_MAP.get("claude-sonnet-5-5");
  const sonnetPrice = sonnet ? modelPricePerMillion(sonnet.coef, DEFAULT_TOPUP_RUB) : 0;

  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Доступ к API Claude через CheApi",
            description:
              "Anthropic-совместимый API к Claude Opus, Sonnet и Haiku с оплатой в рублях и подключением Claude Code без подписки.",
            brand: { "@type": "Brand", name: SITE.name },
            category: "AI API",
            url: `${SITE.url}/api-claude`,
            offers: {
              "@type": "Offer",
              priceCurrency: "RUB",
              price: sonnetPrice.toFixed(2),
              description: "за 1 млн токенов Claude Sonnet 5.5 при пополнении 600 ₽",
              availability: "https://schema.org/InStock",
              url: `${SITE.url}/api-claude`,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
              { "@type": "ListItem", position: 2, name: "API Claude", item: `${SITE.url}/api-claude` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: String(item.answer) },
            })),
          },
        ]}
      />

      <PageHero
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "API Claude" }]}
        eyebrow="Anthropic Claude · оплата в рублях"
        title={
          <>
            API Claude в России
            <br />
            <span className="text-gradient">и Claude Code без подписки</span>
          </>
        }
        description="Opus 5.5, Sonnet 5.5, Haiku 5.5 и Fable 5.1 через один ключ. Anthropic-совместимый endpoint для Claude Code и OpenAI-совместимый для остальных клиентов."
        actions={
          <>
            <Link href="/register" className="btn btn-primary btn-lg">
              Получить ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/claude-code" className="btn btn-ghost btn-lg">
              Настройка Claude Code
            </Link>
          </>
        }
        aside={
          <div className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
            <span className="badge">Claude Sonnet 5.5</span>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-[2.4rem] font-bold leading-none tracking-[-0.05em] tabular-nums">
                {formatRub(sonnetPrice, 2).replace(" ₽", "")}
              </span>
              <span className="text-[0.875rem] text-muted">₽ / 1 млн токенов</span>
            </div>
            <p className="mt-1.5 text-[0.75rem] text-muted">
              при пополнении на {formatRub(DEFAULT_TOPUP_RUB, 0)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 text-[0.8125rem]">
              <div>
                <div className="text-muted">Старт</div>
                <div className="mt-0.5 font-semibold">5 млн токенов</div>
              </div>
              <div>
                <div className="text-muted">Минимум</div>
                <div className="mt-0.5 font-semibold">25 ₽</div>
              </div>
            </div>
            <Link href="/register" className="btn btn-primary mt-5 w-full">
              <KeyRound className="size-4" aria-hidden="true" />
              Создать ключ
            </Link>
            <p className="mt-3 text-center text-[0.6875rem] text-muted">
              Claude Code подключается за две переменные.
            </p>
          </div>
        }
      />

      <section className="container-page py-14 lg:py-20">
        <SectionHeading
          eyebrow="Модели и цены"
          title="Claude для кода и текста"
          description="Вход и выход стоят одинаково, кешированный вход дешевле на 60%. Цена за миллион уже включает коэффициент модели."
        />
        <div className="table-wrap mt-8">
          <table className="data-table min-w-[640px]">
            <thead>
              <tr>
                <th>Модель</th>
                <th>Коэффициент</th>
                <th>1 млн токенов</th>
                <th>Когда выбрать</th>
              </tr>
            </thead>
            <tbody>
              {claudeModels.map((model) => (
                <tr key={model.id}>
                  <td>
                    <Link
                      href={`/models/${model.id}`}
                      className="font-semibold text-ink hover:text-green-deep"
                    >
                      {model.name}
                    </Link>
                  </td>
                  <td className="tabular-nums text-ink-soft">{formatCoef(model.coef)}</td>
                  <td className="whitespace-nowrap font-semibold tabular-nums">
                    {formatRub(modelPricePerMillion(model.coef, DEFAULT_TOPUP_RUB), 2)}
                  </td>
                  <td className="text-[0.8125rem] text-muted">{model.bestFor.slice(0, 2).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
          Sonnet 5.5 — рабочая модель для Claude Code. Opus 5.5 включайте для
          сложной архитектуры, Haiku 5.5 — для быстрых правок. Подробный разбор
          стоимости — в статье{" "}
          <Link
            href="/blog/claude-code-bez-podpiski"
            className="font-medium text-green-deep hover:underline"
          >
            «Claude Code без подписки»
          </Link>
          .
        </p>
      </section>

      <section className="border-y border-line/80 bg-white/45 py-14 lg:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Claude Code"
              title="Две переменные вместо подписки"
              description="Claude Code работает с Anthropic-совместимым API. Укажите адрес CheApi и ключ, без /v1 на конце."
            />
            <div className="mt-6 grid gap-2.5">
              {[
                "Opus, Sonnet и Haiku на одном балансе",
                "Оплата за токены, без месячной подписки",
                "История запросов и стоимость каждой сессии",
                "Поддержка на русском, если конфиг не заводится",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-[0.875rem] text-ink-soft">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-green-soft text-green-deep">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/blog/claude-code-bez-podpiski" className="btn btn-white btn-sm">
                <Terminal className="size-4" aria-hidden="true" />
                Инструкция
              </Link>
              <Link href="/models" className="btn btn-ghost btn-sm">
                Все модели
              </Link>
            </div>
          </div>
          <CodeBlock
            tone="dark"
            filename="bash"
            code={`export ANTHROPIC_BASE_URL="https://cheapi.ru"
export ANTHROPIC_AUTH_TOKEN="che_sk_ваш_ключ"

claude`}
          />
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <SectionHeading
          eyebrow="Почему CheApi"
          title="Один ключ, понятный счёт"
          description="Claude часто нужен вместе с GPT и DeepSeek. Держите их на одном балансе и переключайтесь одной строкой."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              title: "Быстрый старт",
              text: "5 млн токенов, ключ сразу, инструкция для Claude Code и SDK.",
            },
            {
              icon: ShieldCheck,
              title: "Ключи под контролем",
              text: "SHA-256-хеш, отзыв одной кнопкой, история использования.",
            },
            {
              icon: Code2,
              title: "Два формата",
              text: "Anthropic /v1/messages для Claude Code и OpenAI /v1 для остального кода.",
            },
            {
              icon: KeyRound,
              title: "Без подписки",
              text: "Платите за токены. Нет ежемесячной платы и обязательного минимума.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card p-5">
                <span className="grid size-9 place-items-center rounded-xl bg-cream text-green-deep">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-[0.9375rem] font-semibold">{item.title}</h3>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-page pb-14 lg:pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow">Вопросы</p>
            <h2 className="h3 mt-2">Claude без сюрпризов</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
              Нужна помощь с настройкой? Напишите в{" "}
              <a href={SITE.telegram} className="font-semibold text-green-deep hover:underline">
                Telegram
              </a>{" "}
              или на{" "}
              <a href={`mailto:${SITE.email}`} className="font-semibold text-green-deep hover:underline">
                {SITE.email}
              </a>
              .
            </p>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>

      <section className="container-page pb-10">
        <p className="rounded-2xl border border-line bg-white p-4 text-[0.8125rem] leading-relaxed text-muted">
          Нужен GPT для Cursor или Codex? Откройте{" "}
          <Link href="/api-gpt" className="font-semibold text-green-deep hover:underline">
            API GPT с оплатой рублями
          </Link>{" "}
          и сравните цены на модели.
        </p>
      </section>

      <section className="container-page pb-16">
        <div className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="relative max-w-xl">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-lime">
              Claude Code
            </p>
            <h2 className="mt-2 text-[1.7rem] font-bold leading-tight tracking-[-0.03em]">
              Подключите Claude за пять минут
            </h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-white/55">
              5 млн токенов на тесты, оплата в рублях, без подписки и VPN.
            </p>
          </div>
          <div className="relative mt-5 flex shrink-0 flex-wrap gap-2 lg:mt-0">
            <Link href="/register" className="btn btn-lime">
              Создать ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/claude-code"
              className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              Инструкция
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
