import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  KeyRound,
  Monitor,
  Terminal,
  Wrench,
  Zap,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { CodeBlock } from "@/components/code-block";
import { Faq, type FaqItem } from "@/components/faq";
import { ModelIcon } from "@/components/model-icon";
import { MODEL_MAP } from "@/lib/models";
import { DEFAULT_TOPUP_RUB, modelPricePerMillion } from "@/lib/pricing";
import { formatRub } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Codex CLI и VS Code — подключение к CheApi",
  description:
    "Пошаговая настройка Codex CLI и расширения VS Code с CheApi: config.toml, base_url, wire_api, ключ и выбор модели GPT-6.1. Решение типичных ошибок.",
  alternates: { canonical: "/codex" },
};

const CONFIG_TOML = `model = "gpt-6.1-sol"
model_provider = "cheapi"

[model_providers.cheapi]
name = "CheApi"
base_url = "https://cheapi.ru/v1"
wire_api = "responses"
env_key = "CHEAPI_API_KEY"`;

const INSTALL = `# macOS / Linux
npm install -g @openai/codex

# проверка установки
codex --version`;

const SHELL = `# добавьте в ~/.zshrc или ~/.bashrc
export CHEAPI_API_KEY="che_sk_ваш_ключ"

# примените изменения
source ~/.zshrc`;

const RUN = `cd ~/projects/my-app
codex

# или одной командой с задачей
codex "объясни структуру проекта и предложи план рефакторинга"`;

const VSCODE_SETTINGS = `{
  "codex.apiKey": "che_sk_ваш_ключ",
  "codex.baseUrl": "https://cheapi.ru/v1",
  "codex.model": "gpt-6.1-sol"
}`;

const FAQ: FaqItem[] = [
  {
    question: "Нужна ли подписка ChatGPT Plus или Codex?",
    answer:
      "Нет. Codex CLI работает с API-ключом, а не с подпиской. Вы платите только за токены, которые израсходовали. Новым аккаунтам CheApi начисляем 5 млн базовых токенов для тестов.",
  },
  {
    question: "Почему указан wire_api = responses, а не chat?",
    answer:
      "Современный Codex CLI использует Responses API. CheApi поддерживает его через /v1/responses и передаёт запросы upstream без изменения формата. Если ваш клиент умеет только chat, поставьте wire_api = chat и тот же base_url.",
  },
  {
    question: "Codex пишет 401 Unauthorized",
    answer:
      "Проверьте, что переменная CHEAPI_API_KEY экспортирована в том же терминале, где запускается codex, и что ключ начинается с che_sk_. Если ключ отозван в кабинете, создайте новый. Быстрая проверка: curl https://cheapi.ru/v1/models -H \"Authorization: Bearer $CHEAPI_API_KEY\".",
  },
  {
    question: "Можно ли использовать несколько моделей?",
    answer:
      "Да. Меняйте model в config.toml или передавайте --model при запуске. Для сложных задач берите gpt-6.1-sol или claude-opus-5-5, для рутины — gpt-6.1-terra, для больших объёмов — deepseek-flash.",
  },
  {
    question: "Где посмотреть расход токенов Codex?",
    answer:
      "В кабинете CheApi, раздел «История». Там видны модель, входные и выходные токены, кеш, стоимость и задержка каждого запроса. Фильтр по endpoint помогает отделить Codex от других интеграций.",
  },
];

