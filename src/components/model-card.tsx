import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FAMILIES, IMAGE_MIN_TOKENS, type Model } from "@/lib/models";
import { formatCoef, formatRub, formatTokens } from "@/lib/format";
import { DEFAULT_TOPUP_RUB, modelPricePerMillion, rateForRub } from "@/lib/pricing";
import { cn } from "@/lib/format";
import { ModelIcon } from "@/components/model-icon";

export function ModelCard({
  model,
  className,
}: {
  model: Model;
  className?: string;
}) {
  const family = FAMILIES[model.family];
  const isImage = model.kind === "image";
  const price = modelPricePerMillion(model.coef, DEFAULT_TOPUP_RUB);
  const imageTokens = model.imageMinTokens ?? IMAGE_MIN_TOKENS;
  const imagePrice = (imageTokens * rateForRub(DEFAULT_TOPUP_RUB)) / 1_000_000;

  return (
    <Link
      href={`/models/${model.id}`}
      className={cn(
        "group card card-hover relative flex flex-col p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ModelIcon model={model} size={32} />
          <div className="min-w-0">
            <div className="truncate text-[0.9375rem] font-semibold leading-tight text-ink">
              {model.name}
            </div>
            <div className="mt-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted">
              {family.vendor}
            </div>
          </div>
        </div>
        <ArrowUpRight
          className="size-4 shrink-0 text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
          aria-hidden="true"
        />
      </div>

      <p className="mt-4 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted">
        {model.tagline}
      </p>

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div>
          <div className="text-[1.0625rem] font-bold tracking-[-0.02em] tabular-nums">
            {formatRub(isImage ? imagePrice : price, 2)}
          </div>
          <div className="mt-0.5 text-[0.6875rem] text-muted">
            {isImage ? "за изображение" : "за 1 млн токенов"}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-md bg-cream px-1.5 py-0.5 font-mono text-[0.6875rem] text-ink-soft">
            {isImage ? `${formatTokens(imageTokens)} ток.` : formatCoef(model.coef)}
          </span>
          {model.badge && (
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-green-deep">
              {model.badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
