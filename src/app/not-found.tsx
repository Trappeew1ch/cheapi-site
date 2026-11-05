import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Boxes, Home } from "lucide-react";
import { Logo } from "@/components/logo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Такой страницы нет. Вернитесь на главную или откройте каталог моделей.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="bg-canvas flex min-h-dvh flex-col">
      <header className="container-page flex items-center justify-between py-6">
        <Logo />
        <Link
          href="/"
          className="text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink"
        >
          ← На главную
        </Link>
      </header>

      <section className="container-page flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 text-[0.75rem] font-semibold text-muted backdrop-blur">
            <span className="size-1.5 rounded-full bg-green" />
            Ошибка 404
          </div>

          <div className="mt-6 font-mono text-[5.5rem] font-bold leading-none tracking-[-0.08em] text-ink/10 sm:text-[7rem]">
            404
          </div>

          <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-[-0.04em] sm:text-[2.5rem]">
            Страница потерялась
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-muted">
            Возможно, ссылка устарела или в адресе опечатка. Проверьте путь или
            начните с одного из разделов ниже.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn btn-primary">
              <Home className="size-4" aria-hidden="true" />
              На главную
            </Link>
            <Link href="/models" className="btn btn-white">
              <Boxes className="size-4" aria-hidden="true" />
              Каталог моделей
            </Link>
            <Link href="/docs" className="btn btn-ghost">
              <BookOpen className="size-4" aria-hidden="true" />
              Документация
            </Link>
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-white/70 p-4 text-left backdrop-blur">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted">
              Популярное
            </p>
            <div className="mt-2 grid gap-1">
              {[
                { href: "/pricing", label: "Цены и калькулятор токенов" },
                { href: "/codex", label: "Подключение Codex CLI" },
                { href: "/claude-code", label: "Подключение Claude Code" },
                { href: "/blog", label: "Блог и руководства" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-lg px-2 py-2 text-[0.8125rem] text-ink-soft transition-colors hover:bg-cream"
                >
                  {item.label}
                  <ArrowRight className="size-3.5 text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="container-page border-t border-line py-5 text-center text-[0.75rem] text-muted">
        {SITE.legalName} ·{" "}
        <a href={`mailto:${SITE.email}`} className="hover:text-ink">
          {SITE.email}
        </a>
      </footer>
    </main>
  );
}
