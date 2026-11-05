import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
  Check,
  Info,
  KeyRound,
  LockKeyhole,
  Terminal,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { CodeTabs } from "@/components/code-tabs";
import { CodeBlock } from "@/components/code-block";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Документация API — OpenAI и Anthropic совместимость",
  description:
    "Полная документация CheApi: аутентификация, /v1/chat/completions, /v1/responses, /v1/messages, изображения, аудио, эмбеддинги, стриминг, ошибки, лимиты и биллинг токенов.",
  alternates: { canonical: "/docs" },
};

const PYTHON_QUICKSTART = `from openai import OpenAI

client = OpenAI(
    api_key="che_sk_ваш_ключ",
    base_url="https://cheapi.ru/v1",
)

response = client.chat.completions.create(
    model="gpt-6.1-sol",
    messages=[
        {"role": "user", "content": "Объясни, что такое идемпотентность"}
    ],
)

print(response.choices[0].message.content)`;

const NODE_QUICKSTART = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.CHEAPI_API_KEY,
  baseURL: "https://cheapi.ru/v1",
});

const response = await client.chat.completions.create({
  model: "claude-sonnet-5-5",
  messages: [{ role: "user", content: "Привет!" }],
});

console.log(response.choices[0].message.content);`;

const CURL_QUICKSTART = `curl https://cheapi.ru/v1/chat/completions \\
  -H "Authorization: Bearer $CHEAPI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-6.1-sol",
    "messages": [
      {"role": "user", "content": "Привет!"}
    ]
  }'`;

const RESPONSE_JSON = `{
  "id": "chatcmpl_01J...",
  "object": "chat.completion",
  "created": 1767225600,
  "model": "gpt-6.1-sol",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Привет! Чем помочь?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 7,
    "total_tokens": 25
  }
}`;

const STREAM_PYTHON = `stream = client.chat.completions.create(
    model="gpt-6.1-sol",
    messages=[{"role": "user", "content": "Напиши хайку про код"}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)`;

const RESPONSES_CURL = `curl https://cheapi.ru/v1/responses \\
  -H "Authorization: Bearer $CHEAPI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-6.1-sol",
    "input": "Суммаризируй этот текст: ...",
    "stream": false
  }'`;

const ANTHROPIC_PYTHON = `from anthropic import Anthropic

client = Anthropic(
    api_key="che_sk_ваш_ключ",
    base_url="https://cheapi.ru",
)

message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Привет!"}
    ],
)

print(message.content[0].text)`;

const ANTHROPIC_CURL = `curl https://cheapi.ru/v1/messages \\
  -H "x-api-key: $CHEAPI_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "claude-sonnet-5-5",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Привет!"}
    ]
  }'`;

const MODELS_JSON = `{
  "object": "list",
  "data": [
    {
      "id": "gpt-6.1-sol",
      "object": "model",
      "created": 1735689600,
      "owned_by": "openai"
    },
    {
      "id": "claude-sonnet-5-5",
      "object": "model",
      "created": 1735689600,
      "owned_by": "anthropic"
    }
  ]
}`;

const IMAGE_CURL = `curl https://cheapi.ru/v1/images/generations \\
  -H "Authorization: Bearer $CHEAPI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image-2.5-sunburst",
    "prompt": "минималистичный постер, зелёный градиент, без текста",
    "size": "1024x1024",
    "n": 1
  }'`;

const AUDIO_CURL = `curl https://cheapi.ru/v1/audio/transcriptions \\
  -H "Authorization: Bearer $CHEAPI_API_KEY" \\
  -F "model=gpt-4o-transcribe" \\
  -F "file=@meeting.mp3" \\
  -F "language=ru"`;

const EMBEDDINGS_CURL = `curl https://cheapi.ru/v1/embeddings \\
  -H "Authorization: Bearer $CHEAPI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "text-embedding-v4",
    "input": "CheApi — один ключ ко всем AI-моделям"
  }'`;

