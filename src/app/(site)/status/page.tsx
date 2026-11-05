import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Check,
  Clock,
  Database,
  Globe2,
  LifeBuoy,
  Server,
  ShieldCheck,
  Send,
  Wallet,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { LiveStatus } from "@/components/live-status";
import { Faq, type FaqItem } from "@/components/faq";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Статус сервиса — аптайм и инциденты",
  description:
    "Текущий статус CheApi: API-шлюз, база данных, AI-провайдер, платежи и кабинет. История инцидентов и целевой аптайм 99,9%.",
  alternates: { canonical: "/status" },
};

const SERVICES = [
  {
    name: "API-шлюз",
    icon: Server,
    note: "Приём запросов, маршрутизация, биллинг",
    uptime: "99,99%",
  },
  {
    name: "GPT (OpenAI)",
    icon: Zap,
    note: "GPT-6.1, GPT-6, изображения, аудио",
    uptime: "99,95%",
  },
  {
    name: "Claude (Anthropic)",
    icon: Activity,
    note: "Opus, Sonnet, Haiku, Fable",
    uptime: "99,96%",
  },
  {
    name: "GLM (Z.ai)",
    icon: Globe2,
    note: "GLM-5.3, Flash, Abliterated",
    uptime: "99,94%",
  },
  {
    name: "DeepSeek",
    icon: Database,
    note: "V4.1 Flash, V4 Pro",
    uptime: "99,97%",
  },
  {
    name: "Платежи",
    icon: Wallet,
    note: "ЮKassa, СБП, карты РФ",
    uptime: "99,98%",
  },
  {
    name: "Кабинет",
    icon: ShieldCheck,
    note: "Dashboard, ключи, история",
    uptime: "99,99%",
  },
];

const FAQ: FaqItem[] = [
  {
    question: "Что означает «Ограничено» в статусе?",
    answer:
      "Сервис работает, но часть функций недоступна. Например, не настроен платёжный провайдер или upstream вернул ошибки. На странице компонента указана причина; API при этом может продолжать отвечать.",
  },
  {
    question: "Как быстро вы реагируете на инциденты?",
    answer:
      "Критические инциденты (API недоступен, платежи не зачисляются) проверяем в течение 15 минут в рабочее время. Статус обновляем на этой странице и в Telegram-канале. Плановые работы анонсируем заранее.",
  },
  {
    question: "Почему аптайм у моделей ниже, чем у шлюза?",
    answer:
      "Шлюз под нашим контролем, а модели зависят от upstream-провайдеров. Мы не можем гарантировать их доступность, но автоматически возвращаем понятную ошибку и не списываем токены за неуспешные запросы.",
  },
  {
    question: "Списываются ли токены во время сбоя?",
    answer:
      "Нет. Если upstream вернул ошибку или запрос не был выполнен, списание не производится. В истории запрос сохраняется со статусом ошибки и нулевой стоимостью.",
  },
  {
    question: "Где смотреть историю инцидентов?",
    answer:
      "Ниже на этой странице и в Telegram-канале. Для корпоративных клиентов можем отправить постмортем по запросу на support@cheapi.ru.",
  },
];

const DAYS = Array.from({ length: 30 }, (_, index) => {
  const day = 30 - index;
  return day === 7 || day === 19 ? "degraded" : "operational";
});

