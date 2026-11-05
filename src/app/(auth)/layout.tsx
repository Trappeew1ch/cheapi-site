import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/logo";

const POINTS = [
  "GPT, Claude, Kimi, GLM и DeepSeek — один ключ",
  "Оплата в рублях, без подписки",
  "5 млн токенов бесплатно",
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1fr]">
      <div className="flex min-h-dvh flex-col bg-cream px-5 py-6 sm:px-8 lg:min-h-0 lg:px-12 lg:py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink"
          >
            ← На главную
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] text-muted">
          <Link href="/offer" className="hover:text-ink">
            Оферта
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Конфиденциальность
          </Link>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink p-5 lg:block">
        <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(60rem_36rem_at_85%_-10%,rgba(216,255,106,0.16),transparent_60%),radial-gradient(48rem_30rem_at_0%_100%,rgba(18,183,106,0.2),transparent_65%)] p-10 xl:p-14">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.07]" />

          <div className="relative">
            <h2 className="max-w-[13ch] text-[2.7rem] font-bold leading-[0.98] tracking-[-0.045em] text-white xl:text-[3.3rem]">
              Один ключ.
              <br />
              <span className="text-lime">Все модели.</span>
            </h2>

            <ul className="mt-8 grid gap-2.5">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[0.9375rem] text-white/75">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-lime/15 text-lime">
                    <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
