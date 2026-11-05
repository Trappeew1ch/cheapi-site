"use client";

import { useMemo, useState } from "react";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { formatDateTime, formatRub, formatTokens } from "@/lib/format";
import { StatusPill } from "@/components/dashboard-ui";

export type UsageItem = {
  id: string;
  model: string;
  endpoint: string;
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  charged_tokens: number;
  cost_rub: number;
  status: number;
  latency_ms: number;
  created_at: string;
};

export function UsageTable({
  rows,
  names,
}: {
  rows: UsageItem[];
  names: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [model, setModel] = useState("all");
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const models = useMemo(
    () => Array.from(new Set(rows.map((row) => row.model))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (errorsOnly && row.status >= 200 && row.status < 300) return false;
      if (model !== "all" && row.model !== model) return false;
      if (!needle) return true;
      const name = names[row.model] ?? row.model;
      return (
        name.toLowerCase().includes(needle) ||
        row.model.toLowerCase().includes(needle) ||
        row.endpoint.toLowerCase().includes(needle)
      );
    });
  }, [rows, query, model, errorsOnly, names]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  function exportCsv() {
    const header = [
      "date",
      "model",
      "endpoint",
      "input_tokens",
      "output_tokens",
      "cached_tokens",
      "charged_tokens",
      "cost_rub",
      "status",
      "latency_ms",
    ];
    const lines = filtered.map((row) =>
      [
        row.created_at,
        row.model,
        row.endpoint,
        row.input_tokens,
        row.output_tokens,
        row.cached_tokens,
        row.charged_tokens,
        row.cost_rub.toFixed(6),
        row.status,
        row.latency_ms,
      ].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cheapi-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Журнал запросов</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted">
            {filtered.length.toLocaleString("ru-RU")} из {rows.length.toLocaleString("ru-RU")} записей
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Поиск по модели"
              className="field h-9 py-0 pl-9 text-[0.8125rem] sm:w-52"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <select
              value={model}
              onChange={(event) => {
                setModel(event.target.value);
                setPage(0);
              }}
              className="field h-9 py-0 pl-9 pr-8 text-[0.8125rem] sm:w-44"
              aria-label="Фильтр по модели"
            >
              <option value="all">Все модели</option>
              {models.map((id) => (
                <option key={id} value={id}>
                  {names[id] ?? id}
                </option>
              ))}
            </select>
          </div>

          <label className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 text-[0.8125rem] text-muted">
            <input
              type="checkbox"
              checked={errorsOnly}
              onChange={(event) => {
                setErrorsOnly(event.target.checked);
                setPage(0);
              }}
              className="size-3.5 accent-[#12b76a]"
            />
            Ошибки
          </label>

          <button
            type="button"
            onClick={exportCsv}
            className="btn btn-white btn-sm h-9 shrink-0"
            title="Скачать CSV"
          >
            <Download className="size-3.5" />
            CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 text-center text-[0.875rem] text-muted">
          Ничего не нашлось. Измените фильтры или отправьте новый запрос.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Время</th>
                <th>Модель</th>
                <th>Вход / выход</th>
                <th>Кеш</th>
                <th>Списано</th>
                <th>Стоимость</th>
                <th>Задержка</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap text-[0.75rem] text-muted">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td>
                    <div className="whitespace-nowrap font-medium">{names[row.model] ?? row.model}</div>
                    <div className="font-mono text-[0.625rem] text-muted">{row.endpoint}</div>
                  </td>
                  <td className="whitespace-nowrap font-mono text-[0.6875rem] text-muted">
                    {row.input_tokens.toLocaleString("ru-RU")} /{" "}
                    {row.output_tokens.toLocaleString("ru-RU")}
                  </td>
                  <td className="whitespace-nowrap font-mono text-[0.6875rem] text-muted">
                    {row.cached_tokens ? row.cached_tokens.toLocaleString("ru-RU") : "—"}
                  </td>
                  <td className="whitespace-nowrap font-mono text-[0.75rem]">
                    {formatTokens(row.charged_tokens)}
                  </td>
                  <td className="whitespace-nowrap text-[0.75rem]">{formatRub(row.cost_rub, 4)}</td>
                  <td className="whitespace-nowrap text-[0.6875rem] text-muted">
                    {row.latency_ms.toLocaleString("ru-RU")} мс
                  </td>
                  <td>
                    <StatusPill status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span className="text-[0.75rem] text-muted">
            {currentPage * pageSize + 1}–
            {Math.min(filtered.length, (currentPage + 1) * pageSize)} из{" "}
            {filtered.length.toLocaleString("ru-RU")}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={currentPage === 0}
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[0.75rem] font-medium text-ink-soft transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              Назад
            </button>
            <span className="text-[0.6875rem] text-muted">
              {currentPage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              disabled={currentPage >= pageCount - 1}
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[0.75rem] font-medium text-ink-soft transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-40"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
