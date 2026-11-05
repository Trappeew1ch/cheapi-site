import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Check,
  CreditCard,
  ImageIcon,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { PricingCalculator } from "@/components/pricing-calculator";
import { Faq, type FaqItem } from "@/components/faq";
import { SectionHeading } from "@/components/ui";
import { MODEL_MAP } from "@/lib/models";
import {
  OFFICIAL_SOURCE,
  formatMultiplier,
  officialMultiplier,
  officialRequestRub,
} from "@/content/official-prices";
import {
  CACHE_MULTIPLIER,
  DEFAULT_TOPUP_RUB,
  MAX_TOPUP_RUB,
  MIN_TOPUP_RUB,
  TOPUP_PRESETS,
  TOPUP_TIERS,
  chargedTokens,
  modelPricePerMillion,
  rateForRub,
  rublesForTokens,
  tokensForRub,
  volumeDiscount,
} from "@/lib/pricing";
import {
  formatCoef,
  formatNumber,
  formatRub,
  formatTokens,
} from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Цены на API — токены, пополнение и калькулятор",
  description:
    "Прозрачные цены CheApi: пополнение от 25 ₽, цена за миллион токенов зависит от суммы. Калькулятор, тарифная сетка и примеры стоимости запросов для GPT, Claude, GLM и DeepSeek.",
  alternates: { canonical: "/pricing" },
};

const TIER_AMOUNTS = Array.from(
  new Set([
    25, 50, 100, 200, 300, 600, 1000, 3000, 15_000, 50_000,
    ...TOPUP_PRESETS.map((preset) => preset.rub),
  ]),
).sort((a, b) => a - b);

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Почему цена за миллион токенов зависит от суммы пополнения?",
    answer:
      "Мы закупаем доступ крупными пакетами: чем больше баланс, тем ниже наша закупочная цена и тем ниже итоговая ставка для вас. Ставка фиксируется в момент пополнения и применяется к последующим запросам. Если позже вы пополните баланс на другую сумму, новая ставка начнёт действовать для новых списаний.",
  },
  {
    question: "Токены сгорают?",
    answer:
      "Нет. Баланс не имеет срока действия, автоплатежей и обязательных ежемесячных списаний. Вы тратите токены только когда отправляете запросы к API. Исключение — возврат денег: неизрасходованный остаток можно вернуть в течение 14 дней.",
  },
  {
    question: "Вход и выход стоят одинаково?",
    answer:
      "Да, в CheApi входные и выходные токены стоят одинаково. Кешированный вход считается по 40% от обычной цены. У некоторых провайдеров выход дороже входа — мы сглаживаем это в одну ставку, чтобы расчёт был предсказуемым.",
  },
  {
    question: "Что такое коэффициент модели?",
    answer:
      "Это множитель к базовой ставке. Например, при пополнении на 600 ₽ базовая ставка — около 11,42 ₽ за 1 млн токенов. Модель с коэффициентом ×4 стоит 45,67 ₽ за 1 млн, а с коэффициентом ×0,3 — 3,43 ₽. Коэффициенты опубликованы в каталоге и не меняются задним числом.",
  },
  {
    question: "Как оплатить?",
    answer:
      "Картой РФ, через СБП или ЮMoney — платежи обрабатывает ЮKassa. Минимальное пополнение 25 ₽, максимальное 50 000 ₽ за один платёж. Токены зачисляются автоматически после подтверждения оплаты, обычно за несколько секунд.",
  },
  {
    question: "Есть ли скрытые комиссии?",
    answer:
      "Нет. Вы платите только за пополнение по выбранной ставке. Мы не берём комиссию за запросы, не округляем токены в свою пользу и не списываем деньги за неактивность. В истории кабинета видна стоимость каждого запроса.",
  },
  {
    question: "Можно ли получить счёт для компании?",
    answer:
      "Да. Напишите на support@cheapi.ru с реквизитами и суммой — подготовим счёт и закрывающие документы. Для регулярных платежей доступна оплата по счёту, для разовых — карта или СБП.",
  },
  {
    question: "Что будет, если баланс закончится?",
    answer:
      "API вернёт ошибку 402 с понятным сообщением, запросы не будут выполняться. Баланс не уходит в минус. Пополните его в кабинете — и ключ сразу снова заработает, перевыпускать ничего не нужно.",
  },
];

function requestCost(coef: number, amount: number) {
  const charged = chargedTokens(
    { inputTokens: 10_000, outputTokens: 2_000, cachedTokens: 0 },
    coef,
  );
  return rublesForTokens(charged, rateForRub(amount));
}

