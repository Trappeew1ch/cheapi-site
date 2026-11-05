import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  CreditCard,
  Gauge,
  KeyRound,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { CodeBlock } from "@/components/code-block";
import { Faq, type FaqItem } from "@/components/faq";
import { SectionHeading } from "@/components/ui";
import { MODEL_MAP } from "@/lib/models";
import {
  DEFAULT_TOPUP_RUB,
  modelPricePerMillion,
  rateForRub,
} from "@/lib/pricing";
import { formatCoef, formatRub } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "API GPT в России — купить доступ с оплатой рублями",
  description:
    "Доступ к GPT 6.1 Sol, Terra, Astra и Luna через OpenAI-совместимый API. Оплата рублями, без VPN и подписки, ключ сразу, 5 млн токенов в подарок.",
  alternates: { canonical: "/api-gpt" },
  openGraph: {
    title: "API GPT в России с оплатой рублями — CheApi",
    description:
      "GPT 6.1 через один ключ: цены в рублях, OpenAI-совместимый API, без зарубежной карты.",
    url: "/api-gpt",
    type: "website",
  },
};

const FAQ: FaqItem[] = [
  {
    question: "Можно ли купить API GPT российской картой?",
    answer:
      "Да. В CheApi пополнение проходит через ЮKassa: карты российских банков, СБП и ЮMoney. Минимальное пополнение — 25 ₽, подписка не нужна.",
  },
  {
    question: "Нужен ли VPN для работы с GPT API?",
    answer:
      "Нет. Запросы идут на российский домен cheapi.ru, сервис сам маршрутизирует их к модели. Для работы достаточно ключа и base URL.",
  },
  {
    question: "Какие модели GPT доступны?",
    answer:
      "GPT 6.1 Sol, GPT 6.1 Terra, GPT 6 Astra, GPT 6 Luna и другие модели семейства. Актуальный список с ценами — в каталоге. Если модель нужна для конкретной задачи, напишите в поддержку.",
  },
  {
    question: "Сколько стоит один запрос?",
    answer:
      "Запрос на 10 000 входных и 2 000 выходных токенов к GPT 6.1 Sol стоит около 0,55 ₽ при пополнении на 600 ₽. Точная стоимость видна в калькуляторе и истории кабинета.",
  },
  {
    question: "Подходит ли API для Cursor и Codex CLI?",
    answer:
      "Да, оба инструмента работают с OpenAI-совместимым base URL https://cheapi.ru/v1. Для Cursor укажите адрес и ключ в настройках моделей, для Codex CLI — провайдера в config.toml.",
  },
];

const GPT_IDS = ["gpt-6.1-sol", "gpt-6.1-terra", "gpt-6-astra", "gpt-6-luna"];
const gptModels = GPT_IDS.map((id) => MODEL_MAP.get(id)).filter(
  (model): model is NonNullable<typeof model> => Boolean(model),
);

