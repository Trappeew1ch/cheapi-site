export type Benchmark = {
  modelId: string;
  /** Artificial Analysis Intelligence Index v5.0.1, 0–100. */
  score: number | null;
  /** Weighted average cost per Intelligence Index task, USD. */
  costPerTask: number | null;
  /** Median output tokens per second. */
  outputSpeed: number | null;
  /** Time to first answer token, seconds. */
  latency: number | null;
  /** Which effort/variant the score belongs to. */
  variant: string;
  /** AA model slug for attribution. */
  sourceSlug?: string;
};

export const BENCHMARK_SOURCE = {
  name: "Artificial Analysis",
  url: "https://artificialanalysis.ai/leaderboards/models",
  index: "Intelligence Index v5.0.1",
  updated: "5 ноября 2026",
  note: "Независимый индекс: 9 оценок, включая агентные задачи, код, знания и документы. Высокий балл не гарантирует лучший результат в вашем сценарии.",
} as const;

/**
 * Scores are taken from Artificial Analysis public leaderboard.
 * For models with several effort levels we use the strongest public score.
 * `null` means the model was not evaluated in the current index, not zero.
 */
export const BENCHMARKS: Record<string, Benchmark> = {
  "gpt-6.1-sol": {
    modelId: "gpt-6.1-sol",
    score: 55,
    costPerTask: 1.27,
    outputSpeed: 21.2,
    latency: 168.9,
    variant: "max",
    sourceSlug: "gpt-6-1-sol",
  },
  "gpt-6-astra": {
    modelId: "gpt-6-astra",
    score: 57,
    costPerTask: 6.24,
    outputSpeed: 19.1,
    latency: 208.35,
    variant: "max",
    sourceSlug: "gpt-6-astra",
  },
  "gpt-6.1-terra": {
    modelId: "gpt-6.1-terra",
    score: 51,
    costPerTask: 0.96,
    outputSpeed: 13.1,
    latency: 159.59,
    variant: "max",
    sourceSlug: "gpt-6-1-terra",
  },
  "gpt-6-luna": {
    modelId: "gpt-6-luna",
    score: 28,
    costPerTask: 0.15,
    outputSpeed: 12,
    latency: 84.91,
    variant: "max",
    sourceSlug: "gpt-6-luna",
  },
  "claude-opus-5-5": {
    modelId: "claude-opus-5-5",
    score: 59,
    costPerTask: 10.04,
    outputSpeed: 26.2,
    latency: 345.77,
    variant: "max",
    sourceSlug: "claude-opus-5-5",
  },
  "claude-fable-5-1": {
    modelId: "claude-fable-5-1",
    score: 50,
    costPerTask: 10.85,
    outputSpeed: 18.6,
    latency: 58.2,
    variant: "xhigh",
    sourceSlug: "claude-fable-5-1-xhigh",
  },
  "claude-sonnet-5-5": {
    modelId: "claude-sonnet-5-5",
    score: 55,
    costPerTask: 10.02,
    outputSpeed: 30.7,
    latency: 258.46,
    variant: "max",
    sourceSlug: "claude-sonnet-5-5",
  },
  "claude-haiku-5-5": {
    modelId: "claude-haiku-5-5",
    score: 36,
    costPerTask: 0.41,
    outputSpeed: 14.6,
    latency: 178.94,
    variant: "max",
    sourceSlug: "claude-haiku-5-5",
  },
  "kimi-k3.1-pro": {
    modelId: "kimi-k3.1-pro",
    score: 46,
    costPerTask: 3.68,
    outputSpeed: 36,
    latency: 153.54,
    variant: "default",
    sourceSlug: "kimi-k3-1-pro",
  },
  "glm-5.3": {
    modelId: "glm-5.3",
    score: 32,
    costPerTask: 5.01,
    outputSpeed: 30.7,
    latency: 96.04,
    variant: "max",
    sourceSlug: "glm-5-3",
  },
  "glm-5.3-flash": {
    modelId: "glm-5.3-flash",
    score: 28,
    costPerTask: 0.58,
    outputSpeed: 37.8,
    latency: 84.22,
    variant: "default",
    sourceSlug: "glm-5-3-flash",
  },
  "deepseek-flash": {
    modelId: "deepseek-flash",
    score: 33,
    costPerTask: 0.6,
    outputSpeed: 13.3,
    latency: 50.85,
    variant: "max",
    sourceSlug: "deepseek-v4-1-flash-1017",
  },
  "deepseek-v4-pro": {
    modelId: "deepseek-v4-pro",
    score: 23,
    costPerTask: 1.77,
    outputSpeed: 21.1,
    latency: 66.22,
    variant: "max",
    sourceSlug: "deepseek-v4-pro",
  },
};

export function benchmarkFor(modelId: string): Benchmark | undefined {
  return BENCHMARKS[modelId];
}

export function modelsWithBenchmark(): number {
  return Object.values(BENCHMARKS).filter((item) => item.score !== null).length;
}
