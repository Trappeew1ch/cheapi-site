import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Cpu,
  Layers,
  Monitor,
  Terminal,
  Workflow,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { CodeBlock } from "@/components/code-block";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Интеграции — Cursor, Windsurf, Zed, Continue и другие",
  description:
    "Подключите CheApi к Cursor, Windsurf, Zed, Continue, Cline, VS Code, JetBrains, LangChain и LlamaIndex. Один base_url и ключ для всех OpenAI-совместимых инструментов.",
  alternates: { canonical: "/integrations" },
};

const UNIVERSAL = `# Любой OpenAI-совместимый клиент
Base URL:  https://cheapi.ru/v1
API Key:   che_sk_ваш_ключ
Model:     gpt-6.1-sol   # или любая из каталога

# Anthropic-совместимый клиент
Base URL:  https://cheapi.ru
API Key:   che_sk_ваш_ключ
Model:     claude-sonnet-5-5`;

const ZED_SETTINGS = `{
  "language_models": {
    "openai": {
      "api_url": "https://cheapi.ru/v1",
      "api_key": "che_sk_ваш_ключ",
      "available_models": [
        { "name": "gpt-6.1-sol", "max_tokens": 128000 },
        { "name": "claude-sonnet-5-5", "max_tokens": 200000 }
      ]
    }
  }
}`;

const CONTINUE_CONFIG = `{
  "models": [
    {
      "title": "GPT 6.1 Sol",
      "provider": "openai",
      "model": "gpt-6.1-sol",
      "apiBase": "https://cheapi.ru/v1",
      "apiKey": "che_sk_ваш_ключ"
    },
    {
      "title": "Claude Sonnet 5.5",
      "provider": "openai",
      "model": "claude-sonnet-5-5",
      "apiBase": "https://cheapi.ru/v1",
      "apiKey": "che_sk_ваш_ключ"
    }
  ]
}`;

const LANGCHAIN = `from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-6.1-sol",
    api_key="che_sk_ваш_ключ",
    base_url="https://cheapi.ru/v1",
    temperature=0.2,
)

print(llm.invoke("Привет!").content)`;

const LLAMAINDEX = `from llama_index.llms.openai_like import OpenAILike

llm = OpenAILike(
    model="claude-sonnet-5-5",
    api_base="https://cheapi.ru/v1",
    api_key="che_sk_ваш_ключ",
    is_chat_model=True,
)`;