export default function CodexPage() {
  const models = ["gpt-6.1-sol", "gpt-6.1-terra", "gpt-6-astra", "claude-sonnet-5-5"]
    .map((id) => MODEL_MAP.get(id))
    .filter((model): model is NonNullable<typeof model> => Boolean(model));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: String(item.answer) },
    })),
  };

  return (
    <main>
      <JsonLd data={faqJsonLd} />

      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Инструменты", href: "/integrations" },
          { label: "Codex" },
        ]}
        eyebrow="Инструменты · OpenAI Codex"
        title={
          <>
            Codex CLI
            <br />
            <span className="text-gradient">на моделях CheApi</span>
          </>
        }
        description="Настройте config.toml один раз — и Codex будет работать через CheApi с оплатой в рублях. Без подписки ChatGPT, VPN и зарубежных карт."
        actions={
          <>
            <Link href="/register" className="btn btn-primary btn-lg">
              Получить API-ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href="#config" className="btn btn-ghost btn-lg">
              К настройке
            </a>
          </>
        }
        aside={
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0a1712] shadow-lift">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-mono text-[0.6875rem] text-white/40">
                ~/.codex/config.toml
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/20 bg-lime/10 px-2 py-0.5 font-mono text-[0.6rem] text-lime">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-lime" />
                готово
              </span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[0.72rem] leading-[1.85] text-[#d7e5dc]">
              <code>{CONFIG_TOML}</code>
            </pre>
          </div>
        }
      />

      <section className="container-page py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div className="min-w-0">
            <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
              <p className="eyebrow">Шаг за шагом</p>
              <h2 className="h3 mt-3">Подключение за пять минут</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                Инструкция для свежей установки Codex CLI на macOS, Linux или
                Windows (WSL). Если Codex уже установлен, переходите к шагу 3.
              </p>

              <ol className="mt-8 grid gap-8">
                <li>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[0.6875rem] font-bold text-white">
                      01
                    </span>
                    <h3 className="!m-0 text-[1.0625rem] font-semibold">
                      Установите Codex CLI
                    </h3>
                  </div>
                  <div className="mt-3 pl-9">
                    <CodeBlock code={INSTALL} filename="bash" />
                    <p className="mt-2.5 text-[0.8125rem] text-muted">
                      Нужен Node.js 20+. Альтернативно можно установить через
                      Homebrew: <code>brew install codex</code>.
                    </p>
                  </div>
                </li>

                <li>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[0.6875rem] font-bold text-white">
                      02
                    </span>
                    <h3 className="!m-0 text-[1.0625rem] font-semibold">
                      Создайте API-ключ
                    </h3>
                  </div>
                  <div className="mt-3 pl-9">
                    <p className="text-[0.875rem] leading-relaxed text-muted">
                      В кабинете откройте «Ключи» → «Создать ключ». Скопируйте
                      значение целиком: после закрытия окна оно больше не
                      показывается. Ключ выглядит как{" "}
                      <code>che_sk_…</code>.
                    </p>
                    <Link href="/dashboard/keys" className="btn btn-ghost btn-sm mt-3">
                      <KeyRound className="size-3.5" aria-hidden="true" />
                      Открыть ключи
                    </Link>
                  </div>
                </li>

                <li id="config" className="scroll-mt-28">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[0.6875rem] font-bold text-white">
                      03
                    </span>
                    <h3 className="!m-0 text-[1.0625rem] font-semibold">
                      Отредактируйте config.toml
                    </h3>
                  </div>
                  <div className="mt-3 pl-9">
                    <p className="text-[0.875rem] leading-relaxed text-muted">
                      Создайте файл <code>~/.codex/config.toml</code> (или
                      добавьте секции в существующий). Важное отличие от
                      стандартной настройки — провайдер и{" "}
                      <code>base_url</code>.
                    </p>
                    <CodeBlock code={CONFIG_TOML} filename="~/.codex/config.toml" className="mt-3" />
                    <div className="mt-3 grid gap-2 text-[0.8125rem] text-muted">
                      <p>
                        <strong className="text-ink">model</strong> — любая
                        модель из каталога. Можно менять перед запуском.
                      </p>
                      <p>
                        <strong className="text-ink">wire_api</strong> —{" "}
                        <code>responses</code> для современного Codex. Если
                        клиент старый, используйте <code>chat</code>.
                      </p>
                      <p>
                        <strong className="text-ink">env_key</strong> — имя
                        переменной окружения с ключом, а не сам ключ. Так
                        секрет не попадает в файл.
                      </p>
                    </div>
                  </div>
                </li>

                <li>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[0.6875rem] font-bold text-white">
                      04
                    </span>
                    <h3 className="!m-0 text-[1.0625rem] font-semibold">
                      Экспортируйте ключ
                    </h3>
                  </div>
                  <div className="mt-3 pl-9">
                    <CodeBlock code={SHELL} filename="bash" />
                    <p className="mt-2.5 text-[0.8125rem] text-muted">
                      В Windows PowerShell:{" "}
                      <code>$env:CHEAPI_API_KEY=&quot;che_sk_…&quot;</code>.
                      Чтобы переменная сохранялась, добавьте её в профиль
                      PowerShell.
                    </p>
                  </div>
                </li>

                <li>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[0.6875rem] font-bold text-white">
                      05
                    </span>
                    <h3 className="!m-0 text-[1.0625rem] font-semibold">
                      Запустите Codex
                    </h3>
                  </div>
                  <div className="mt-3 pl-9">
                    <CodeBlock code={RUN} filename="bash" />
                    <p className="mt-2.5 text-[0.8125rem] text-muted">
                      При первом запуске Codex может предложить вход через
                      ChatGPT — выберите API-ключ или пропустите этот шаг. В
                      терминале должна появиться строка с моделью и балансом.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* VS Code */}
            <div id="vscode" className="mt-8 scroll-mt-28 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-[#e7f3fd] text-[#1d6ea8]">
                  <Monitor className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
                    Расширение Codex для VS Code
                  </h2>
                  <p className="text-[0.75rem] text-muted">
                    Тот же ключ, тот же каталог моделей
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[0.875rem] leading-relaxed text-muted">
                Установите расширение Codex из маркетплейса. Оно читает{" "}
                <code>~/.codex/config.toml</code>, поэтому достаточно выполнить
                шаги выше. Если хочется задать настройки в самом VS Code,
                добавьте их в <code>settings.json</code>:
              </p>
              <CodeBlock code={VSCODE_SETTINGS} filename=".vscode/settings.json" tone="light" className="mt-3" />
              <p className="mt-2.5 text-[0.75rem] text-muted">
                Ключи в settings.json хранятся в открытом виде. На общих машинах
                лучше использовать переменную окружения.
              </p>
            </div>

            {/* Models */}
            <div id="models" className="mt-8 scroll-mt-28 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-green-soft text-green-deep">
                  <Zap className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
                  Какую модель выбрать для Codex
                </h2>
              </div>
              <div className="table-wrap mt-4">
                <table className="data-table min-w-[540px]">
                  <thead>
                    <tr>
                      <th>Модель</th>
                      <th>Когда использовать</th>
                      <th>1 млн токенов</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model, index) => (
                      <tr key={model.id}>
                        <td>
                          <Link
                            href={`/models/${model.id}`}
                            className="inline-flex items-center gap-2 font-semibold hover:text-green-deep"
                          >
                            <ModelIcon model={model} size={22} plain className="rounded-md" />
                            {model.name}
                          </Link>
                        </td>
                        <td className="text-[0.8125rem] text-muted">
                          {index === 0
                            ? "Универсальный выбор: код, агенты, инструменты"
                            : index === 1
                              ? "Ежедневная рутина и тесты"
                              : index === 2
                                ? "Сложная архитектура и инциденты"
                                : "Если промпты отлажены под Claude"}
                        </td>
                        <td className="whitespace-nowrap font-semibold tabular-nums">
                          {formatRub(modelPricePerMillion(model.coef, DEFAULT_TOPUP_RUB), 2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[0.75rem] text-muted">
                Цены при пополнении на 600 ₽. Полный каталог —{" "}
                <Link href="/models" className="font-semibold text-green-deep hover:underline">
                  здесь
                </Link>
                .
              </p>
            </div>

            {/* Troubleshooting */}
            <div id="troubleshooting" className="mt-8 scroll-mt-28 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-[#fff1e7] text-[#b45a1f]">
                  <Wrench className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
                  Если что-то не работает
                </h2>
              </div>
              <div className="mt-5 grid gap-4">
                {[
                  {
                    problem: "401 Unauthorized",
                    solution:
                      "Переменная CHEAPI_API_KEY не видна процессу. Проверьте `echo $CHEAPI_API_KEY` в том же терминале и перезапустите shell. Ключ должен начинаться с che_sk_.",
                  },
                  {
                    problem: "model_not_found",
                    solution:
                      "ID модели написан с ошибкой. Сверьтесь с GET /v1/models или страницей каталога. Алиасы и версии с датой тоже поддерживаются.",
                  },
                  {
                    problem: "402 Insufficient balance",
                    solution:
                      "Баланс закончился. Пополните его в кабинете — ключ перевыпускать не нужно, доступ восстановится сразу.",
                  },
                  {
                    problem: "Codex зависает на стриме",
                    solution:
                      "Проверьте, что base_url заканчивается на /v1 и wire_api совпадает с версией клиента. Для старых версий используйте chat вместо responses.",
                  },
                  {
                    problem: "Слишком дорого",
                    solution:
                      "Уменьшите контекст: Codex отправляет историю и файлы целиком. Переключитесь на gpt-6.1-terra или deepseek-flash для рутины, а флагманские модели оставьте для сложных задач.",
                  },
                ].map((item) => (
                  <div key={item.problem} className="rounded-xl border border-line bg-[#fbfaf6] p-4">
                    <div className="flex items-center gap-2">
                      <CircleAlert className="size-3.5 text-[#b45a1f]" aria-hidden="true" />
                      <p className="text-[0.8125rem] font-semibold">{item.problem}</p>
                    </div>
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                      {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
                Частые вопросы
              </h2>
              <Faq items={FAQ} className="mt-3" />
            </div>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
                На этой странице
              </p>
              <nav className="mt-3 grid gap-1 text-[0.8125rem]">
                {[
                  ["Установка", "#config"],
                  ["VS Code", "#vscode"],
                  ["Выбор модели", "#models"],
                  ["Ошибки", "#troubleshooting"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="rounded-lg px-2 py-1.5 text-ink-soft hover:bg-cream hover:text-ink"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="rounded-2xl bg-ink p-5 text-white">
              <Terminal className="size-5 text-lime" aria-hidden="true" />
              <p className="mt-3 text-[1rem] font-semibold">Проверка ключа</p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-white/55">
                Один запрос — и видно, работает ли связка.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-black/30 p-3 font-mono text-[0.6875rem] leading-relaxed text-lime">
                <code>{`curl https://cheapi.ru/v1/models \\
  -H "Authorization: Bearer $CHEAPI_API_KEY"`}</code>
              </pre>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5">
              <KeyRound className="size-5 text-green-deep" aria-hidden="true" />
              <p className="mt-3 text-[1rem] font-semibold">Нет ключа?</p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                Регистрация занимает полминуты. 5 млн токенов — сразу на баланс.
              </p>
              <Link href="/register" className="btn btn-primary btn-sm mt-4 w-full">
                Создать аккаунт
              </Link>
            </div>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-line bg-white p-4 text-[0.8125rem] font-semibold hover:border-line-strong"
            >
              Помощь в Telegram
              <ArrowUpRight className="size-4 text-muted" aria-hidden="true" />
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
