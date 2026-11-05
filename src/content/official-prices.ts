/**
 * Официальные тарифы для честного сравнения «во сколько раз дешевле».
 *
 * Источник: OpenRouter API (https://openrouter.ai/api/v1/models), снято 5 ноября 2026.
 * OpenRouter агрегирует официальные тарифы провайдеров; это ориентир, а не
 * прямой счёт от OpenAI/Anthropic. Тарифы меняются — сверяйтесь с источником.
 *
 * Методика: стандартный запрос 10 000 входных + 2 000 выходных токенов.
 * Официальная стоимость = (10 000 × input + 2 000 × output) в USD × курс.
 * CheApi: (12 000 × coef) базовых токенов по ставке пополнения.
 * Курс USD/RUB = 81 (ЦБ РФ, начало ноября 2026).
 */

export const OFFICIAL_FX_RUB_PER_USD = 81;
export const OFFICIAL_FX_DATE = "5 ноября 2026";

export const OFFICIAL_SOURCE = {
  name: "OpenRouter",
  url: "https://openrouter.ai/api/v1/models",
  checked: "5 ноября 2026",
  note: "Агрегатор официальных тарифов. Стандартный запрос: 10 000 входных + 2 000 выходных токенов.",
} as const;

export type OfficialPrice = {
  /** ID модели на OpenRouter для проверки. */
  openRouterId: string;
  /** USD за 1 млн входных токенов. */
  inputUsdPerM: number;
  /** USD за 1 млн выходных токенов. */
  outputUsdPerM: number;
};

export const STD_REQUEST_INPUT = 10_000;
export const STD_REQUEST_OUTPUT = 2_000;

/** CheApi model id → официальный тариф. Нет записи = нет сопоставимой модели. */
export const OFFICIAL_PRICES: Record<string, OfficialPrice> = {
  "gpt-6.1-sol": { openRouterId: "openai/gpt-6.1-sol", inputUsdPerM: 2, outputUsdPerM: 10 },
  "gpt-6-sol": { openRouterId: "openai/gpt-6-sol", inputUsdPerM: 2, outputUsdPerM: 10 },
  "gpt-6-astra": { openRouterId: "openai/gpt-6-astra", inputUsdPerM: 10, outputUsdPerM: 50 },
  "gpt-6.1-terra": { openRouterId: "openai/gpt-6.1-terra", inputUsdPerM: 1, outputUsdPerM: 5 },
  "gpt-6-luna": { openRouterId: "openai/gpt-6-luna", inputUsdPerM: 0.1, outputUsdPerM: 0.5 },
  "gpt-5.6-sol": { openRouterId: "openai/gpt-5.6-sol", inputUsdPerM: 4, outputUsdPerM: 20 },
  "gpt-5.6-terra": { openRouterId: "openai/gpt-5.6-terra", inputUsdPerM: 2, outputUsdPerM: 12 },
  "gpt-5.6-luna": { openRouterId: "openai/gpt-5.6-luna", inputUsdPerM: 0.2, outputUsdPerM: 1.2 },
  "gpt-5.5": { openRouterId: "openai/gpt-5.5", inputUsdPerM: 5, outputUsdPerM: 30 },
  "claude-opus-5-5": { openRouterId: "anthropic/claude-opus-5.5", inputUsdPerM: 4, outputUsdPerM: 20 },
  "claude-opus-5": { openRouterId: "anthropic/claude-opus-5", inputUsdPerM: 5, outputUsdPerM: 25 },
  "claude-opus-4-8": { openRouterId: "anthropic/claude-opus-4.8", inputUsdPerM: 5, outputUsdPerM: 25 },
  "claude-opus-4-7": { openRouterId: "anthropic/claude-opus-4.7", inputUsdPerM: 5, outputUsdPerM: 25 },
  "claude-opus-4-6": { openRouterId: "anthropic/claude-opus-4.6", inputUsdPerM: 5, outputUsdPerM: 25 },
  "claude-opus-4-5": { openRouterId: "anthropic/claude-opus-4.5", inputUsdPerM: 5, outputUsdPerM: 25 },
  "claude-sonnet-5-5": { openRouterId: "anthropic/claude-sonnet-5.5", inputUsdPerM: 2, outputUsdPerM: 10 },
  "claude-sonnet-5": { openRouterId: "anthropic/claude-sonnet-5", inputUsdPerM: 2, outputUsdPerM: 10 },
  "claude-haiku-5-5": { openRouterId: "anthropic/claude-haiku-5.5", inputUsdPerM: 0.1, outputUsdPerM: 0.5 },
  "claude-haiku-4-5-20251001": { openRouterId: "anthropic/claude-haiku-4.5", inputUsdPerM: 1, outputUsdPerM: 5 },
  "claude-fable-5-1": { openRouterId: "anthropic/claude-fable-5.1", inputUsdPerM: 10, outputUsdPerM: 50 },
  "kimi-k3.1-pro": { openRouterId: "moonshotai/kimi-k3.1-pro", inputUsdPerM: 2, outputUsdPerM: 10 },
  "glm-5.3": { openRouterId: "z-ai/glm-5.3", inputUsdPerM: 0.0699, outputUsdPerM: 1.4 },
  "glm-5.2": { openRouterId: "z-ai/glm-5.2", inputUsdPerM: 0.006, outputUsdPerM: 6.8 },
  "glm-5.3-flash": { openRouterId: "z-ai/glm-5.3-flash", inputUsdPerM: 0.15, outputUsdPerM: 0.5 },
  "deepseek-flash": { openRouterId: "deepseek/deepseek-v4.1-flash-1017", inputUsdPerM: 0.15, outputUsdPerM: 0.6 },
  "deepseek-v4-pro": { openRouterId: "deepseek/deepseek-v4-pro", inputUsdPerM: 1.6, outputUsdPerM: 3.2 },
};

export function officialRequestRub(modelId: string): number | null {
  const official = OFFICIAL_PRICES[modelId];
  if (!official) return null;
  const usd =
    (STD_REQUEST_INPUT * official.inputUsdPerM +
      STD_REQUEST_OUTPUT * official.outputUsdPerM) /
    1_000_000;
  return usd * OFFICIAL_FX_RUB_PER_USD;
}

export function cheapiRequestRub(coef: number, ratePerMillion: number): number {
  return ((STD_REQUEST_INPUT + STD_REQUEST_OUTPUT) * coef * ratePerMillion) / 1_000_000;
}

/**
 * Во сколько раз CheApi дешевле официалки для стандартного запроса.
 * > 1 — дешевле, < 1 — дороже. null — нет сопоставимой модели.
 */
export function officialMultiplier(
  modelId: string,
  coef: number,
  ratePerMillion: number,
): number | null {
  const official = officialRequestRub(modelId);
  if (official === null) return null;
  const ours = cheapiRequestRub(coef, ratePerMillion);
  if (ours <= 0) return null;
  return official / ours;
}

export function formatMultiplier(mult: number | null): string {
  if (mult === null) return "—";
  if (mult >= 1.05) {
    const value = mult >= 10 ? Math.round(mult) : Math.round(mult * 10) / 10;
    return `дешевле в ${String(value).replace(".", ",")} раза`;
  }
  if (mult < 0.95) {
    const times = 1 / mult;
    const value = times >= 10 ? Math.round(times) : Math.round(times * 10) / 10;
    return `дороже в ${String(value).replace(".", ",")} раза`;
  }
  return "≈ официальный тариф";
}