const TOOLS = [
  {
    name: "Cursor",
    tag: "IDE",
    icon: Monitor,
    href: "/blog/cursor-cheapi",
    text: "Настройки → Models → OpenAI API. Включите Override Base URL и вставьте адрес CheApi. Добавьте ID моделей вручную.",
    steps: [
      "Settings → Models → OpenAI API Key",
      "Override Base URL: https://cheapi.ru/v1",
      "Добавьте модель, например gpt-6.1-sol",
      "Отключите встроенные модели OpenAI, если они не нужны",
    ],
  },
  {
    name: "n8n",
    tag: "Автоматизация",
    icon: Workflow,
    href: "/blog/n8n-openai-api",
    text: "OpenAI-нода работает с CheApi через Base URL в credential. Подходит для заявок, описаний товаров и саммари писем.",
    steps: [
      "Credentials → OpenAI → API Key",
      "Base URL: https://cheapi.ru/v1",
      "Выберите модель GPT или DeepSeek",
      "Ограничьте max_tokens в каждой ноде",
    ],
  },
  {
    name: "Windsurf",
    tag: "IDE",
    icon: Workflow,
    text: "В настройках Cascade выберите custom OpenAI-compatible provider и укажите base URL. Ключ — CheApi.",
    steps: [
      "Windsurf Settings → Cascade → Models",
      "OpenAI Compatible → Base URL: https://cheapi.ru/v1",
      "Вставьте ключ che_sk_…",
      "Выберите модель из списка или добавьте вручную",
    ],
  },
  {
    name: "Zed",
    tag: "Редактор",
    icon: Cpu,
    text: "Zed поддерживает OpenAI-совместимые провайдеры через settings.json. Добавьте api_url и список моделей.",
    steps: [
      "Откройте настройки: cmd-, → Open Settings",
      "Вставьте блок language_models.openai",
      "Укажите api_url https://cheapi.ru/v1",
      "Перезапустите Zed",
    ],
    code: ZED_SETTINGS,
    filename: "settings.json",
  },
  {
    name: "Continue",
    tag: "VS Code / JetBrains",
    icon: Code2,
    text: "Continue настраивается через config.json. Можно добавить несколько моделей и переключаться между ними.",
    steps: [
      "Откройте ~/.continue/config.json",
      "Добавьте модели с provider openai",
      "apiBase: https://cheapi.ru/v1",
      "Сохраните и перезагрузите окно",
    ],
    code: CONTINUE_CONFIG,
    filename: "config.json",
  },
  {
    name: "Cline",
    tag: "VS Code",
    icon: Terminal,
    text: "В настройках Cline выберите API Provider «OpenAI Compatible», вставьте base URL и ключ.",
    steps: [
      "Cline → Settings → API Configuration",
      "Provider: OpenAI Compatible",
      "Base URL: https://cheapi.ru/v1",
      "Model ID: gpt-6.1-sol или другая",
    ],
  },
  {
    name: "Codex CLI",
    tag: "CLI",
    icon: Terminal,
    text: "Официальный CLI OpenAI с поддержкой кастомного провайдера. Настройка через config.toml.",
    steps: [
      "config.toml → model_provider = cheapi",
      "base_url: https://cheapi.ru/v1",
      "wire_api = responses",
      "env_key = CHEAPI_API_KEY",
    ],
    href: "/codex",
  },
  {
    name: "Claude Code",
    tag: "CLI",
    icon: Terminal,
    text: "Anthropic-совместимый агент. Достаточно двух переменных окружения — без подписки и VPN.",
    steps: [
      "ANTHROPIC_BASE_URL=https://cheapi.ru",
      "ANTHROPIC_AUTH_TOKEN=che_sk_…",
      "ANTHROPIC_MODEL=claude-sonnet-5-5",
      "Запустите claude",
    ],
    href: "/claude-code",
  },
  {
    name: "LangChain",
    tag: "SDK",
    icon: Layers,
    text: "ChatOpenAI и ChatAnthropic принимают base_url. Работают цепочки, агенты, инструменты и RAG.",
    steps: [
      "pip install langchain-openai",
      "base_url=https://cheapi.ru/v1",
      "model=gpt-6.1-sol",
      "api_key=che_sk_…",
    ],
    code: LANGCHAIN,
    filename: "agent.py",
  },
  {
    name: "LlamaIndex",
    tag: "SDK",
    icon: BookOpen,
    text: "OpenAILike подключается к любому совместимому endpoint. Подходит для RAG и индексов.",
    steps: [
      "pip install llama-index-llms-openai-like",
      "api_base=https://cheapi.ru/v1",
      "model=claude-sonnet-5-5",
      "api_key=che_sk_…",
    ],
    code: LLAMAINDEX,
    filename: "rag.py",
  },
];

