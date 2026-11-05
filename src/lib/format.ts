const numberFormatter = new Intl.NumberFormat("ru-RU");

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
}

export function formatRub(value: number, digits = 2): string {
  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)} ₽`;
}

export function formatRubShort(value: number): string {
  if (value >= 1000) {
    return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value)} ₽`;
  }
  return formatRub(value, value < 1 ? 2 : 0);
}

export function formatTokens(value: number): string {
  if (value >= 1_000_000_000) {
    return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000_000)} млрд`;
  }
  if (value >= 1_000_000) {
    return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value / 1_000_000)} млн`;
  }
  if (value >= 1000) {
    return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value / 1000)} тыс.`;
  }
  return numberFormatter.format(value);
}

export function formatTokensExact(value: number): string {
  return numberFormatter.format(Math.round(value));
}

export function formatCoef(value: number): string {
  return `×${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value)}`;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string | number | Date): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export function formatShortDate(value: string | number | Date): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export function formatDateTime(value: string | number | Date): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export function formatRelative(value: string | number | Date): string {
  const date = new Date(value).getTime();
  const diff = Date.now() - date;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} дн назад`;
  return formatShortDate(date);
}

export function plural(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function formatPercent(value: number, digits = 0): string {
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
  }).format(value * 100)}%`;
}