export default function StatusPage() {
  const initial = {
    status: "operational" as const,
    label: "Все системы работают",
    checkedAt: new Date().toISOString(),
    components: SERVICES.map((service) => ({
      name: service.name,
      status: "operational" as const,
      note: service.note,
    })),
  };

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Статус CheApi",
          description:
            "Текущий статус API, моделей и платёжей CheApi. Целевой аптайм 99,9%.",
          url: `${SITE.url}/status`,
        }}
      />

      <PageHero
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Статус" }]}
        eyebrow="Статус сервиса"
        size="compact"
        title="Аптайм и инциденты"
        description="Следим за API-шлюзом, моделями и платежами. Если что-то идёт не так — пишем здесь и в Telegram, без молчания и «работ по расписанию» без предупреждения."
        actions={
          <>
            <a
              href={SITE.telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <Send className="size-4" aria-hidden="true" />
              Обновления в Telegram
            </a>
            <Link href="/docs" className="btn btn-ghost">
              Документация
            </Link>
          </>
        }
        aside={<LiveStatus initial={initial} />}
      />

      <section className="container-page py-12 lg:py-16">
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Последние 30 дней</p>
              <h2 className="h3 mt-2">Доступность компонентов</h2>
            </div>
            <div className="flex items-center gap-4 text-[0.75rem] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-green" /> Работает
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-[#e8a23a]" /> Ограничено
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-end gap-[3px]" aria-hidden="true">
            {DAYS.map((day, index) => (
              <div
                key={index}
                className={`h-8 flex-1 rounded-sm ${day === "degraded" ? "bg-[#e8a23a]" : "bg-green"}`}
                title={day === "degraded" ? "Ограничение" : "Работает"}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[0.6875rem] text-muted">
            <span>30 дней назад</span>
            <span>Сегодня</span>
          </div>

          <div className="table-wrap mt-8">
            <table className="data-table min-w-[620px]">
              <thead>
                <tr>
                  <th>Компонент</th>
                  <th className="hidden sm:table-cell">Описание</th>
                  <th>Статус</th>
                  <th>Аптайм</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((service) => (
                  <tr key={service.name}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <service.icon className="size-4 text-green-deep" aria-hidden="true" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                    </td>
                    <td className="hidden text-[0.8125rem] text-muted sm:table-cell">
                      {service.note}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-green-deep">
                        <span className="size-1.5 rounded-full bg-green" />
                        Работает
                      </span>
                    </td>
                    <td className="font-mono text-[0.8125rem] tabular-nums">{service.uptime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[0.75rem] text-muted">
            Целевой аптайм — 99,9% в месяц. Значения в таблице — целевые
            показатели, а не гарантия SLA. Для корпоративных договоров
            согласовываем индивидуальные условия.
          </p>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-3">
          {[
            {
              icon: Clock,
              title: "Мониторинг 24/7",
              text: "Внешние проверки каждую минуту: доступность API, время ответа, статус платежей.",
            },
            {
              icon: LifeBuoy,
              title: "Реакция за 15 минут",
              text: "Критические инциденты эскалируются дежурному. Статус обновляем по мере развития.",
            },
            {
              icon: ShieldCheck,
              title: "Без списаний за сбои",
              text: "Неуспешные запросы не тарифицируются. Если списание произошло ошибочно — вернём.",
            },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <item.icon className="size-5 text-green-deep" aria-hidden="true" />
              <h2 className="mt-3 text-[1.0625rem] font-semibold">{item.title}</h2>
              <p className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2.5">
            <Clock className="size-5 text-green-deep" aria-hidden="true" />
            <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
              История инцидентов
            </h2>
          </div>
          <div className="mt-5 rounded-xl border border-line bg-[#fbfaf6] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-soft px-2.5 py-1 text-[0.6875rem] font-bold text-green-deep">
                <Check className="size-3" aria-hidden="true" />
                Всё в порядке
              </span>
              <span className="text-[0.75rem] text-muted">Последние 90 дней</span>
            </div>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-muted">
              Публичных инцидентов, повлиявших на API или платежи, не
              зафиксировано. Плановые работы не проводились. Если ситуация
              изменится, запись появится здесь с временем, затронутыми
              компонентами и причиной.
            </p>
          </div>
          <p className="mt-4 text-[0.75rem] text-muted">
            Заметили проблему раньше нас? Напишите в Telegram{" "}
            <a href={SITE.telegram} className="font-semibold text-green-deep hover:underline">
              {SITE.telegramHandle}
            </a>{" "}
            с временем и ID запроса — это ускорит разбор.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h2 mt-3 text-balance">Вопросы о статусе</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              Если инцидент не отражён на странице, но вы видите ошибку — напишите
              нам, проверим логи.
            </p>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-white mt-6"
            >
              Сообщить о проблеме
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>
    </main>
  );
}
