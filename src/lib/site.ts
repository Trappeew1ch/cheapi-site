const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cheapi.ru"
).replace(/\/$/, "");

export const SITE = {
  name: "CheApi",
  legalName: "ООО «ЧЕАПИ»",
  domain: "cheapi.ru",
  url: SITE_URL,
  apiBase: `${SITE_URL}/v1`,
  tagline: "Все AI-модели. Один ключ.",
  description:
    "GPT, Claude, Kimi, GLM и DeepSeek через один OpenAI-совместимый API. Оплата в рублях, без подписки. Подключите Codex, Claude Code или свой проект за пару минут.",
  shortDescription:
    "Один API-ключ ко всем AI-моделям: GPT, Claude, Kimi, GLM и DeepSeek. Оплата в рублях, без подписки.",
  email: "hello@cheapi.ru",
  supportEmail: "support@cheapi.ru",
  telegram: "https://t.me/cheapi_support",
  telegramHandle: "@cheapi_support",
  telegramChannel: "https://t.me/cheapi",
  startedYear: 2026,
  locale: "ru_RU",
  owner: {
    name: "Рогов Константин Дмитриевич",
    inn: "772595445988",
  },
  legal: {
    inn: "7712345678",
    ogrn: "1237700123456",
    kpp: "771201001",
    address: "125009, г. Москва, ул. Тверская, д. 7, офис 12",
    director: "Черкасов А. П.",
    bank: "АО «Т-Банк», БИК 044525974, р/с 40702810100000000000",
  },
} as const;

export const NAV = [
  { href: "/#pricing", label: "Цены и модели" },
  { href: "/docs", label: "Документация" },
  { href: "/blog", label: "Блог" },
] as const;

export const FOOTER_NAV = [
  {
    title: "Продукт",
    links: [
      { href: "/pricing", label: "Цены и токены" },
      { href: "/api-gpt", label: "API GPT" },
      { href: "/api-claude", label: "API Claude" },
      { href: "/models", label: "Каталог моделей" },
      { href: "/benchmarks", label: "Бенчмарки" },
    ],
  },
  {
    title: "Инструменты",
    links: [
      { href: "/codex", label: "Codex CLI и VS Code" },
      { href: "/claude-code", label: "Claude Code" },
      { href: "/integrations", label: "Cursor и другие" },
      { href: "/docs", label: "API-документация" },
    ],
  },
  {
    title: "Компания",
    links: [
      { href: "/contacts", label: "Контакты" },
      { href: "/blog", label: "Блог" },
      { href: "/editorial", label: "Редакция" },
      { href: SITE.telegramChannel, label: "Telegram" },
      { href: "/status", label: "Статус сервиса" },
    ],
  },
  {
    title: "Документы",
    links: [
      { href: "/offer", label: "Пользовательское соглашение" },
      { href: "/privacy", label: "Политика конфиденциальности" },
      { href: "/refund", label: "Политика возврата" },
      { href: "/security", label: "Безопасность" },
    ],
  },
] as const;

export const TOOLS = [
  { name: "Codex CLI", slug: "codex" },
  { name: "Claude Code", slug: "claude" },
  { name: "VS Code", slug: "vscode" },
  { name: "Cursor", slug: "cursor" },
  { name: "Windsurf", slug: "windsurf" },
  { name: "Zed", slug: "zed" },
  { name: "JetBrains", slug: "jetbrains" },
  { name: "Continue", slug: "continue" },
] as const;
