import Link from "next/link";
import { ArrowUpRight, Mail, Send } from "lucide-react";
import { FOOTER_NAV, SITE } from "@/lib/site";

const PAYMENTS = ["ЮKassa", "МИР", "СБП", "ЮMoney"];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white/65">
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.6fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-white"
              aria-label="CheApi — на главную"
            >
              <span className="grid size-9 place-items-center rounded-[11px] bg-lime text-ink">
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6.5 5.5 12 12l-5.5 6.5" />
                  <path d="M13 5.5 18.5 12 13 18.5" opacity=".55" />
                </svg>
              </span>
              <span className="text-[1.32rem] font-extrabold tracking-[-0.04em]">
                che<span className="text-lime">api</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-white/55">
              Один API-ключ ко всем AI-моделям. Оплата в рублях, прозрачные
              токены и никакой подписки.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={SITE.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[0.8125rem] font-medium text-white transition-colors hover:bg-white/10"
              >
                <Send className="size-3.5 text-lime" aria-hidden="true" />
                {SITE.telegramHandle}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-[0.8125rem] font-medium text-white transition-colors hover:bg-white/10"
              >
                <Mail className="size-3.5 text-lime" aria-hidden="true" />
                {SITE.email}
              </a>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[0.75rem]">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-green" />
              <span className="text-white/70">Все системы работают</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white/40">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => {
                    const external = link.href.startsWith("http");
                    return (
                      <li key={link.href}>
                        {external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[0.875rem] text-white/60 transition-colors hover:text-lime"
                          >
                            {link.label}
                            <ArrowUpRight className="size-3 opacity-60" />
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-[0.875rem] text-white/60 transition-colors hover:text-lime"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.75rem] uppercase tracking-[0.12em] text-white/35">
              Оплата
            </span>
            {PAYMENTS.map((payment) => (
              <span
                key={payment}
                className="rounded-md border border-white/12 bg-white/5 px-2.5 py-1 text-[0.6875rem] font-semibold text-white/55"
              >
                {payment}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 text-[0.75rem] leading-relaxed text-white/35 lg:flex-row lg:items-start lg:justify-between">
            <p className="max-w-2xl">
              © {SITE.startedYear} {SITE.legalName}. ИНН {SITE.legal.inn}, ОГРН{" "}
              {SITE.legal.ogrn}. {SITE.legal.address}. CheApi — независимый
              сервис доступа к моделям через API. Не является официальным
              сайтом OpenAI, Anthropic, Z.ai или DeepSeek и не аффилирован с
              ними.
            </p>
            <p className="shrink-0">
              {SITE.domain} ·{" "}
              <Link href="/offer" className="hover:text-white/60">
                Оферта
              </Link>{" "}
              ·{" "}
              <Link href="/privacy" className="hover:text-white/60">
                Конфиденциальность
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