export default function IntegrationsPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Интеграции CheApi",
          description:
            "Настройка Cursor, Windsurf, Zed, Continue, Cline, Codex, Claude Code, LangChain и LlamaIndex с API CheApi.",
          url: `${SITE.url}/integrations`,
        }}
      />

      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Инструменты", href: "/integrations" },
          { label: "Интеграции" },
        ]}
        eyebrow="Интеграции"
        title={
          <>
            Ваш инструмент.
            <br />
            <span className="text-gradient">Наш ключ.</span>
          </>
        }
        description="CheApi говорит на диалектах OpenAI и Anthropic, поэтому подключается к десяткам редакторов, CLI и фреймворков без плагинов и патчей."
        actions={
          <>
            <Link href="/register" className="btn btn-primary btn-lg">
              Получить ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/docs" className="btn btn-ghost btn-lg">
              Документация API
            </Link>
          </>
        }
        aside={
          <div className="rounded-[24px] border border-line bg-white p-6 shadow-soft">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-green-deep">
              Универсальная настройка
            </p>
            <div className="mt-4 space-y-3 text-[0.8125rem]">
              {[
                ["Base URL (OpenAI)", "https://cheapi.ru/v1"],
                ["Base URL (Anthropic)", "https://cheapi.ru"],
                ["API Key", "che_sk_••••••••"],
                ["Model", "gpt-6.1-sol"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[0.6875rem] text-muted">{label}</div>
                  <code className="mt-0.5 block break-all rounded-md bg-cream px-2 py-1.5 font-mono text-[0.75rem] text-ink-soft">
                    {value}
                  </code>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[0.75rem] leading-relaxed text-muted">
              Если инструмент просит «OpenAI API key», подойдёт ключ CheApi.
              Отдельная регистрация в OpenAI не нужна.
            </p>
          </div>
        }
      />

      <section className="container-page py-12 lg:py-16">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              step: "01",
              title: "Один ключ",
              text: "Создайте ключ в кабинете. Он работает со всеми инструментами и моделями.",
            },
            {
              step: "02",
              title: "Замените base URL",
              text: "В настройках инструмента укажите https://cheapi.ru/v1. Ключ — в поле API key.",
            },
            {
              step: "03",
              title: "Выберите модель",
              text: "Впишите ID из каталога или выберите модель в списке инструмента.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-line bg-white p-6">
              <span className="font-mono text-[0.6875rem] font-bold text-green-deep">
                {item.step}
              </span>
              <h2 className="mt-2 text-[1.0625rem] font-semibold tracking-[-0.02em]">
                {item.title}
              </h2>
              <p className="mt-1.5 text-[0.875rem] leading-relaxed text-muted">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <CodeBlock code={UNIVERSAL} filename="настройки" tone="light" />
        </div>

        <div className="mt-12 grid gap-3 lg:grid-cols-2">
          {TOOLS.map((tool) => (
            <article
              key={tool.name}
              id={tool.name.toLowerCase().replace(/\s+/g, "-")}
              className="scroll-mt-28 rounded-2xl border border-line bg-white p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-cream text-ink">
                    <tool.icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
                      {tool.name}
                    </h2>
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted">
                      {tool.tag}
                    </p>
                  </div>
                </div>
                {tool.href && (
                  <Link
                    href={tool.href}
                    className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-green-deep hover:underline"
                  >
                    Гайд
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>

              <p className="mt-4 text-[0.875rem] leading-relaxed text-muted">{tool.text}</p>

              <ul className="mt-4 grid gap-1.5">
                {tool.steps.map((step) => (
                  <li key={step} className="flex items-start gap-2 text-[0.8125rem] text-ink-soft">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-green" aria-hidden="true" />
                    {step}
                  </li>
                ))}
              </ul>

              {"code" in tool && tool.code && (
                <details className="group mt-4">
                  <summary className="cursor-pointer text-[0.8125rem] font-semibold text-green-deep">
                    Показать конфигурацию
                  </summary>
                  <CodeBlock
                    code={tool.code}
                    filename={tool.filename}
                    tone="light"
                    className="mt-3"
                  />
                </details>
              )}
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[28px] bg-ink p-6 text-white sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-lime">
                Нет вашего инструмента?
              </p>
              <h2 className="h2 mt-3 text-balance !text-white">
                Если он умеет OpenAI — он умеет CheApi
              </h2>
              <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-white/55">
                Любой клиент с настройкой base URL и API key подключится за
                минуту. А если инструмент требует что-то специфическое —
                напишите, поможем разобраться.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
              <Link href="/register" className="btn btn-lime">
                Создать ключ
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href={SITE.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Спросить в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