export default function PricingPage() {
  const exampleModels = [
    "gpt-6.1-sol",
    "claude-sonnet-5-5",
    "glm-5.3",
    "deepseek-flash",
    "gpt-6.1-terra",
    "claude-opus-5-5",
  ]
    .map((id) => MODEL_MAP.get(id))
    .filter((model): model is NonNullable<typeof model> => Boolean(model));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "CheApi — доступ к AI-моделям через API",
    description:
      "OpenAI- и Anthropic-совместимый API к GPT, Claude, GLM и DeepSeek с оплатой токенами в рублях.",
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RUB",
      lowPrice: String(MIN_TOPUP_RUB),
      highPrice: String(MAX_TOPUP_RUB),
      offerCount: String(TIER_AMOUNTS.length),
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/pricing`,
    },
  };

  return (
    <main>
      <JsonLd data={[faqJsonLd, productJsonLd]} />

      <PageHero
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Цены" }]}
        eyebrow="Цены"
        title={
          <>
            Платите за токены,
            <br />
            <span className="text-gradient">не за подписку</span>
          </>
        }
        description="Одна ставка за миллион токенов, которая зависит только от суммы пополнения. Никаких ежемесячных платежей, скрытых комиссий и сгорающих лимитов."
        actions={
          <>
            <Link href="/register" className="btn btn-primary btn-lg">
              Пополнить и начать
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="#calculator" className="btn btn-ghost btn-lg">
              Открыть калькулятор
            </Link>
          </>
        }
        aside={
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[32px] bg-[radial-gradient(circle_at_30%_20%,rgba(216,255,106,0.55),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(191,227,255,0.5),transparent_55%)] blur-xl"
              aria-hidden="true"
            />
            <div className="relative rounded-[26px] border border-line bg-white p-6 shadow-soft sm:p-7">
              <div className="flex items-center justify-between">
                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted">
                  Стартовая ставка
                </span>
                <span className="badge !py-1 !text-[0.6875rem]">при 600 ₽</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-[2.6rem] font-bold leading-none tracking-[-0.05em] tabular-nums">
                  {formatRub(rateForRub(DEFAULT_TOPUP_RUB), 2).replace(" ₽", "")}
                </span>
                <span className="text-[0.875rem] font-medium text-muted">
                  ₽ / 1 млн
                </span>
              </div>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
                базовых токенов. Дальше умножаем на коэффициент модели — он
                указан в каталоге.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-line bg-cream/60 px-3 py-2.5">
                  <div className="text-[0.6875rem] text-muted">На баланс</div>
                  <div className="mt-1 text-[1.0625rem] font-bold tabular-nums">
                    {formatTokens(tokensForRub(DEFAULT_TOPUP_RUB))}
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-cream/60 px-3 py-2.5">
                  <div className="text-[0.6875rem] text-muted">Бонус</div>
                  <div className="mt-1 text-[1.0625rem] font-bold tabular-nums">
                    5 млн
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {["МИР", "СБП", "ЮMoney", "ЮKassa"].map((method) => (
                  <span
                    key={method}
                    className="rounded-md border border-line bg-white px-2 py-1 text-[0.6875rem] font-semibold text-muted"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        }
      />

      {/* CALCULATOR */}
      <section id="calculator" className="container-page py-16 lg:py-20">
        <SectionHeading
          align="left"
          eyebrow="Калькулятор"
          title="Посчитайте свой бюджет"
          description="Введите сумму пополнения — покажем, сколько токенов зачислим и сколько стоит миллион по каждой модели. Это не примерные цифры: калькулятор использует ту же формулу, что и биллинг."
          className="!mx-0 max-w-2xl"
        />
        <div className="mt-8">
          <PricingCalculator showAll />
        </div>
      </section>

      {/* TIERS */}
      <section className="border-y border-line/80 bg-white/45 py-16 lg:py-24">
        <div className="container-page">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow">Тарифная сетка</p>
              <h2 className="h2 mt-3 text-balance">Чем больше баланс, тем ниже ставка</h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
                Ставка снижается плавно: мы не привязываем скидку к «пакетам» и
                не заставляем покупать лишнее. Цена фиксируется при пополнении.
              </p>
            </div>
            <Link href="/register" className="btn btn-white shrink-0">
              Открыть кабинет
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="table-wrap mt-8">
            <table className="data-table min-w-[680px]">
              <thead>
                <tr>
                  <th>Пополнение</th>
                  <th>Токенов на баланс</th>
                  <th>Ставка за 1 млн</th>
                  <th>Выгода</th>
                  <th className="hidden sm:table-cell">Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {TIER_AMOUNTS.map((amount) => {
                  const tokens = tokensForRub(amount);
                  const rate = rateForRub(amount);
                  const discount = volumeDiscount(amount);
                  const highlight = amount === 600 || amount === 3000;
                  return (
                    <tr key={amount} className={highlight ? "bg-lime-soft/45" : undefined}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.9375rem] font-semibold tabular-nums">
                            {formatNumber(amount)} ₽
                          </span>
                          {amount === 600 && (
                            <span className="rounded-full bg-ink px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.06em] text-white">
                              старт
                            </span>
                          )}
                          {amount === 3000 && (
                            <span className="rounded-full bg-lime px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.06em] text-ink">
                              популярный
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap font-medium tabular-nums">
                        {formatTokens(tokens)}
                      </td>
                      <td className="whitespace-nowrap font-semibold tabular-nums">
                        {formatRub(rate, 2)}
                      </td>
                      <td className="whitespace-nowrap tabular-nums">
                        {discount > 0.005 ? (
                          <span className="font-semibold text-green-deep">
                            −{Math.round(discount * 100)}%
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="hidden text-[0.8125rem] text-muted sm:table-cell">
                        {TOPUP_TIERS.find((tier) => tier.rub === amount)?.note ??
                          (amount <= 100
                            ? "Попробовать API"
                            : amount <= 1000
                              ? "Для одного разработчика"
                              : amount <= 15_000
                                ? "Для команды или продукта"
                                : "Максимальная выгода")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-[0.75rem] leading-relaxed text-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Расчёт по формуле: сумма ÷ токены × 1 000 000. Итоговая ставка может
            незначительно отличаться из-за округления токенов до целого.
          </p>
        </div>
      </section>

      {/* EXAMPLES */}
      <section className="container-page py-16 lg:py-24">
        <SectionHeading
          eyebrow="Примеры"
          title="Сколько стоит один запрос"
          description="Типичный запрос: 10 000 входных токенов (примерно 25 страниц текста) и 2 000 выходных. Цены — при пополнении на 600 ₽. Колонка «Официальный тариф» — тот же запрос по тарифам OpenRouter."
        />
        <div className="table-wrap mt-8">
          <table className="data-table min-w-[820px]">
            <thead>
              <tr>
                <th>Модель</th>
                <th>Коэффициент</th>
                <th>1 млн токенов</th>
                <th>Один запрос</th>
                <th>Официальный тариф</th>
                <th>Сравнение</th>
              </tr>
            </thead>
            <tbody>
              {exampleModels.map((model) => {
                const price = modelPricePerMillion(model.coef, DEFAULT_TOPUP_RUB);
                const one = requestCost(model.coef, DEFAULT_TOPUP_RUB);
                const official = officialRequestRub(model.id);
                const mult = officialMultiplier(model.id, model.coef, rateForRub(DEFAULT_TOPUP_RUB));
                return (
                  <tr key={model.id}>
                    <td>
                      <Link
                        href={`/models/${model.id}`}
                        className="font-semibold text-ink hover:text-green-deep"
                      >
                        {model.name}
                      </Link>
                      <code className="mt-0.5 block font-mono text-[0.6875rem] text-muted">
                        {model.id}
                      </code>
                    </td>
                    <td className="whitespace-nowrap tabular-nums text-ink-soft">
                      {formatCoef(model.coef)}
                    </td>
                    <td className="whitespace-nowrap font-semibold tabular-nums">
                      {formatRub(price, 2)}
                    </td>
                    <td className="whitespace-nowrap tabular-nums">
                      {formatRub(one, 2)}
                    </td>
                    <td className="whitespace-nowrap tabular-nums text-muted">
                      {official === null ? "—" : formatRub(official, 2)}
                    </td>
                    <td className="whitespace-nowrap tabular-nums">
                      {mult === null ? (
                        <span className="text-muted">—</span>
                      ) : mult >= 1.05 ? (
                        <span className="font-semibold text-green-deep">
                          {formatMultiplier(mult)}
                        </span>
                      ) : (
                        <span className="text-muted">{formatMultiplier(mult)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[0.75rem] leading-relaxed text-muted">
          Вход и выход считаются по одной ставке. Кешированный вход дешевле на{" "}
          {Math.round((1 - CACHE_MULTIPLIER) * 100)}%. Официальный тариф — {OFFICIAL_SOURCE.name},
          стандартный запрос, курс 81 ₽/$. Реальная стоимость зависит
          от длины промпта и ответа.
        </p>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="border-y border-line/80 bg-white/45 py-16 lg:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Что входит"
            title="Одна цена без сюрпризов"
            description="В ставку уже включены маршрутизация, учёт токенов, поддержка и инфраструктура. Отдельных платежей за это нет."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: "Все модели",
                text: "Один ключ открывает GPT, Claude, GLM, DeepSeek, изображения, аудио и эмбеддинги.",
              },
              {
                icon: RefreshCw,
                title: "Кеш −60%",
                text: "Повторяющийся контекст считается по 40% цены входа автоматически.",
              },
              {
                icon: ShieldCheck,
                title: "Без подписки",
                text: "Нет ежемесячной платы и автоплатежей. Токены не сгорают.",
              },
              {
                icon: CreditCard,
                title: "Оплата в рублях",
                text: "Карта РФ, СБП и ЮMoney. Чек и закрывающие документы по запросу.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-cream text-ink">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[1.0625rem] font-semibold tracking-[-0.02em]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-green-deep">
                <Sparkles className="size-4" aria-hidden="true" />
                Бонус новым аккаунтам
              </div>
              <h3 className="mt-3 text-[1.35rem] font-bold tracking-[-0.03em]">
                5 млн токенов бесплатно
              </h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
                Хватит на несколько тысяч тестовых запросов к экономным моделям
                или на десятки — к флагманским. Карта не нужна.
              </p>
              <Link href="/register" className="btn btn-primary btn-sm mt-5">
                Забрать бонус
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[#1d6ea8]">
                <Banknote className="size-4" aria-hidden="true" />
                Для компаний
              </div>
              <h3 className="mt-3 text-[1.35rem] font-bold tracking-[-0.03em]">
                Счёт и закрывающие документы
              </h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
                Работаем с юрлицами и ИП. Подготовим счёт на нужную сумму,
                предоставим акт и чек. Оплата по счёту — без комиссии.
              </p>
              <a
                href={`mailto:${SITE.supportEmail}?subject=Счёт%20на%20оплату%20CheApi`}
                className="btn btn-ghost btn-sm mt-5"
              >
                Запросить счёт
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PAYMENTS */}
      <section className="container-page py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">Оплата</p>
            <h2 className="h2 mt-3 text-balance">Без зарубежных карт и VPN</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              Пополнение проходит через ЮKassa — российский платёжный сервис.
              Данные карты не попадают на наши серверы. Токены зачисляются
              автоматически после подтверждения платежа.
            </p>
            <ul className="mt-6 grid gap-2.5">
              {[
                "Карты МИР, Visa и Mastercard российских банков",
                "СБП: оплата по QR-коду из приложения банка",
                "ЮMoney и другие кошельки",
                "Счёт для юридических лиц",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[0.875rem] text-ink-soft">
                  <Check className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: CreditCard,
                title: "Карта",
                text: "От 25 ₽. Зачисление за несколько секунд после подтверждения.",
              },
              {
                icon: BadgeCheck,
                title: "СБП",
                text: "Без комиссии. Подходит, если не хочется вводить реквизиты карты.",
              },
              {
                icon: ImageIcon,
                title: "Пакеты изображений",
                text: "Оплата по коэффициенту модели: от 177 400 токенов за изображение.",
              },
              {
                icon: ShieldCheck,
                title: "Безопасность",
                text: "PCI DSS на стороне ЮKassa. Мы не храним данные карт.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-6">
                <item.icon className="size-5 text-green-deep" aria-hidden="true" />
                <h3 className="mt-3 text-[1rem] font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-line/80 bg-white/45 py-16 lg:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h2 mt-3 text-balance">Вопросы о цене</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              Если чего-то не хватает — напишите в Telegram, отвечаем в рабочее
              время.
            </p>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-white mt-6"
            >
              {SITE.telegramHandle}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <Faq items={FAQ_ITEMS} />
        </div>
      </section>

      <section className="container-page py-16 lg:py-20">
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-14 text-center text-white sm:px-10">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-lime/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-xl">
            <h2 className="h2 text-balance !text-white">Начните с бесплатных 5 млн</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/55">
              Зарегистрируйтесь, получите ключ и проверьте качество моделей на
              своих задачах. Пополнить баланс можно в любой момент.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="btn btn-lime btn-lg">
                Создать аккаунт
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/docs"
                className="btn btn-lg border border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Документация
              </Link>
            </div>
            <p className="mt-5 text-[0.75rem] text-white/35">
              Без карты · Оплата в рублях · Токены не сгорают
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
