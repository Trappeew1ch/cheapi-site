"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/format";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="flex h-[62px] items-center justify-between gap-4 rounded-[18px] border border-line/80 bg-cream/80 px-4 shadow-[0_10px_30px_-24px_rgba(11,31,22,0.45)] backdrop-blur-xl sm:px-5">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
            {NAV.map((item) => {
              const active =
                item.href === "/docs"
                  ? pathname.startsWith("/docs")
                  : item.href === "/blog"
                    ? pathname.startsWith("/blog")
                    : false;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[0.875rem] font-medium text-ink-soft transition-colors hover:bg-white/70 hover:text-ink",
                    active && "bg-white text-ink shadow-sm",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-3.5 py-2 text-[0.875rem] font-semibold text-ink-soft transition-colors hover:text-ink sm:block"
            >
              Войти
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Начать
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="grid size-9 place-items-center rounded-full border border-line bg-white text-ink lg:hidden"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={open}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div
            className="mt-2 overflow-hidden rounded-[18px] border border-line bg-paper p-2 shadow-lift lg:hidden"
            onClick={() => setOpen(false)}
          >
            <nav aria-label="Мобильная навигация" className="grid">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-[0.95rem] font-medium text-ink-soft hover:bg-cream"
                >
                  {item.label}
                  <ArrowUpRight className="size-4 text-muted" />
                </Link>
              ))}
            </nav>
            <div className="mt-1 grid grid-cols-2 gap-2 border-t border-line p-2 pt-3">
              <Link href="/login" className="btn btn-ghost btn-sm w-full">
                Войти
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm w-full">
                Создать аккаунт
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
