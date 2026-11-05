"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ModelCard } from "@/components/model-card";
import { FAMILIES, MODELS, type FamilyId, type ModelKind } from "@/lib/models";
import { cn, plural } from "@/lib/format";
import { ModelIcon } from "@/components/model-icon";

const FAMILY_TABS: Array<{ id: FamilyId | "all"; label: string }> = [
  { id: "all", label: "Все" },
  { id: "gpt", label: "GPT" },
  { id: "claude", label: "Claude" },
  { id: "kimi", label: "Kimi" },
  { id: "glm", label: "GLM" },
  { id: "deepseek", label: "DeepSeek" },
];

const KIND_TABS: Array<{ id: ModelKind | "all"; label: string }> = [
  { id: "all", label: "Любой тип" },
  { id: "chat", label: "Текст и код" },
  { id: "image", label: "Изображения" },
  { id: "audio", label: "Аудио" },
  { id: "embedding", label: "Эмбеддинги" },
];

const FAMILY_ORDER: Record<FamilyId, number> = {
  gpt: 0,
  claude: 1,
  kimi: 2,
  glm: 3,
  deepseek: 4,
};

export function ModelsExplorer({ initialFamily }: { initialFamily?: FamilyId }) {
  const [family, setFamily] = useState<FamilyId | "all">(initialFamily ?? "all");
  const [kind, setKind] = useState<ModelKind | "all">("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return MODELS.filter((model) => {
      if (family !== "all" && model.family !== family) return false;
      if (kind !== "all" && model.kind !== kind) return false;
      if (!needle) return true;
      return (
        model.name.toLowerCase().includes(needle) ||
        model.id.toLowerCase().includes(needle) ||
        model.vendor.toLowerCase().includes(needle) ||
        model.tagline.toLowerCase().includes(needle) ||
        model.bestFor.some((item) => item.toLowerCase().includes(needle))
      );
    }).sort((a, b) => {
      const familyDiff = FAMILY_ORDER[a.family] - FAMILY_ORDER[b.family];
      if (familyDiff !== 0) return familyDiff;
      return b.coef - a.coef;
    });
  }, [family, kind, query]);

  const hasFilters = family !== "all" || kind !== "all" || query.trim() !== "";

  function reset() {
    setFamily("all");
    setKind("all");
    setQuery("");
  }

  return (
    <div>
      <div className="rounded-[24px] border border-line bg-white/80 p-4 shadow-soft backdrop-blur sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Название, ID или задача…"
              aria-label="Поиск по моделям"
              className="field !rounded-full !py-2.5 !pl-10 !pr-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-cream hover:text-ink"
                aria-label="Очистить поиск"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
              <SlidersHorizontal className="size-3.5" aria-hidden="true" />
              Семейство
            </span>
            <div className="flex flex-wrap gap-1 rounded-full bg-cream p-1">
              {FAMILY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFamily(tab.id)}
                  aria-pressed={family === tab.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors",
                    family === tab.id
                      ? "bg-white text-ink shadow-sm"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {tab.id !== "all" && (
                    <ModelIcon family={tab.id} size={16} plain className="rounded-[5px]" />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/70 pt-3">
          {KIND_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setKind(tab.id)}
              aria-pressed={kind === tab.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold transition-colors",
                kind === tab.id
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-[0.75rem] text-muted">
            Найдено: <strong className="font-semibold text-ink">{results.length}</strong>
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="text-[0.75rem] font-semibold text-green-deep hover:underline"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-line-strong bg-white/60 px-6 py-16 text-center">
          <p className="text-[1.0625rem] font-semibold">Ничего не нашлось</p>
          <p className="mx-auto mt-2 max-w-sm text-[0.875rem] text-muted">
            Попробуйте другое название или сбросьте фильтры — в каталоге{" "}
            {MODELS.length} {plural(MODELS.length, "модель", "модели", "моделей")}.
          </p>
          <button type="button" onClick={reset} className="btn btn-ghost btn-sm mt-5">
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.75rem] text-muted">
        <span className="font-medium text-ink-soft">Семейства:</span>
        {(["gpt", "claude", "kimi", "glm", "deepseek"] as FamilyId[]).map((id) => (
          <span key={id} className="inline-flex items-center gap-1.5">
            <ModelIcon family={id} size={16} plain className="rounded-[5px]" />
            {FAMILIES[id].name} · {FAMILIES[id].vendor}
          </span>
        ))}
      </div>
    </div>
  );
}
