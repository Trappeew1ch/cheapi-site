# CheApi

Российский сервис доступа к AI-моделям через один OpenAI- и Anthropic-совместимый API. GPT, Claude, GLM, DeepSeek, изображения, транскрибация и эмбеддинги — с оплатой в рублях, без подписки.

Сайт: `https://cheapi.ru` (задаётся через `NEXT_PUBLIC_SITE_URL`).

## Стек

- Next.js 16.4 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4, `lucide-react`, шрифты Onest + JetBrains Mono
- SQLite через встроенный `node:sqlite` (без ORM и внешней БД)
- ЮKassa для платежей, upstream-провайдер codex.sale

## Быстрый старт

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте `http://localhost:3000`. База создаётся автоматически в `data/cheapi.db` и заполняется демо-данными.

### macOS: запуск двойным кликом

В корне проекта есть `Запустить CheApi.command`. Двойной клик в Finder:

- проверит Node.js 22+;
- создаст `.env.local` с `http://localhost:3000`, если файла ещё нет;
- установит зависимости при первом запуске;
- поднимет dev-сервер и откроет браузер.

Остановка — `Ctrl+C` в открывшемся окне Terminal. Если macOS ругается на неизвестный файл, первый раз откройте его через контекстное меню → «Открыть».

### Демо-аккаунты

| Email | Пароль | Роль | Баланс |
| --- | --- | --- | --- |
| `demo@cheapi.ru` | `demo1234` | user | 25 млн токенов, история запросов |
| `admin@cheapi.ru` | `admin1234` | admin | 50 млн токенов |

На странице входа есть кнопка «Демо-аккаунт», которая входит под demo.

## Переменные окружения

| Переменная | Обязательно | Описание |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | да | Публичный URL сайта для canonical, sitemap и возврата с ЮKassa |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | нет | Код подтверждения Google Search Console |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | нет | Код подтверждения Яндекс.Вебмастера |
| `CODEX_SALE_API_KEY` | да (prod) | Ключ upstream-провайдера. Без него dev отвечает моком на chat completions |
| `CODEX_SALE_BASE` | нет | Базовый URL upstream, по умолчанию `https://codex.sale` |
| `UPSTREAM_TIMEOUT_MS` | нет | Таймаут запроса к upstream, по умолчанию 180000 |
| `DATABASE_PATH` | нет | Путь к SQLite, по умолчанию `data/cheapi.db` |
| `WELCOME_TOKENS` | нет | Приветственные токены, по умолчанию 5 000 000 |
| `YOOKASSA_SHOP_ID` | для оплаты | ID магазина ЮKassa |
| `YOOKASSA_SECRET_KEY` | для оплаты | Секретный ключ ЮKassa |

Пока ЮKassa не настроена, создание платежа возвращает 503 с понятным сообщением, а промокоды и ручные начисления работают.

## Скрипты

```bash
npm run dev      # разработка
npm run build    # production-сборка
npm run start    # запуск собранного приложения
npx tsc --noEmit # проверка типов
npm run lint     # ESLint
npm run seo:audit # проверка sitemap, canonical, H1, title и schema на запущенном сайте
```

SEO-аудит запускается против `BASE_URL`:

```bash
BASE_URL=https://cheapi.ru npm run seo:audit
```

План, карта запросов и календарь: `docs/seo-strategy.md`, `docs/content-calendar.md`.

## Архитектура

```
src/
  app/
    (site)/          публичные страницы: лендинг, цены, модели, docs, блог, legal
    (auth)/          вход и регистрация
    dashboard/       кабинет: обзор, ключи, оплата, usage, песочница, настройки, админ
    api/             auth, keys, profile, password, promo, payments, playground, admin
    v1/[...path]/    публичный API-прокси
  components/        UI-компоненты и клиентские формы
  content/blog.ts    типизированный контент блога
  lib/
    db.ts            схема SQLite, миграции, сиды, хеширование
    auth.ts          сессии, пользователи, API-ключи, лимиты
    upstream.ts      прокси, стриминг, биллинг, разбор usage
    pricing.ts       тарифная сетка, коэффициенты, списание
    yookassa.ts      создание платежей и проверка webhook
    topups.ts        идемпотентное зачисление
    models.ts        каталог моделей
```

### Биллинг

- Баланс хранится в «базовых токенах».
- Списание: `ceil((input + output + cached × 0.4) × coefficient)`.
- Базовая ставка при пополнении 600 ₽ — 11.42 ₽ за 1 млн базовых токенов; сетка повторяет кривую upstream с наценкой ×2.
- Изображения тарифицируются как 177 400 базовых токенов за изображение, без коэффициента модели.
- Кешированные токены — ×0.4, приоритетные запросы GPT — ×2.
- Недостаток баланса — HTTP 402 без списания.
- Списание и запись usage происходят в одной транзакции.

### API

- `POST /v1/chat/completions`, `POST /v1/messages` — чат и стриминг.
- `GET /v1/models` — список моделей.
- Эмбеддинги, изображения и транскрибация — по совместимым путям.
- Авторизация: `Authorization: Bearer che_sk_...` или `x-api-key`.
- Лимит: 120 запросов в минуту на ключ; для песочницы — 20 в минуту на пользователя.

### Безопасность

- Пароли — scrypt с индивидуальной солью; API-ключи — SHA-256, полный ключ показывается один раз.
- Сессия — HttpOnly cookie `che_session`, SameSite=Lax, Secure в production.
- Проверка Origin для браузерных мутаций, защитные HTTP-заголовки в `next.config.ts`.
- Тексты промптов и ответов не сохраняются — только метаданные запроса.
- Webhook ЮKassa проверяется повторным запросом статуса платежа и сверкой суммы/валюты/metadata.

## Перед запуском

1. Замените юридические реквизиты-заглушки в `src/lib/site.ts` (ООО «ЧЕАПИ», ИНН, ОГРН, адрес, директор, банк).
2. Укажите реальный `NEXT_PUBLIC_SITE_URL` и настройте HTTPS.
3. Добавьте `CODEX_SALE_API_KEY` и проверьте тарифы upstream.
4. Подключите ЮKassa: `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, URL webhook `https://<домен>/api/payments/yookassa/webhook`.
5. Смените или удалите демо-аккаунты и промокод `CHE5M`.
6. Настройте резервное копирование `data/cheapi.db` (SQLite WAL) и внешний мониторинг `/api/status`.
7. Проверьте тексты оферты, политики конфиденциальности и возврата с юристом.

## Деплой

Приложение рассчитано на Node.js-хостинг с постоянным диском (VPS, Docker, Selectel, Timeweb и т.п.). SQLite не подходит для serverless с эфемерной файловой системой — для Vercel потребуется заменить слой БД.

```bash
npm ci
npm run build
npm run start
```

### Docker

```bash
cp .env.example .env.production
# заполните NEXT_PUBLIC_SITE_URL, CODEX_SALE_API_KEY, YOOKASSA_*
docker compose up -d --build
```

База лежит в volume `cheapi-data`, переживает перезапуск контейнера. Для HTTPS поставьте перед контейнером Caddy, nginx или Traefik. Каталог `data/` исключён из git; локально база создаётся при первом запросе.

## Credits

Иконки моделей и провайдеров — [LobeHub Icons](https://github.com/lobehub/lobe-icons), лицензия MIT. SVG лежат локально в `public/icons/models`, external-запросов на CDN нет. Названия и логотипы принадлежат их правообладателям и используются только для идентификации моделей.