export default function ApiGptPage() {
  const baseRate = rateForRub(DEFAULT_TOPUP_RUB);
  const sol = MODEL_MAP.get("gpt-6.1-sol");
  const solPrice = sol ? modelPricePerMillion(sol.coef, DEFAULT_TOPUP_RUB) : 0;

  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Доступ к API GPT через CheApi",
            description:
              "OpenAI-совместимый API к моделям GPT с оплатой в рублях, без подписки и зарубежной карты.",
            brand: { "@type": "Brand", name: SITE.name },
            category: "AI API",
            url: `${SITE.url}/api-gpt`,
            offers: {
              "@type": "Offer",
              priceCurrency: "RUB",
              price: solPrice.toFixed(2),
              description: "за 1 млн токенов GPT 6.1 Sol при пополнении 600 ₽",
              availability: "https://schema.org/InStock",
              url: `${SITE.url}/api-gpt`,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
              { "@type": "ListItem", position: 2, name: "API GPT", item: `${SITE.url}/api-gpt` },
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
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "API GPT" }]}
        eyebrow="OpenAI GPT · оплата в рублях"
        title={
          <>
            API GPT в России
            <br />
            <span className="text-gradient">без зарубежной карты</span>
          </>
        }
        description="GPT 6.1 Sol, Terra, Astra и Luna через один OpenAI-совместимый ключ. Оплата рублями, без VPN и подписки. 5 млн токенов новым аккаунтам."
        actions={
          <>
            <Link href="/register" className="btn btn-primary btn-lg">
              Получить API-ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="btn btn-ghost btn-lg">
              Посчитать стоимость
            </Link>
          </>
        }
        aside={
          <div className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
            <span className="badge">GPT 6.1 Sol</span>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-[2.4rem] font-bold leading-none tracking-[-0.05em] tabular-nums">
                {formatRub(solPrice, 2).replace(" ₽", "")}
              </span>
              <span className="text-[0.875rem] text-muted">₽ / 1 млн токенов</span>
            </div>
            <p className="mt-1.5 text-[0.75rem] text-muted">
              при пополнении на {formatRub(DEFAULT_TOPUP_RUB, 0)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 text-[0.8125rem]">
              <div>
                <div className="text-muted">Стартовый баланс</div>
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
              Карта не нужна. Ключ сразу после регистрации.
            </p>
          </div>
        }
      />

      <section className="container-page py-14 lg:py-20">
        <SectionHeading
          eyebrow="Модели и цены"
          title="Сколько стоит GPT через API"
          description="Цена за миллион уже включает коэффициент модели. Вход и выход считаются по одной ставке, кешированный вход дешевле на 60%."
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
              {gptModels.map((model) => (
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
          Пример: запрос на 10 000 входных и 2 000 выходных токенов к GPT 6.1 Sol
          стоит около 0,55 ₽. Полный каталог —{" "}
          <Link href="/models" className="font-medium text-green-deep hover:underline">
            на странице моделей
          </Link>
          .
        </p>
      </section>

      <section className="border-y border-line/80 bg-white/45 py-14 lg:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Подключение"
              title="Одна строка в клиенте"
              description="OpenAI SDK, Cursor, Codex CLI, n8n и самописный backend работают без переписывания логики. Замените base URL и ключ."
            />
            <div className="mt-6 grid gap-2.5">
              {[
                "OpenAI-совместимый /v1/chat/completions и streaming",
                "Anthropic-формат для Claude Code на отдельном адресе",
                "Ключ хранится как SHA-256-хеш и отзывается одной кнопкой",
                "История запросов с токенами, стоимостью и задержкой",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-[0.875rem] text-ink-soft">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-green-soft text-green-deep">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <CodeBlock
            tone="dark"
            filename="quickstart.py"
            code={`from openai import OpenAI

client = OpenAI(
    api_key="che_sk_ваш_ключ",
    base_url="${SITE.apiBase}",
)

response = client.chat.completions.create(
    model="gpt-6.1-sol",
    messages=[{"role": "user", "content": "Привет!"}],
)

print(response.choices[0].message.content)`}
          />
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <SectionHeading
          eyebrow="Почему CheApi"
          title="Прозрачно до токена"
          description="Не обещаем самый большой каталог. Даём понятную цену, быстрый старт и контроль над расходом."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: CreditCard,
              title: "Оплата рублями",
              text: "Карты РФ, СБП и ЮMoney. Без зарубежного банка и валютных комиссий.",
            },
            {
              icon: Gauge,
              title: "Цена без сюрпризов",
              text: `Ставка ${baseRate.toFixed(2)} ₽ за 1 млн базовых токенов и открытый коэффициент модели.`,
            },
            {
              icon: Zap,
              title: "Быстрый старт",
              text: "5 млн токенов, ключ сразу, примеры для Python, Node.js и cURL.",
            },
            {
              icon: ShieldCheck,
              title: "Контроль",
              text: "История запросов, лимит частоты, отзыв ключа и понятные ошибки.",
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
            <h2 className="h3 mt-2">Коротко о главном</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
              Не нашли ответ? Напишите в{" "}
              <a href={SITE.telegram} className="font-semibold text-green-deep hover:underline">
                Telegram
              </a>{" "}
              или на{" "}
              <a href={`mailto:${SITE.email}`} className="font-semibold text-green-deep hover:underline">
                {SITE.email}
              </a>
              .
            </p>
            <Link
              href="/blog/api-gpt-v-rossii"
              className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-green-deep hover:underline"
            >
              Подробный гайд по API GPT
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>

      <section className="container-page pb-10">
        <p className="rounded-2xl border border-line bg-white p-4 text-[0.8125rem] leading-relaxed text-muted">
          Нужен Claude для Claude Code? У нас есть{" "}
          <Link href="/api-claude" className="font-semibold text-green-deep hover:underline">
            API Claude с оплатой в рублях
          </Link>{" "}
          и инструкция по подключению без подписки.
        </p>
      </section>

      <section className="container-page pb-16">
        <div className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-green/25 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-xl">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-lime">
              Начать
            </p>
            <h2 className="mt-2 text-[1.7rem] font-bold leading-tight tracking-[-0.03em]">
              Получите ключ и 5 млн токенов
            </h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-white/55">
              Проверьте GPT на своих задачах до пополнения. Оплата только за
              фактические токены.
            </p>
          </div>
          <div className="relative mt-5 flex shrink-0 flex-wrap gap-2 lg:mt-0">
            <Link href="/register" className="btn btn-lime">
              Создать API-ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/docs"
              className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <Code2 className="size-4" aria-hidden="true" />
              Документация
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
