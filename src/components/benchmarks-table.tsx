"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import { type FamilyId, type ModelKind } from "@/lib/models";
import { BENCHMARK_SOURCE } from "@/content/benchmarks";
import { cn, formatRub } from "@/lib/format";
import { ModelIcon } from "@/components/model-icon";

export type BenchmarkRow = {
  id: string;
  name: string;
  family: FamilyId;
  kind: ModelKind;
  coef: number;
  price: number;
  score: number | null;
  costPerTask: number | null;
  outputSpeed: number | null;
  latency: number | null;
  variant: string;
};

const FAMILY_TABS: Array<{ id: FamilyId | "all"; label: string }> = [
  { id: "all", label: "Все" },
  { id: "gpt", label: "GPT" },
  { id: "claude", label: "Claude" },
  { id: "kimi", label: "Kimi" },
  { id: "glm", label: "GLM" },
  { id: "deepseek", label: "DeepSeek" },
];

type Sort = "score" | "price" | "speed";

export function BenchmarksTable({ rows }: { rows: BenchmarkRow[] }) {
  const [family, setFamily] = useState<FamilyId | "all">("all");
  const [sort, setSort] = useState<Sort>("score");

  const visible = useMemo(() => {
    const filtered =
      family === "all" ? rows : rows.filter((row) => row.family === family);
    return [...filtered].sort((a, b) => {
      if (sort === "price") {
        return a.price - b.price;
      }
      if (sort === "speed") {
        return (b.outputSpeed ?? -1) - (a.outputSpeed ?? -1);
      }
      return (b.score ?? -1) - (a.score ?? -1);
    });
  }, [rows, family, sort]);

  const maxScore = Math.max(60, ...rows.map((row) => row.score ?? 0));

  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-white">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-cream p-1">
          {FAMILY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFamily(tab.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.75rem] font-semibold transition-colors",
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

        <label className="flex items-center gap-2 text-[0.75rem] text-muted">
          Сортировать
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="field h-9 w-auto py-0 text-[0.8125rem]"
          >
            <option value="score">По интеллекту</option>
            <option value="price">По цене</option>
            <option value="speed">По скорости</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table min-w-[760px]">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Модель</th>
              <th>Интеллект</th>
              <th>Цена CheApi</th>
              <th>Задача в AA</th>
              <th>Скорость</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr key={row.id} className={cn(!row.score && "text-muted")}>
                <td className="font-mono text-[0.6875rem] text-muted">
                  {row.score ? index + 1 : "—"}
                </td>
                <td>
                  <Link
                    href={`/models/${row.id}`}
                    className="inline-flex items-center gap-2.5 font-semibold text-ink hover:text-green-deep"
                  >
                    <ModelIcon family={row.family} size={24} plain className="rounded-lg" />
                    <span>
                      {row.name}
                      <span className="ml-1.5 font-mono text-[0.625rem] font-normal text-muted">
                        {row.variant}
                      </span>
                    </span>
                    <ArrowUpRight className="size-3 text-muted" aria-hidden="true" />
                  </Link>
                </td>
                <td>
                  {row.score ? (
                    <div className="flex items-center gap-2">
                      <span className="w-8 font-mono text-[0.8125rem] font-semibold text-ink">
                        {row.score}
                      </span>
                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-cream-deep">
                        <span
                          className="block h-full rounded-full bg-green"
                          style={{ width: `${(row.score / maxScore) * 100}%` }}
                        />
                      </span>
                    </div>
                  ) : (
                    <span className="text-[0.75rem]">нет замера</span>
                  )}
                </td>
                <td className="whitespace-nowrap text-[0.8125rem] font-medium tabular-nums">
                  {formatRub(row.price, 2)}
                  <span className="ml-1 text-[0.625rem] text-muted">/ 1 млн</span>
                </td>
                <td className="whitespace-nowrap text-[0.75rem] tabular-nums text-muted">
                  {row.costPerTask !== null ? `$${row.costPerTask.toFixed(2)}` : "—"}
                </td>
                <td className="whitespace-nowrap text-[0.75rem] tabular-nums text-muted">
                  {row.outputSpeed !== null ? `${row.outputSpeed.toFixed(0)} tok/s` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 border-t border-line px-4 py-3 text-[0.6875rem] leading-relaxed text-muted sm:px-5">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        <span>
          Источник:{" "}
          <a
            href={BENCHMARK_SOURCE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-deep hover:underline"
          >
            {BENCHMARK_SOURCE.name}
          </a>
          , {BENCHMARK_SOURCE.index}. Стоимость задачи и скорость — оценки AA, не
          счёт CheApi. «Нет замера» не означает низкое качество.
        </span>
      </div>
    </div>
  );
}
