import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Clock,
  FileText,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { Faq, type FaqItem } from "@/components/faq";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Контакты и реквизиты",
  description:
    "Свяжитесь с CheApi: Telegram-поддержка, email для вопросов и счетов, реквизиты ООО «ЧЕАПИ» и адрес для корреспонденции.",
  alternates: { canonical: "/contacts" },
};

const FAQ: FaqItem[] = [
  {
    question: "Как быстро отвечает поддержка?",
    answer:
      "В Telegram обычно в течение 15–30 минут в рабочее время (10:00–20:00 МСК, будни). На email — до одного рабочего дня. В выходные отвечаем реже, но критические инциденты с оплатой или доступом проверяем каждый день.",
  },
  {
    question: "Можно ли получить счёт для компании?",
    answer:
      "Да. Напишите на support@cheapi.ru с реквизитами компании, суммой и назначением платежа. Подготовим счёт, после оплаты предоставим акт и чек. Работаем с ООО и ИП.",
  },
  {
    question: "Где найти закрывающие документы?",
    answer:
      "Чеки ЮKassa приходят на email после оплаты. Акт и счёт для юрлиц отправляем вручную после платежа — запросите их на support@cheapi.ru, указав дату и сумму пополнения.",
  },
  {
    question: "Куда писать по вопросам персональных данных?",
    answer:
      "На privacy@cheapi.ru. Запросы на доступ, исправление или удаление данных обрабатываем в течение 30 дней. Для удаления аккаунта напишите с email, указанного при регистрации.",
  },
  {
    question: "Есть ли офис для встреч?",
    answer:
      "Юридический адрес указан для корреспонденции. Встречи — по предварительной договорённости; напишите заранее, согласуем время. Основная коммуникация — онлайн.",
  },
];

export default function ContactsPage() {
  return (
    <main>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Контакты CheApi",
            url: `${SITE.url}/contacts`,
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE.legalName,
            alternateName: SITE.name,
            url: SITE.url,
            email: SITE.email,
            taxID: SITE.legal.inn,
            address: {
              "@type": "PostalAddress",
              streetAddress: "ул. Тверская, д. 7, офис 12",
              addressLocality: "Москва",
              postalCode: "125009",
              addressCountry: "RU",
            },
            contactPoint: [
              {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: SITE.supportEmail,
                availableLanguage: ["Russian"],
              },
            ],
          },
        ]}
      />

      <PageHero
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Контакты" }]}
        eyebrow="Контакты"
        title={
          <>
            На связи
            <br />
            <span className="text-gradient">по делу и без ботов</span>
          </>
        }
        description="Поддержка, оплата, документы, интеграции — пишите напрямую. Отвечает команда, которая делает CheApi, а не автоответчик."
        actions={
          <>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
            >
              <Send className="size-4" aria-hidden="true" />
              Telegram-поддержка
            </a>
            <a href={`mailto:${SITE.supportEmail}`} className="btn btn-ghost btn-lg">
              <Mail className="size-4" aria-hidden="true" />
              Написать на email
            </a>
          </>
        }
        aside={
          <div className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <span className="size-2 animate-pulse-dot rounded-full bg-green" />
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-green-deep">
                Поддержка работает
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { icon: Clock, label: "Рабочие часы", value: "10:00–20:00 МСК, будни" },
                { icon: Send, label: "Telegram", value: SITE.telegramHandle },
                { icon: Mail, label: "Email", value: SITE.supportEmail },
                { icon: MapPin, label: "Офис", value: "Москва, Тверская, 7" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-green-deep" aria-hidden="true" />
                  <div>
                    <div className="text-[0.6875rem] text-muted">{item.label}</div>
                    <div className="text-[0.8125rem] font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section className="container-page py-12 lg:py-16">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Send,
              title: "Поддержка",
              text: "Вопросы по API, ключам и оплате.",
              value: SITE.telegramHandle,
              href: SITE.telegram,
              external: true,
            },
            {
              icon: Mail,
              title: "Почта",
              text: "Счета, документы, сотрудничество.",
              value: SITE.supportEmail,
              href: `mailto:${SITE.supportEmail}`,
              external: false,
            },
            {
              icon: FileText,
              title: "Юридические вопросы",
              text: "Договоры, оферта, персональные данные.",
              value: SITE.email,
              href: `mailto:${SITE.email}`,
              external: false,
            },
            {
              icon: Send,
              title: "Telegram-канал",
              text: "Новости моделей, аптайм и промокоды.",
              value: "@cheapi",
              href: SITE.telegramChannel,
              external: true,
            },
          ].map((card) => (
            <a
              key={card.title}
              href={card.href}
              target={card.external ? "_blank" : undefined}
              rel={card.external ? "noopener noreferrer" : undefined}
              className="card card-hover group p-5"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-cream text-ink">
                <card.icon className="size-4" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-[1rem] font-semibold">{card.title}</h2>
              <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">{card.text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-green-deep">
                {card.value}
                <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-5 text-green-deep" aria-hidden="true" />
              <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
                Реквизиты
              </h2>
            </div>
            <dl className="mt-5 divide-y divide-line">
              {[
                ["Наименование", SITE.legalName],
                ["ИНН", SITE.legal.inn],
                ["КПП", SITE.legal.kpp],
                ["ОГРН", SITE.legal.ogrn],
                ["Юридический адрес", SITE.legal.address],
                ["Генеральный директор", SITE.legal.director],
                ["Банк", SITE.legal.bank],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <dt className="text-[0.75rem] text-muted">{label}</dt>
                  <dd className="text-[0.8125rem] font-medium text-ink sm:text-right">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.75rem] leading-relaxed text-muted">
              Для счетов и договоров используйте реквизиты выше. В назначении
              платежа укажите «Оплата доступа к API CheApi» и номер счёта, если
              он был выставлен.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center gap-2.5">
                <Wallet className="size-5 text-green-deep" aria-hidden="true" />
                <h2 className="text-[1.0625rem] font-semibold">Оплата и возвраты</h2>
              </div>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
                Платежи обрабатывает ЮKassa. Если деньги списались, а баланс не
                обновился — пришлите дату, сумму и последние 4 цифры карты. Мы
                найдём платёж и зачислим токены вручную.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/refund" className="btn btn-ghost btn-sm">
                  Политика возврата
                </Link>
                <Link href="/offer" className="btn btn-ghost btn-sm">
                  Оферта
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-5 text-green-deep" aria-hidden="true" />
                <h2 className="text-[1.0625rem] font-semibold">Безопасность</h2>
              </div>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-muted">
                Сообщения о vuln-реакциях и инцидентах безопасности принимаем на{" "}
                <a href={`mailto:${SITE.email}`} className="font-semibold text-green-deep hover:underline">
                  {SITE.email}
                </a>
                . Пожалуйста, не публикуйте детали до нашего ответа.
              </p>
              <Link href="/security" className="btn btn-ghost btn-sm mt-4">
                Как мы защищаем данные
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 className="h2 mt-3 text-balance">Перед тем как писать</h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              Возможно, ответ уже есть здесь. Если нет — Telegram самый быстрый
              канал.
            </p>
            <Link href="/docs" className="btn btn-white mt-6">
              Документация
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <Faq items={FAQ} />
        </div>
      </section>
    </main>
  );
}
