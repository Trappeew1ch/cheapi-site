import { plural } from "@/lib/format";

/**
 * Workload assumptions for turning a token balance into a human timeframe.
 * These are estimates for active work, not a promise of runtime.
 */
export const WORK_MODES = {
  coding: {
    id: "coding",
    label: "Кодинг-агент",
    short: "Кодинг",
    tokensPerHour: 300_000,
    description: "Codex, Claude Code, Cursor: контекст файлов и инструменты",
  },
  chat: {
    id: "chat",
    label: "Чат и тексты",
    short: "Чат",
    tokensPerHour: 60_000,
    description: "Диалог, редактура, ответы на вопросы",
  },
  batch: {
    id: "batch",
    label: "Пакетная обработка",
    short: "Пакеты",
    tokensPerHour: 1_000_000,
    description: "Массовые запросы без интерактивного ожидания",
  },
} as const;

export type WorkMode = keyof typeof WORK_MODES;

export const HOURS_PER_DAY = 4;
export const DAYS_PER_WEEK = 5;
export const WEEKS_PER_MONTH = 4.33;

/** Raw model tokens available for a balance, before the model coefficient. */
export function rawTokensForModel(baseTokens: number, coef: number): number {
  return Math.max(0, Math.floor(baseTokens / Math.max(coef, 0.01)));
}

/** Active hours at a chosen workload. */
export function hoursForModel(
  baseTokens: number,
  coef: number,
  mode: WorkMode = "coding",
): number {
  const rawTokens = rawTokensForModel(baseTokens, coef);
  return rawTokens / WORK_MODES[mode].tokensPerHour;
}

export function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0 ч";
  if (hours < 1) return `${Math.max(0.1, hours).toFixed(1)} ч`;
  if (hours < 10) return `${hours.toFixed(1)} ч`;
  return `${Math.round(hours).toLocaleString("ru-RU")} ч`;
}

/**
 * Human timeframe for an amount of active hours.
 * 4 active hours per day, 5 days per week.
 */
export function formatWorkTime(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0 ч";
  const days = hours / HOURS_PER_DAY;
  const weeks = days / DAYS_PER_WEEK;
  const months = weeks / WEEKS_PER_MONTH;

  if (months >= 1) {
    return `${formatHours(hours)} · ${months.toFixed(1).replace(".", ",")} мес`;
  }
  if (weeks >= 1) {
    return `${formatHours(hours)} · ${weeks.toFixed(1).replace(".", ",")} нед`;
  }
  if (days >= 1) {
    return `${formatHours(hours)} · ${Math.round(days)} ${plural(
      Math.round(days),
      "день",
      "дня",
      "дней",
    )}`;
  }
  return formatHours(hours);
}
