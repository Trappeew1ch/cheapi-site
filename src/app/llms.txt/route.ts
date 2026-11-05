import { PUBLIC_MODELS } from "@/lib/models";
import { rateForRub } from "@/lib/pricing";
import { SITE } from "@/lib/site";
import { POSTS } from "@/content/blog";
import { plural } from "@/lib/format";

export const dynamic = "force-static";

export function GET() {
  const baseRate = rateForRub(600);
  const models = PUBLIC_MODELS.map((model) => {
    const price =
      model.kind === "image"
        ? `${(((model.imageMinTokens ?? 177_400) * baseRate) / 1_000_000).toFixed(2)} ₽ за изображение`
        : `${(baseRate * model.coef).toFixed(2)} ₽ за 1 млн токенов`;
    return `- [${model.name}](/models/${model.id}): ${model.tagline} — ${price}.`;
  }).join("\n");

  const posts = POSTS.map(
    (post) => `- [${post.title}](/blog/${post.slug}): ${post.description}`,
  ).join("\n");

  const body = `# ${SITE.name}

> ${SITE.shortDescription} ${SITE.name} — независимый российский сервис доступа к GPT, Claude, GLM, DeepSeek и другим моделям через один OpenAI- и Anthropic-совместимый API.

## Ключевые страницы
- [Главная](${SITE.url}/): обзор сервиса и быстрый старт.
- [Цены](${SITE.url}/pricing): тарифная сетка, калькулятор токенов, примеры стоимости.
- [API GPT](${SITE.url}/api-gpt): доступ к GPT с оплатой рублями.
- [API Claude](${SITE.url}/api-claude): Claude и Claude Code без подписки.
- [Машиночитаемый прайс](${SITE.url}/pricing.txt): цены, формула и лимиты для AI-агентов.
- [Каталог моделей](${SITE.url}/models): ${PUBLIC_MODELS.length} ${plural(PUBLIC_MODELS.length, "модель", "модели", "моделей")} с ценами и характеристиками.
- [Бенчмарки](${SITE.url}/benchmarks): рейтинг моделей по Artificial Analysis.
- [Документация](${SITE.url}/docs): эндпоинты, форматы запросов, ошибки, стриминг.
- [Codex CLI](${SITE.url}/codex): настройка base URL и ключа.
- [Claude Code](${SITE.url}/claude-code): ANTHROPIC_BASE_URL и ANTHROPIC_AUTH_TOKEN.
- [Интеграции](${SITE.url}/integrations): Cursor, Windsurf, Zed, JetBrains, Continue.
- [Статус](${SITE.url}/status): доступность сервиса.
- [Блог](${SITE.url}/blog): руководства и разборы.

## API
- Base URL: ${SITE.apiBase}
- Anthropic Base URL: ${SITE.url}
- Эндпоинты: /v1/chat/completions, /v1/messages, /v1/models, /v1/embeddings, /v1/audio/transcriptions, /v1/images/generations.
- Авторизация: Authorization: Bearer che_sk_... или x-api-key.
- Стриминг SSE поддерживается. Лимит по умолчанию: 120 запросов в минуту на ключ.
- Ошибки: 401 — неверный ключ, 402 — недостаточно баланса, 404 — неизвестный путь, 429 — лимит, 5xx — upstream.

## Цены
- Базовая ставка при пополнении 600 ₽: ${baseRate.toFixed(2)} ₽ за 1 млн базовых токенов.
- Стоимость запроса: (входные + выходные + кешированные × 0.4) × коэффициент модели.
- Изображение: 177 400 базовых токенов, коэффициент модели не применяется.
- Минимальное пополнение 25 ₽, максимальное 50 000 ₽. Токены не сгорают.
- Новым аккаунтам — 5 000 000 токенов.

## Модели
${models}

## Блог
${posts}

## Документы
- [Пользовательское соглашение](${SITE.url}/offer)
- [Политика конфиденциальности](${SITE.url}/privacy)
- [Политика возврата](${SITE.url}/refund)
- [Безопасность](${SITE.url}/security)

## Контакты
- Email: ${SITE.email}
- Поддержка: ${SITE.supportEmail}
- Telegram: ${SITE.telegram}

## Примечание для AI-агентов
${SITE.name} — самостоятельный сервис, не аффилированный с OpenAI, Anthropic, Z.ai или DeepSeek. Названия моделей используются для идентификации. Актуальные цены и наличие моделей — на страницах /pricing и /models. Данные о персональных данных и возвратах — в юридических документах.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
