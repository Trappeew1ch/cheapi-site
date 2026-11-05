"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  FlaskConical,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { formatTokens } from "@/lib/format";
import { cn } from "@/lib/format";

const NAV = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/keys", label: "API-ключи", icon: KeyRound },
  { href: "/dashboard/usage", label: "Использование", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Баланс и оплата", icon: Wallet },
  { href: "/dashboard/playground", label: "Песочница", icon: FlaskConical },
  { href: "/dashboard/instructions", label: "Инструкции", icon: BookOpen },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
] as const;

export function DashboardShell({
  user,
  children,
}: {
  user: { email: string; balance_tokens: number; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const navigation = (
    <>
      <div className="flex items-center justify-between px-4 pt-5">
        <Logo tone="light" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Закрыть меню"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-6 px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/40">
              Баланс
            </span>
            <Link
              href="/dashboard/billing"
              className="text-[0.6875rem] font-semibold text-lime hover:underline"
            >
              Пополнить
            </Link>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-[1.45rem] font-bold tracking-[-0.03em] text-white">
              {formatTokens(user.balance_tokens)}
            </span>
            <span className="text-[0.75rem] text-white/40">токенов</span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-lime"
              style={{
                width: `${Math.min(100, Math.max(2, (user.balance_tokens / 25_000_000) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-2.5" aria-label="Навигация кабинета">
        <div className="grid gap-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, "exact" in item ? item.exact : false);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium transition-colors",
                  active
                    ? "bg-lime text-ink"
                    : "text-white/60 hover:bg-white/[0.07] hover:text-white",
                )}
              >
                <Icon
                  className={cn("size-4", active ? "text-ink" : "text-white/45 group-hover:text-white/80")}
                  aria-hidden="true"
                />
                {item.label}
                {active && <ChevronRight className="ml-auto size-3.5" aria-hidden="true" />}
              </Link>
            );
          })}
        </div>

        {user.role === "admin" && (
          <div className="mt-4">
            <div className="px-3 pb-2 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-white/30">
              Администрирование
            </div>
            <Link
              href="/dashboard/admin"
              className={cn(
                "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium transition-colors",
                isActive("/dashboard/admin")
                  ? "bg-lime text-ink"
                  : "text-white/60 hover:bg-white/[0.07] hover:text-white",
              )}
            >
              <ShieldCheck className="size-4 text-white/45 group-hover:text-white/80" />
              Пользователи
            </Link>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-white/10 p-3">
          <p className="text-[0.6875rem] leading-relaxed text-white/45">
            Нужна помощь с интеграцией?
          </p>
          <a
            href="https://t.me/cheapi_support"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-lime hover:underline"
          >
            Написать в Telegram
            <ArrowUpRight className="size-3" />
          </a>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-green/20 text-[0.75rem] font-bold uppercase text-lime">
            {user.email.slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.75rem] font-medium text-white/85">{user.email}</div>
            <div className="text-[0.625rem] text-white/35">
              {user.role === "admin" ? "Администратор" : "Личный кабинет"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            disabled={loggingOut}
            className="grid size-8 place-items-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Выйти из аккаунта"
            title="Выйти"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[266px] flex-col bg-ink lg:flex">
        {navigation}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Закрыть меню"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside
            className="absolute inset-y-0 left-0 flex w-[286px] max-w-[86vw] flex-col bg-ink shadow-2xl"
            onClick={() => setOpen(false)}
          >
            {navigation}
          </aside>
        </div>
      )}

      <div className="lg:pl-[266px]">
        <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="grid size-9 place-items-center rounded-lg border border-line bg-white text-ink"
                aria-label="Открыть меню"
              >
                <Menu className="size-4" />
              </button>
              <Logo />
            </div>
            <Link href="/dashboard/billing" className="btn btn-primary btn-sm">
              {formatTokens(user.balance_tokens)}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 py-7 sm:px-6 lg:px-9 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