const TOC = [
  { id: "quickstart", label: "Быстрый старт" },
  { id: "auth", label: "Аутентификация" },
  { id: "base-url", label: "Базовый URL" },
  { id: "chat", label: "Chat Completions" },
  { id: "responses", label: "Responses API" },
  { id: "messages", label: "Anthropic Messages" },
  { id: "models", label: "Список моделей" },
  { id: "images", label: "Изображения" },
  { id: "audio", label: "Аудио" },
  { id: "embeddings", label: "Эмбеддинги" },
  { id: "streaming", label: "Стриминг" },
  { id: "errors", label: "Ошибки" },
  { id: "limits", label: "Лимиты" },
  { id: "billing", label: "Биллинг" },
  { id: "sdks", label: "SDK и библиотеки" },
  { id: "tools", label: "Инструменты" },
];

function Endpoint({
  method,
  path,
  description,
}: {
  method: "GET" | "POST";
  path: string;
  description?: string;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span
          className={`rounded-md px-2 py-1 font-mono text-[0.6875rem] font-bold ${
            method === "GET"
              ? "bg-[#e7f3fd] text-[#1d6ea8]"
              : "bg-green-soft text-green-deep"
          }`}
        >
          {method}
        </span>
        <code className="break-all font-mono text-[0.8125rem] font-medium text-ink">
          {path}
        </code>
      </div>
      {description && (
        <p className="border-t border-line bg-[#fbfaf6] px-4 py-2.5 text-[0.8125rem] text-muted">
          {description}
        </p>
      )}
    </div>
  );
}

