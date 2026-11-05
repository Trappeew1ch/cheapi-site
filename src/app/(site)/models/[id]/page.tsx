import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  CircleDollarSign,
  Code2,
  ImageIcon,
  KeyRound,
  Layers,
  Mic,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { CodeTabs } from "@/components/code-tabs";
import { ModelCard } from "@/components/model-card";
import { ModelIcon } from "@/components/model-icon";
import { Faq, type FaqItem } from "@/components/faq";
import {
  FAMILIES,
  IMAGE_MIN_TOKENS,
  MODEL_MAP,
  MODELS,
  relatedModels,
  type Model,
} from "@/lib/models";
import { BENCHMARKS } from "@/content/benchmarks";
import {
  CACHE_MULTIPLIER,
  DEFAULT_TOPUP_RUB,
  cachedPricePerMillion,
  modelPricePerMillion,
  rateForRub,
} from "@/lib/pricing";
import { formatCoef, formatRub, formatTokens } from "@/lib/format";
import { formatWorkTime, hoursForModel } from "@/lib/workload";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODELS.map((model) => ({ id: model.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/models/[id]">): Promise<Metadata> {
  const { id } = await params;
  const model = MODEL_MAP.get(id);
  if (!model) return { title: "Модель не найдена" };

  const price = modelPricePerMillion(model.coef, DEFAULT_TOPUP_RUB);
  const imagePrice =
    ((model.imageMinTokens ?? IMAGE_MIN_TOKENS) * rateForRub(DEFAULT_TOPUP_RUB)) / 1_000_000;
  const priceLabel =
    model.kind === "image"
      ? `${formatRub(imagePrice, 2)} за изображение`
      : `${formatRub(price, 2)} за 1 млн токенов`;
  return {
    title: `${model.name} — цена и подключение через API`,
    description: `${model.tagline}. ${priceLabel} при пополнении на 600 ₽. OpenAI-совместимый API, оплата в рублях, без подписки.`,
    alternates: { canonical: `/models/${model.id}` },
    openGraph: {
      title: `${model.name} в CheApi`,
      description: model.tagline,
      url: `/models/${model.id}`,
      type: "website",
    },
  };
}

const KIND_LABEL: Record<Model["kind"], string> = {
  chat: "Текст и код",
  image: "Генерация изображений",
  audio: "Транскрибация аудио",
  embedding: "Эмбеддинги",
};

type CodeSamples = { curl: string; python: string; node?: string };

function codeSample(model: Model): CodeSamples {
  const base = "https://cheapi.ru/v1";

  if (model.kind === "image") {
    return {
      curl: `curl ${base}/images/generations \\
  -H "Authorization: Bearer $CHEAPI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.id}",
    "prompt": "минималистичный постер с зелёным градиентом",
    "size": "1024x1024",
    "n": 1
  }'`,
      python: `from openai import OpenAI

client = OpenAI(
    api_key="che_sk_ваш_ключ",
    base_url="${base}",
)

image = client.images.generate(
    model="${model.id}",
    prompt="минималистичный постер с зелёным градиентом",
    size="1024x1024",
    n=1,
)

print(image.data[0].url)`,
    };
  }

  if (model.kind === "audio") {
    return {
      curl: `curl ${base}/audio/transcriptions \\
  -H "Authorization: Bearer $CHEAPI_API_KEY" \\
  -F "model=${model.id}" \\
  -F "file=@meeting.mp3" \\
  -F "language=ru"`,
      python: `from openai import OpenAI

client = OpenAI(
    api_key="che_sk_ваш_ключ",
    base_url="${base}",
)

with open("meeting.mp3", "rb") as audio:
    transcript = client.audio.transcriptions.create(
        model="${model.id}",
        file=audio,
        language="ru",
    )

print(transcript.text)`,
    };
  }

  if (model.kind === "embedding") {
    return {
      curl: `curl ${base}/embeddings \\
  -H "Authorization: Bearer $CHEAPI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.id}",
    "input": "CheApi — один ключ ко всем AI-моделям"
  }'`,
      python: `from openai import OpenAI

client = OpenAI(
    api_key="che_sk_ваш_ключ",
    base_url="${base}",
)

response = client.embeddings.create(
    model="${model.id}",
    input="CheApi — один ключ ко всем AI-моделям",
)

print(len(response.data[0].embedding))`,
    };
  }

  return {
    curl: `curl ${base}/chat/completions \\
  -H "Authorization: Bearer $CHEAPI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.id}",
    "messages": [
      {"role": "user", "content": "Привет! Что ты умеешь?"}
    ],
    "stream": false
  }'`,
    python: `from openai import OpenAI

client = OpenAI(
    api_key="che_sk_ваш_ключ",
    base_url="${base}",
)

response = client.chat.completions.create(
    model="${model.id}",
    messages=[
        {"role": "user", "content": "Привет! Что ты умеешь?"}
    ],
)

print(response.choices[0].message.content)`,
    node: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.CHEAPI_API_KEY,
  baseURL: "${base}",
});

const response = await client.chat.completions.create({
  model: "${model.id}",
  messages: [{ role: "user", content: "Привет! Что ты умеешь?" }],
});

console.log(response.choices[0].message.content);`,
  };
}

export default async function ModelPage({ params }: PageProps<"/models/[id]">) {
  const { id } = await params;
  const model = MODEL_MAP.get(id);
  if (!model) notFound();

  const family = FAMILIES[model.family];
  const price = modelPricePerMillion(model.coef, DEFAULT_TOPUP_RUB);
  const cached = cachedPricePerMillion(model.coef, DEFAULT_TOPUP_RUB);
  const baseRate = rateForRub(DEFAULT_TOPUP_RUB);
  const imageTokens = model.imageMinTokens ?? IMAGE_MIN_TOKENS;
  const imagePrice = (imageTokens * baseRate) / 1_000_000;
  const related = relatedModels(model, 4);
  const samples = codeSample(model);
  const isImage = model.kind === "image";
  const benchmark = BENCHMARKS[model.id];
  const welcomeHours = hoursForModel(5_000_000, model.coef, "coding");
  const thousandRequests = ((12_000 * price) / 1_000_000) * 1000;

  const faq: FaqItem[] = [
    {
      question: `Сколько стоит ${model.name}?`,
      answer: isImage
        ? `Одно изображение стоит ${formatRub(imagePrice, 2)} при пополнении на 600 ₽. Тарификация фиксированная — ${formatTokens(imageTokens)} базовых токенов за изображение, без коэффициента модели и кеша.`
        : `При пополнении на 600 ₽ миллион токенов ${model.name} стоит ${formatRub(price, 2)}. Коэффициент модели — ${formatCoef(model.coef)} к базовой ставке. Кешированный вход считается по ${formatRub(cached, 2)} за миллион.`,
    },
    {
      question: "Какой формат API используется?",
      answer:
        model.kind === "embedding"
          ? "Стандартный OpenAI-совместимый эндпоинт /v1/embeddings. Подойдёт официальный SDK OpenAI, LangChain и LlamaIndex."
          : model.kind === "image"
            ? "OpenAI-совместимый эндпоинт /v1/images/generations. Работает с официальным SDK OpenAI и большинством библиотек."
            : model.kind === "audio"
              ? "OpenAI-совместимый эндпоинт /v1/audio/transcriptions с multipart/form-data."
              : "OpenAI-совместимый /v1/chat/completions и /v1/responses. Достаточно заменить base_url и ключ — остальной код остаётся прежним.",
    },
    {
      question: "Можно ли попробовать без оплаты?",
      answer:
        "Да. Новым аккаунтам начисляем 5 млн базовых токенов. Этого хватит на тесты в песочнице кабинета или через API. Карта для регистрации не нужна.",
    },
    {
      question: "Что будет, если модель недоступна?",
      answer:
        "API вернёт ошибку с кодом и понятным сообщением, списание не произойдёт. Статус сервиса и инциденты публикуем на странице /status и в Telegram-канале.",
    },
  ];

  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: model.name,
            description: model.description,
            brand: { "@type": "Brand", name: model.vendor },
            category: "AI model API",
            url: `${SITE.url}/models/${model.id}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "RUB",
              price: (isImage ? imagePrice : price).toFixed(2),
              description: isImage
                ? "за изображение при пополнении на 600 ₽"
                : "за 1 млн токенов при пополнении на 600 ₽",
              availability: "https://schema.org/InStock",
              url: `${SITE.url}/models/${model.id}`,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Главная", item: SITE.url },
              {
                "@type": "ListItem",
                position: 2,
                name: "Модели",
                item: `${SITE.url}/models`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: model.name,
                item: `${SITE.url}/models/${model.id}`,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: String(item.answer) },
            })),
          },
        ]}
      />

      <PageHero
        size="compact"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Модели", href: "/models" },
          { label: model.name },
        ]}
        eyebrow={`${family.name} · ${family.vendor}`}
        title={
          <span className="flex flex-wrap items-center gap-3 sm:gap-4">
            <ModelIcon model={model} size={52} className="rounded-2xl" />
            <span>{model.name}</span>
          </span>
        }
        description={model.tagline}
        actions={
          <>
            <Link href="/register" className="btn btn-primary">
              Попробовать бесплатно
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/docs" className="btn btn-ghost">
              Документация API
            </Link>
          </>
        }
        aside={
          <div className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              {model.badge && (
                <span className="badge">
                  <Sparkles className="size-3 text-green-deep" aria-hidden="true" />
                  {model.badge}
                </span>
              )}
              <span className="badge">{KIND_LABEL[model.kind]}</span>
              {benchmark?.score !== null && benchmark?.score !== undefined && (
                <span className="badge">AA {benchmark.score}/100</span>
              )}
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-[2.4rem] font-bold leading-none tracking-[-0.05em] tabular-nums">
                {formatRub(isImage ? imagePrice : price, 2).replace(" ₽", "")}
              </span>
              <span className="text-[0.875rem] text-muted">
                {isImage ? "₽ / изображение" : "₽ / 1 млн"}
              </span>
            </div>
            <p className="mt-1.5 text-[0.75rem] text-muted">
              при пополнении на {formatRub(DEFAULT_TOPUP_RUB, 0)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 text-[0.8125rem]">
              {isImage ? (
                <>
                  <div>
                    <div className="text-muted">Токенов за изображение</div>
                    <div className="mt-0.5 font-semibold tabular-nums">{formatTokens(imageTokens)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Кеш-вход</div>
                    <div className="mt-0.5 font-semibold">не применяется</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-muted">Коэффициент</div>
                    <div className="mt-0.5 font-semibold tabular-nums">{formatCoef(model.coef)}</div>
                  </div>
                  <div>
                    <div className="text-muted">Кеш-вход</div>
                    <div className="mt-0.5 font-semibold tabular-nums">{formatRub(cached, 2)}</div>
                  </div>
                </>
              )}
            </div>
            <Link href="/register" className="btn btn-primary mt-5 w-full">
              Создать API-ключ
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <p className="mt-3 text-center text-[0.6875rem] text-muted">
              {model.apiOnly
                ? "Доступно через API"
                : model.kind === "chat"
                  ? `5 млн токенов ≈ ${formatWorkTime(welcomeHours)} кодинга`
                  : "5 млн токенов новым аккаунтам"}
            </p>
          </div>
        }
      />

      <section className="container-page py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          <div className="min-w-0">
            <h2 id="about" className="h3 scroll-mt-28">О модели</h2>
            <p className="mt-4 text-[1.0625rem] leading-[1.72] text-ink-soft">
              {model.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-white p-5">
                <div className="flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-muted">
                  <Zap className="size-3.5 text-green-deep" aria-hidden="true" />
                  Лучше всего подходит
                </div>
                <ul className="mt-3 space-y-2">
                  {model.bestFor.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[0.875rem] text-ink-soft">
                      <Check className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-line bg-white p-5">
                <div className="flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-muted">
                  <Layers className="size-3.5 text-[#1d6ea8]" aria-hidden="true" />
                  Возможности
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {model.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-line bg-cream/70 px-2 py-1 text-[0.75rem] font-medium text-ink-soft"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <h2 id="connect" className="h3 mt-12 scroll-mt-28">Подключение</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
              Замените base_url и ключ в существующем клиенте — остальной код
              останется прежним. Полный список эндпоинтов — в{" "}
              <Link href="/docs" className="font-semibold text-green-deep hover:underline">
                документации
              </Link>
              .
            </p>
            <div className="mt-5">
              <CodeTabs
                tabs={[
                  { label: "Python", filename: "main.py", code: samples.python },
                  ...(samples.node
                    ? [{ label: "Node.js", filename: "index.ts", code: samples.node }]
                    : []),
                  { label: "cURL", filename: "bash", code: samples.curl },
                ]}
              />
            </div>

            <h2 id="pricing" className="h3 mt-12 scroll-mt-28">Стоимость</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
              {isImage
                ? `Изображения тарифицируются фиксированно: ${formatTokens(imageTokens)} базовых токенов за изображение. Коэффициент модели и кеш к ним не применяются.`
                : `Вход и выход стоят одинаково. Кешированный вход — ${Math.round(
                    CACHE_MULTIPLIER * 100,
                  )}% от обычной цены. Стоимость запроса округляется вверх до целого токена уже после умножения на коэффициент.`}
            </p>

            <div className="table-wrap mt-5">
              <table className="data-table min-w-[560px]">
                <thead>
                  <tr>
                    <th>Сценарий</th>
                    <th>Токенов</th>
                    <th>Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  {!isImage && (
                    <>
                      <tr>
                        <td>1 млн входных токенов</td>
                        <td className="tabular-nums">{formatTokens(1_000_000 * model.coef)}</td>
                        <td className="font-semibold tabular-nums">{formatRub(price, 2)}</td>
                      </tr>
                      <tr>
                        <td>1 млн выходных токенов</td>
                        <td className="tabular-nums">{formatTokens(1_000_000 * model.coef)}</td>
                        <td className="font-semibold tabular-nums">{formatRub(price, 2)}</td>
                      </tr>
                      <tr>
                        <td>1 млн кешированных токенов</td>
                        <td className="tabular-nums">
                          {formatTokens(Math.ceil(1_000_000 * model.coef * CACHE_MULTIPLIER))}
                        </td>
                        <td className="font-semibold tabular-nums">{formatRub(cached, 2)}</td>
                      </tr>
                      <tr>
                        <td>1 000 запросов по 12 тыс. токенов</td>
                        <td className="tabular-nums">
                          {formatTokens(Math.ceil(12_000_000 * model.coef))}
                        </td>
                        <td className="font-semibold tabular-nums">
                          {formatRub(thousandRequests, 2)}
                        </td>
                      </tr>
                    </>
                  )}
                  {isImage && (
                    <>
                      <tr>
                        <td>1 изображение</td>
                        <td className="tabular-nums">
                          {formatTokens(model.imageMinTokens ?? IMAGE_MIN_TOKENS)}
                        </td>
                        <td className="font-semibold tabular-nums">
                          {formatRub(
                            ((model.imageMinTokens ?? IMAGE_MIN_TOKENS) * baseRate) / 1_000_000,
                            2,
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>4 изображения</td>
                        <td className="tabular-nums">
                          {formatTokens((model.imageMinTokens ?? IMAGE_MIN_TOKENS) * 4)}
                        </td>
                        <td className="font-semibold tabular-nums">
                          {formatRub(
                            ((model.imageMinTokens ?? IMAGE_MIN_TOKENS) * 4 * baseRate) /
                              1_000_000,
                            2,
                          )}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
              {isImage
                ? `Одно изображение тарифицируется как ${formatTokens(model.imageMinTokens ?? IMAGE_MIN_TOKENS)} базовых токенов — коэффициент модели к изображению не применяется. `
                : ""}
              Расчёт при ставке {formatRub(baseRate, 2)} за 1 млн базовых токенов
              (пополнение 600 ₽). При другой сумме ставка пересчитывается
              автоматически.
            </p>

            <h2 id="specs" className="h3 mt-12 scroll-mt-28">Характеристики</h2>
            <dl className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
              {[
                ["ID модели", model.id, true],
                ["Провайдер", model.vendor],
                ["Семейство", family.name],
                ["Тип", KIND_LABEL[model.kind]],
                ...(benchmark?.score !== null && benchmark?.score !== undefined
                  ? [
                      [
                        "Интеллект AA",
                        `${benchmark.score}/100 · ${benchmark.variant}`,
                        false,
                      ],
                    ]
                  : []),
                ...(isImage
                  ? [
                      ["Тарификация", `${formatTokens(imageTokens)} токенов / изображение`, true],
                      ["Коэффициент", "не применяется", false],
                    ]
                  : [
                      ["Коэффициент", formatCoef(model.coef), false],
                      ["Кеш-вход", `−${Math.round((1 - CACHE_MULTIPLIER) * 100)}%`, false],
                    ]),
                ...(model.aliases?.length
                  ? [["Алиасы", model.aliases.join(", "), true] as [string, string, boolean]]
                  : []),
              ].map(([label, value, mono]) => (
                <div
                  key={String(label)}
                  className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <dt className="text-[0.8125rem] text-muted">{label}</dt>
                  <dd
                    className={
                      mono
                        ? "break-all font-mono text-[0.8125rem] text-ink"
                        : "text-[0.875rem] font-medium text-ink"
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 rounded-2xl border border-line bg-lime-soft/50 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-lime">
                  <KeyRound className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[1rem] font-semibold">Нужен ключ?</h3>
                  <p className="mt-1 text-[0.875rem] leading-relaxed text-muted">
                    Зарегистрируйтесь — ключ выдаётся сразу, вместе с 5 млн
                    токенов на тесты. Модель уже доступна, отдельная заявка не
                    нужна.
                  </p>
                  <Link href="/register" className="btn btn-primary btn-sm mt-4">
                    Создать аккаунт
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="card p-5">
              <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-muted">
                На этой странице
              </h2>
              <nav className="mt-3 grid gap-1 text-[0.8125rem]" aria-label="Содержание">
                {[
                  ["О модели", "#about"],
                  ["Подключение", "#connect"],
                  ["Стоимость", "#pricing"],
                  ["Характеристики", "#specs"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="rounded-lg px-2 py-1.5 text-ink-soft transition-colors hover:bg-cream hover:text-ink"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-muted">
                <CircleDollarSign className="size-3.5 text-green-deep" aria-hidden="true" />
                Другие цены
              </div>
              <div className="mt-3 space-y-2.5 text-[0.8125rem]">
                {[
                  ["Пополнение 300 ₽", modelPricePerMillion(model.coef, 300)],
                  ["Пополнение 600 ₽", modelPricePerMillion(model.coef, 600)],
                  ["Пополнение 3 000 ₽", modelPricePerMillion(model.coef, 3000)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-baseline justify-between gap-3">
                    <span className="text-muted">{label}</span>
                    <span className="font-semibold tabular-nums">
                      {formatRub(Number(value), 2)}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-green-deep hover:underline"
              >
                Вся тарифная сетка
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-muted">
                {model.kind === "image" ? (
                  <ImageIcon className="size-3.5" aria-hidden="true" />
                ) : model.kind === "audio" ? (
                  <Mic className="size-3.5" aria-hidden="true" />
                ) : model.kind === "embedding" ? (
                  <Boxes className="size-3.5" aria-hidden="true" />
                ) : (
                  <Code2 className="size-3.5" aria-hidden="true" />
                )}
                Эндпоинт
              </div>
              <code className="mt-3 block break-all rounded-lg bg-cream px-3 py-2 font-mono text-[0.75rem] text-ink-soft">
                {model.kind === "image"
                  ? "/v1/images/generations"
                  : model.kind === "audio"
                    ? "/v1/audio/transcriptions"
                    : model.kind === "embedding"
                      ? "/v1/embeddings"
                      : "/v1/chat/completions"}
              </code>
              <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
                Base URL: <code className="font-mono">https://cheapi.ru/v1</code>
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-line/80 bg-white/45 py-14 lg:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Похожие модели</p>
              <h2 className="h3 mt-2">Чем ещё можно закрыть задачу</h2>
            </div>
            <Link href="/models" className="btn btn-white btn-sm">
              Весь каталог
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ModelCard key={item.id} model={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h2 mt-3 text-balance">Коротко о главном</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              Не нашли ответ? Напишите в Telegram — поможем с подключением и
              расчётами.
            </p>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-white mt-6"
            >
              <Terminal className="size-4" aria-hidden="true" />
              {SITE.telegramHandle}
            </a>
          </div>
          <Faq items={faq} />
        </div>
      </section>
    </main>
  );
}
