/**
 * Pricing model.
 *
 * CheApi resells upstream model access with a ×2 markup. Upstream publishes a
 * base rate that depends on the top-up amount; we mirror the same tier curve
 * and halve the token yield, which is exactly a 2× price for the customer.
 */

export const MARKUP = 2;
export const UPSTREAM_PRICE_MULTIPLIER = 2.37875;
export const CACHE_MULTIPLIER = 0.4;
export const PRIORITY_MULTIPLIER = 2;
export const IMAGE_OUTPUT_MULTIPLIER = 200;
export const MIN_TOPUP_RUB = 25;
export const MAX_TOPUP_RUB = 50_000;
export const DEFAULT_TOPUP_RUB = 600;

/** Upstream top-up curve: rubles → upstream "base" tokens before its markup divisor. */
const UPSTREAM_POINTS: Array<[rub: number, tokens: number]> = [
  [25, 5_000_000],
  [50, 13_333_334],
  [75, 21_666_667],
  [100, 33_333_334],
  [150, 51_000_000],
  [200, 69_333_334],
  [250, 88_333_334],
  [300, 108_000_000],
  [350, 128_333_334],
  [400, 150_666_667],
  [450, 174_000_000],
  [500, 198_333_334],
  [550, 223_666_667],
  [600, 250_000_000],
  [650, 277_333_334],
  [700, 305_666_667],
  [750, 335_000_000],
  [800, 362_666_667],
  [850, 389_666_667],
  [900, 415_666_667],
  [950, 440_666_667],
  [1000, 466_666_667],
  [1500, 725_000_000],
  [2000, 1_000_000_000],
  [2500, 1_291_666_667],
  [3000, 1_600_000_000],
  [3500, 1_925_000_000],
  [4000, 2_266_666_667],
  [4500, 2_625_000_000],
  [5000, 3_000_000_000],
  [15_000, 10_000_000_000],
  [50_000, 33_333_333_333],
];

/** Upstream base tokens → CheApi balance tokens (their display yield divided by our markup). */
const TOKEN_DIVISOR = UPSTREAM_PRICE_MULTIPLIER * MARKUP;

function interpolateUpstreamTokens(rub: number): number {
  const clamped = Math.min(MAX_TOPUP_RUB, Math.max(0, Number(rub) || 0));
  const points = UPSTREAM_POINTS;

  if (clamped <= points[0][0]) return points[0][1];

  for (let i = 0; i < points.length - 1; i += 1) {
    const [leftRub, leftTokens] = points[i];
    const [rightRub, rightTokens] = points[i + 1];
    if (clamped >= leftRub && clamped <= rightRub) {
      const ratio = (clamped - leftRub) / (rightRub - leftRub);
      return Math.round(leftTokens + (rightTokens - leftTokens) * ratio);
    }
  }

  return points[points.length - 1][1];
}

/** How many balance tokens a top-up credits at CheApi. */
export function tokensForRub(rub: number): number {
  const clamped = Math.min(MAX_TOPUP_RUB, Math.max(MIN_TOPUP_RUB, Number(rub) || 0));
  return Math.round(interpolateUpstreamTokens(clamped) / TOKEN_DIVISOR);
}

/** Customer price for 1M base tokens at a given top-up amount. */
export function rateForRub(rub: number = DEFAULT_TOPUP_RUB): number {
  const tokens = tokensForRub(rub);
  return (Math.min(MAX_TOPUP_RUB, Math.max(MIN_TOPUP_RUB, rub)) / tokens) * 1_000_000;
}

export const DEFAULT_RATE = rateForRub(DEFAULT_TOPUP_RUB);

/** Price of 1M tokens for a model (input and output are priced equally). */
export function modelPricePerMillion(coef: number, rub: number = DEFAULT_TOPUP_RUB): number {
  return rateForRub(rub) * coef;
}

export function cachedPricePerMillion(coef: number, rub: number = DEFAULT_TOPUP_RUB): number {
  return modelPricePerMillion(coef, rub) * CACHE_MULTIPLIER;
}

export function rublesForTokens(tokens: number, rate: number = DEFAULT_RATE): number {
  return (tokens * rate) / 1_000_000;
}

export type Usage = {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
};

/** Convert raw provider usage into "charged" (billing) tokens. */
export function chargedTokens(usage: Usage, coef: number): number {
  const cached = Math.max(0, usage.cachedTokens || 0);
  const input = Math.max(0, usage.inputTokens || 0);
  const output = Math.max(0, usage.outputTokens || 0);

  const billable = input + output + cached * CACHE_MULTIPLIER;
  return Math.max(0, Math.ceil(billable * coef));
}

/** Rough fallback when a provider does not return usage. */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(new TextEncoder().encode(text).length / 4));
}

/**
 * Top-up presets sized for the average flagship model.
 *
 * Flagship coefficients: GPT 6 Astra ×11.25, Claude Opus 5.5 ×20,
 * Kimi K3.1 Pro ×11, GLM 5.3 ×1.5, DeepSeek V4 Pro ×0.2 — average ×8.79.
 * Coding workload: 300k tokens/hour × 4 hours/day × 5 days/week = 6M
 * base tokens per week. At that pace the average flagship needs about
 * 52.7M tokens per week, 228M per month, 1.37B per six months and
 * 2.74B per year. Presets below are the nearest readable amounts that
 * cover each period (with a small buffer).
 */
export const TOPUP_PRESETS = [
  {
    rub: 600,
    label: "Неделя",
    hint: "Хватит примерно на неделю кодинга на топовых моделях",
  },
  {
    rub: 2500,
    label: "Месяц",
    hint: "Хватит примерно на месяц кодинга на топовых моделях",
  },
  {
    rub: 12_000,
    label: "6 месяцев",
    hint: "Хватит примерно на полгода кодинга на топовых моделях",
  },
  {
    rub: 20_000,
    label: "Год",
    hint: "Хватит примерно на год кодинга на топовых моделях",
  },
] as const;

export const TOPUP_TIERS = [
  { rub: 600, note: "Стартовый · неделя" },
  { rub: 2500, note: "На месяц" },
  { rub: 3000, note: "Для команды" },
  { rub: 12_000, note: "На полгода" },
  { rub: 15_000, note: "Максимальная выгода" },
  { rub: 20_000, note: "На год" },
] as const;

export const WELCOME_TOKENS = Number(process.env.WELCOME_TOKENS ?? 5_000_000);

export function volumeDiscount(rub: number): number {
  const base = rateForRub(MIN_TOPUP_RUB);
  return Math.max(0, 1 - rateForRub(rub) / base);
}