function Note({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning" | "success";
  title: string;
  children: ReactNode;
}) {
  const styles = {
    info: "border-[#cfe6f6] bg-[#f2f9fe] text-[#1d6ea8]",
    warning: "border-[#f3e0b5] bg-[#fffaf0] text-[#9a6a12]",
    success: "border-[#c9eed9] bg-[#f2fcf7] text-green-deep",
  }[tone];

  const Icon = tone === "warning" ? AlertTriangle : tone === "success" ? Check : Info;

  return (
    <div className={`mt-4 rounded-xl border px-4 py-3.5 ${styles}`}>
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[0.8125rem] font-semibold">{title}</p>
          <div className="mt-1 text-[0.8125rem] leading-relaxed text-ink-soft/85">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "Документация CheApi",
          description:
            "Справочник по OpenAI- и Anthropic-совместимому API CheApi: эндпоинты, параметры, ошибки и биллинг.",
          author: { "@type": "Organization", name: SITE.name },
          publisher: { "@type": "Organization", name: SITE.name },
          inLanguage: "ru-RU",
        }}
      />

      <PageHero
        breadcrumbs={[{ label: "Главная", href: "/" }, { label: "Документация" }]}
        eyebrow="API Reference"
        size="compact"
        title="Документация"
        description="Один API в двух диалектах: OpenAI и Anthropic. Замените base_url и ключ — существующие SDK, агенты и редакторы продолжат работать."
        actions={
          <>
            <Link href="/register" className="btn btn-primary">
              Создать ключ
              <KeyRound className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/status" className="btn btn-ghost">
              Статус сервиса
            </Link>
          </>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted">
              Содержание
            </p>
            <nav className="hidden border-l border-line lg:block" aria-label="Содержание документации">
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[0.8125rem] text-muted transition-colors hover:border-green hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <details className="rounded-xl border border-line bg-white p-3 lg:hidden">
              <summary className="cursor-pointer text-[0.8125rem] font-semibold">
                Оглавление
              </summary>
              <div className="mt-2 grid gap-1">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="rounded-lg px-2 py-1.5 text-[0.8125rem] text-muted hover:bg-cream hover:text-ink"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </details>

            <div className="mt-5 hidden rounded-2xl border border-line bg-lime-soft/50 p-4 lg:block">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-ink/60">
                Нужна помощь?
              </p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
                Напишите в Telegram — поможем с интеграцией.
              </p>
              <a
                href={SITE.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-green-deep hover:underline"
              >
                {SITE.telegramHandle}
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </aside>

          <div className="min-w-0">
            <article className="prose-che max-w-none">
              <section id="quickstart" className="scroll-mt-28">
                <h2 className="!mt-0">Быстрый старт</h2>
                <p>
                  CheApi совместим с OpenAI и Anthropic API. Чтобы начать,
                  создайте ключ в кабинете, скопируйте его и подставьте{" "}
                  <code>https://cheapi.ru/v1</code> в качестве базового URL.
                  Ключ показывается один раз — сохраните его в менеджере
                  секретов.
                </p>
                <ol>
                  <li>
                    <Link href="/register">Зарегистрируйтесь</Link> и откройте
                    раздел «Ключи».
                  </li>
                  <li>Создайте ключ и скопируйте значение вида che_sk_…</li>
                  <li>
                    Отправьте первый запрос любым OpenAI-совместимым клиентом.
                  </li>
                </ol>
                <CodeTabs
                  className="mt-5"
                  tabs={[
                    { label: "Python", filename: "main.py", code: PYTHON_QUICKSTART },
                    { label: "Node.js", filename: "index.ts", code: NODE_QUICKSTART },
                    { label: "cURL", filename: "bash", code: CURL_QUICKSTART },
                  ]}
                />
                <p className="mt-3 text-[0.8125rem] text-muted">
                  Пример ответа:
                </p>
                <CodeBlock code={RESPONSE_JSON} filename="response.json" tone="light" />
              </section>

              <section id="auth" className="scroll-mt-28">
                <h2>Аутентификация</h2>
                <p>
                  Передавайте ключ в заголовке <code>Authorization</code> как
                  Bearer-токен. Для Anthropic-совместимых клиентов также
                  поддерживается <code>x-api-key</code>.
                </p>
                <CodeBlock
                  tone="light"
                  filename="HTTP"
                  code={`Authorization: Bearer che_sk_ваш_ключ
# или
x-api-key: che_sk_ваш_ключ`}
                />
                <Note tone="warning" title="Не публикуйте ключ">
                  Ключи хранятся в виде SHA-256-хеша и не могут быть восстановлены.
                  Если ключ попал в публичный репозиторий или чат — отзовите его
                  в кабинете и создайте новый. Все запросы по отозванному ключу
                  возвращают 401.
                </Note>
                <p className="mt-4">
                  Один аккаунт может иметь до 10 активных ключей. Отдельный ключ
                  удобно выдавать каждому сервису или окружению — так проще
                  отзывать доступ и читать историю расходов.
                </p>
              </section>

              <section id="base-url" className="scroll-mt-28">
                <h2>Базовый URL</h2>
                <p>
                  Все запросы отправляйте на <code>https://cheapi.ru</code>.
                  OpenAI-совместимые пути начинаются с <code>/v1</code>;
                  Anthropic-клиенты обычно добавляют <code>/v1/messages</code>{" "}
                  сами.
                </p>
                <div className="table-wrap mt-4">
                  <table className="data-table min-w-[580px]">
                    <thead>
                      <tr>
                        <th>Назначение</th>
                        <th>URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>OpenAI SDK base_url</td>
                        <td><code>https://cheapi.ru/v1</code></td>
                      </tr>
                      <tr>
                        <td>Anthropic SDK base_url</td>
                        <td><code>https://cheapi.ru</code></td>
                      </tr>
                      <tr>
                        <td>Codex CLI base_url</td>
                        <td><code>https://cheapi.ru/v1</code></td>
                      </tr>
                      <tr>
                        <td>Claude Code</td>
                        <td><code>ANTHROPIC_BASE_URL=https://cheapi.ru</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Note tone="success" title="Проверка подключения">
                  Самый простой тест — <code>GET /v1/models</code> с вашим
                  ключом. Если вернулся список моделей, DNS, TLS и
                  аутентификация настроены правильно.
                </Note>
              </section>

              <section id="chat" className="scroll-mt-28">
                <h2>Chat Completions</h2>
                <p>
                  Основной эндпоинт для текстовых моделей. Полностью совместим с
                  OpenAI Chat Completions: поддерживаются системные сообщения,
                  инструменты, JSON-режим и стриминг.
                </p>
                <Endpoint
                  method="POST"
                  path="/v1/chat/completions"
                  description="Создаёт ответ модели на последовательность сообщений."
                />
                <div className="table-wrap mt-4">
                  <table className="data-table min-w-[620px]">
                    <thead>
                      <tr>
                        <th>Параметр</th>
                        <th>Тип</th>
                        <th>Описание</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>model</code></td>
                        <td>string</td>
                        <td>
                          ID модели из <Link href="/models">каталога</Link>.
                          Обязательный.
                        </td>
                      </tr>
                      <tr>
                        <td><code>messages</code></td>
                        <td>array</td>
                        <td>
                          История сообщений с ролями system, user, assistant.
                          Обязательный.
                        </td>
                      </tr>
                      <tr>
                        <td><code>stream</code></td>
                        <td>boolean</td>
                        <td>Включает SSE-стриминг. По умолчанию false.</td>
                      </tr>
                      <tr>
                        <td><code>temperature</code></td>
                        <td>number</td>
                        <td>Вариативность ответа, обычно 0–2.</td>
                      </tr>
                      <tr>
                        <td><code>max_tokens</code></td>
                        <td>integer</td>
                        <td>Ограничение длины ответа в токенах.</td>
                      </tr>
                      <tr>
                        <td><code>tools</code></td>
                        <td>array</td>
                        <td>
                          Описание функций для tool calling. Формат — как в
                          OpenAI.
                        </td>
                      </tr>
                      <tr>
                        <td><code>response_format</code></td>
                        <td>object</td>
                        <td>
                          <code>{'{"type":"json_object"}'}</code> для
                          JSON-ответа, если модель поддерживает.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">
                  Ответ содержит <code>choices[0].message.content</code> и блок{" "}
                  <code>usage</code> с количеством токенов. Именно usage
                  используется для списания.
                </p>
              </section>

              <section id="responses" className="scroll-mt-28">
                <h2>Responses API</h2>
                <p>
                  Эндпоинт <code>/v1/responses</code> поддерживается для
                  инструментов, которые используют новый OpenAI Responses API, в
                  том числе Codex CLI. Формат запроса и ответа — как у OpenAI.
                </p>
                <Endpoint method="POST" path="/v1/responses" />
                <CodeBlock code={RESPONSES_CURL} filename="bash" className="mt-4" />
                <p className="mt-3 text-[0.8125rem] text-muted">
                  Если ваш клиент ожидает поле <code>output_text</code>, оно
                  возвращается upstream-провайдером без изменений. Мы не
                  переписываем ответы.
                </p>
              </section>

              <section id="messages" className="scroll-mt-28">
                <h2>Anthropic Messages</h2>
                <p>
                  Для Claude Code и Anthropic SDK используйте{" "}
                  <code>/v1/messages</code>. Поддерживаются системный промпт,
                  tool use, изображения в контенте и стриминг.
                </p>
                <Endpoint
                  method="POST"
                  path="/v1/messages"
                  description="Anthropic-совместимый эндпоинт. Требует заголовок anthropic-version."
                />
                <CodeTabs
                  className="mt-4"
                  tabs={[
                    { label: "Python", filename: "main.py", code: ANTHROPIC_PYTHON },
                    { label: "cURL", filename: "bash", code: ANTHROPIC_CURL },
                  ]}
                />
                <h3>Подсчёт токенов</h3>
                <p>
                  <code>POST /v1/messages/count_tokens</code> возвращает
                  оценку входных токенов до отправки запроса. Удобно для
                  контроля бюджета длинных документов.
                </p>
                <Note tone="info" title="Версия API">
                  Передавайте <code>anthropic-version: 2023-06-01</code>. Если
                  клиент не передаёт заголовок, upstream может выбрать версию по
                  умолчанию — лучше задать явно.
                </Note>
              </section>

              <section id="models" className="scroll-mt-28">
                <h2>Список моделей</h2>
                <p>
                  <code>GET /v1/models</code> возвращает все доступные модели в
                  формате OpenAI. Отдельная модель —{" "}
                  <code>GET /v1/models/{"{id}"}</code>. Каталог с ценами и
                  описаниями есть на <Link href="/models">отдельной странице</Link>.
                </p>
                <Endpoint method="GET" path="/v1/models" />
                <Endpoint method="GET" path="/v1/models/{id}" />
                <CodeBlock code={MODELS_JSON} filename="models.json" tone="light" className="mt-4" />
              </section>

              <section id="images" className="scroll-mt-28">
                <h2>Изображения</h2>
                <p>
                  Генерация изображений работает через OpenAI-совместимый
                  эндпоинт. Модели изображений имеют высокий коэффициент, но
                  списание ограничено минимальным числом токенов за картинку —
                  оно указано в{" "}
                  <Link href="/models?family=gpt">каталоге</Link>.
                </p>
                <Endpoint method="POST" path="/v1/images/generations" />
                <CodeBlock code={IMAGE_CURL} filename="bash" className="mt-4" />
                <Note tone="info" title="Стоимость изображения">
                  Минимум — 177 400 расчётных токенов за изображение (примерно
                  2,03 ₽ при пополнении на 600 ₽). Точная стоимость видна в
                  истории кабинета после генерации.
                </Note>
              </section>

              <section id="audio" className="scroll-mt-28">
                <h2>Аудио и транскрибация</h2>
                <p>
                  Отправьте аудиофайл через multipart/form-data. Поддерживаются
                  mp3, mp4, mpeg, mpga, m4a, wav и webm. Язык можно указать
                  явно — для русского это <code>ru</code>.
                </p>
                <Endpoint method="POST" path="/v1/audio/transcriptions" />
                <CodeBlock code={AUDIO_CURL} filename="bash" className="mt-4" />
                <p className="mt-3">
                  Стоимость зависит от длительности и модели. В ответе приходит
                  текст расшифровки; в историю записывается модель, длительность
                  и списанные токены.
                </p>
              </section>

              <section id="embeddings" className="scroll-mt-28">
                <h2>Эмбеддинги</h2>
                <p>
                  Векторные представления для RAG, семантического поиска и
                  кластеризации. Формат — стандартный OpenAI Embeddings API.
                </p>
                <Endpoint method="POST" path="/v1/embeddings" />
                <CodeBlock code={EMBEDDINGS_CURL} filename="bash" className="mt-4" />
                <p className="mt-3 text-[0.8125rem] text-muted">
                  Размерность и формат вектора зависят от модели. Сохраняйте
                  эмбеддинги вместе с ID модели — при смене модели векторное
                  пространство меняется.
                </p>
              </section>

              <section id="streaming" className="scroll-mt-28">
                <h2>Стриминг</h2>
                <p>
                  Передайте <code>&quot;stream&quot;: true</code>, чтобы получать ответ
                  частями через Server-Sent Events. Формат совместим с OpenAI:
                  строки <code>data: {"{...}"}</code> и терминальное{" "}
                  <code>data: [DONE]</code>.
                </p>
                <CodeBlock code={STREAM_PYTHON} filename="stream.py" className="mt-4" />
                <p className="mt-3">
                  Мы читаем стрим параллельно с клиентом, чтобы посчитать
                  использование токенов после завершения. Если провайдер не
                  вернул usage, оценка делается по длине текста — баланс всё
                  равно списывается.
                </p>
                <Note tone="warning" title="Таймауты">
                  Upstream-запрос ограничен 180 секундами. Для очень длинных
                  генераций уменьшите <code>max_tokens</code> или используйте
                  стриминг — он не обрывается по тому же таймауту на клиенте.
                </Note>
              </section>

              <section id="errors" className="scroll-mt-28">
                <h2>Ошибки</h2>
                <p>
                  Ошибки OpenAI-путей возвращаются в формате{" "}
                  <code>{'{"error":{"message","type","code"}}'}</code>, ошибки
                  Anthropic-путей — в формате{" "}
                  <code>{'{"type":"error","error":{...}}'}</code>. HTTP-статус
                  соответствует причине.
                </p>
                <div className="table-wrap mt-4">
                  <table className="data-table min-w-[620px]">
                    <thead>
                      <tr>
                        <th>Код</th>
                        <th>Значение</th>
                        <th>Что делать</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["400", "Неверный запрос", "Проверьте JSON, model и обязательные поля."],
                        ["401", "Неверный ключ", "Скопируйте ключ заново или создайте новый."],
                        ["402", "Недостаточно средств", "Пополните баланс в кабинете."],
                        ["403", "Доступ запрещён", "Проверьте права ключа и Origin для браузерных запросов."],
                        ["404", "Модель или путь не найден", "Сверьтесь с GET /v1/models и документацией."],
                        ["429", "Лимит запросов", "Снизьте частоту или напишите в поддержку."],
                        ["500", "Ошибка сервиса", "Повторите запрос с экспоненциальной задержкой."],
                        ["502", "Ошибка upstream", "Повторите позже; статус — на /status."],
                        ["503", "Провайдер недоступен", "Проверьте статус или напишите в Telegram."],
                      ].map(([code, title, action]) => (
                        <tr key={code}>
                          <td><code>{code}</code></td>
                          <td className="font-medium">{title}</td>
                          <td className="text-[0.8125rem] text-muted">{action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <CodeBlock
                  tone="light"
                  filename="error.json"
                  className="mt-4"
                  code={`{
  "error": {
    "message": "Недостаточно средств на балансе. Пополните баланс в кабинете CheApi.",
    "type": "insufficient_balance",
    "code": "insufficient_balance"
  }
}`}
                />
              </section>

              <section id="limits" className="scroll-mt-28">
                <h2>Лимиты</h2>
                <div className="table-wrap mt-4">
                  <table className="data-table min-w-[540px]">
                    <thead>
                      <tr>
                        <th>Лимит</th>
                        <th>Значение</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>Запросы к API</td><td>120 в минуту на ключ</td></tr>
                      <tr><td>Активные ключи</td><td>10 на аккаунт</td></tr>
                      <tr><td>Песочница в кабинете</td><td>20 запросов в минуту</td></tr>
                      <tr><td>Максимальная длина запроса</td><td>Зависит от модели и upstream</td></tr>
                      <tr><td>Таймаут upstream</td><td>180 секунд</td></tr>
                      <tr><td>История запросов</td><td>90 дней</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3">
                  Лимит считается по каждому ключу отдельно. Если вашему
                  проекту нужно больше 120 запросов в минуту, напишите на{" "}
                  <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>{" "}
                  — обсудим индивидуальный лимит.
                </p>
              </section>

              <section id="billing" className="scroll-mt-28">
                <h2>Биллинг и токены</h2>
                <p>
                  Баланс хранится в базовых токенах. Для каждого запроса
                  считаются расчётные токены:
                </p>
                <CodeBlock
                  tone="light"
                  filename="formula"
                  code={`charged = ceil((input + output + cached × 0.4) × coefficient)
cost_rub = charged × rate_rub_per_million / 1 000 000`}
                />
                <ul>
                  <li>
                    <strong>input</strong> — входные токены (промпт, системные
                    инструкции, история).
                  </li>
                  <li>
                    <strong>output</strong> — токены ответа модели.
                  </li>
                  <li>
                    <strong>cached</strong> — кешированный вход, считается по
                    коэффициенту 0,4.
                  </li>
                  <li>
                    <strong>coefficient</strong> — множитель модели из каталога
                    (от ×0,2 до ×20).
                  </li>
                </ul>
                <p>
                  Ставка <code>rate_rub_per_million</code> фиксируется при
                  пополнении и зависит от суммы: при 600 ₽ это около 11,42 ₽ за
                  1 млн базовых токенов. Чем больше пополнение — тем ниже ставка.
                  Подробная сетка — на <Link href="/pricing">странице цен</Link>.
                </p>
                <Note tone="info" title="Что видно в истории">
                  Для каждого запроса сохраняются модель, эндпоинт, входные и
                  выходные токены, кеш, коэффициент, списанные токены, стоимость,
                  статус и задержка. Тексты промптов и ответов не сохраняются.
                </Note>
                <p className="mt-4">
                  Если upstream не вернул usage (например, при стриминге без
                  финального чанка), мы оцениваем токены по длине текста. Это
                  приблизительная оценка, но она не позволяет запросам быть
                  бесплатными.
                </p>
              </section>

              <section id="sdks" className="scroll-mt-28">
                <h2>SDK и библиотеки</h2>
                <p>
                  Подойдёт любой клиент, который умеет менять base URL. Ниже —
                  минимальные конфигурации для популярных SDK.
                </p>
                <div className="table-wrap mt-4">
                  <table className="data-table min-w-[640px]">
                    <thead>
                      <tr>
                        <th>Инструмент</th>
                        <th>Настройка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["OpenAI Python / Node", "base_url = https://cheapi.ru/v1"],
                        ["Anthropic Python / TS", "base_url = https://cheapi.ru"],
                        ["LangChain", "baseURL в ChatOpenAI / ChatAnthropic"],
                        ["LlamaIndex", "api_base = https://cheapi.ru/v1"],
                        ["Vercel AI SDK", "baseURL: https://cheapi.ru/v1"],
                        ["Continue / Cline", "OpenAI-compatible provider + base URL"],
                      ].map(([tool, config]) => (
                        <tr key={tool}>
                          <td className="font-medium">{tool}</td>
                          <td><code>{config}</code></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">
                  Если библиотека проверяет домен или версию API, отключите
                  строгую проверку — CheApi отвечает теми же схемами, но не
                  является api.openai.com.
                </p>
              </section>

              <section id="tools" className="scroll-mt-28">
                <h2>Инструменты</h2>
                <p>
                  Готовые инструкции для CLI и редакторов: Codex CLI, Claude
                  Code, Cursor, Windsurf, Zed, Continue, VS Code и JetBrains.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Codex CLI",
                      text: "config.toml, провайдер cheapi и wire_api = responses.",
                      href: "/codex",
                      icon: Terminal,
                    },
                    {
                      title: "Claude Code",
                      text: "ANTHROPIC_BASE_URL и ANTHROPIC_AUTH_TOKEN за две минуты.",
                      href: "/claude-code",
                      icon: Zap,
                    },
                    {
                      title: "Все интеграции",
                      text: "Cursor, Windsurf, Zed, Continue, LangChain и другие.",
                      href: "/integrations",
                      icon: LockKeyhole,
                    },
                    {
                      title: "Песочница",
                      text: "Проверьте модель в браузере без установки SDK.",
                      href: "/dashboard/playground",
                      icon: ArrowRight,
                    },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group rounded-2xl border border-line bg-white p-5 transition-colors hover:border-line-strong"
                    >
                      <item.icon className="size-4 text-green-deep" aria-hidden="true" />
                      <h3 className="!mt-3 !mb-1 text-[1rem]">{item.title}</h3>
                      <p className="!mb-0 text-[0.8125rem] text-muted">{item.text}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-green-deep">
                        Открыть
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <div className="mt-12 rounded-2xl border border-line bg-white p-6">
                <h3 className="!mt-0">Остались вопросы?</h3>
                <p className="!mb-4">
                  Напишите в Telegram {SITE.telegramHandle} или на{" "}
                  <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
                  Приложите ID запроса из заголовка ответа — так мы быстрее
                  найдём лог.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/register" className="btn btn-primary btn-sm">
                    Создать ключ
                  </Link>
                  <a
                    href={SITE.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm"
                  >
                    Поддержка
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
