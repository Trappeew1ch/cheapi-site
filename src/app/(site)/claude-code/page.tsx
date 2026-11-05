import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  KeyRound,
  Settings2,
  ShieldCheck,
  Sparkles,
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
  title: "Claude Code — подключение через CheApi",
  description:
    "Как настроить Claude Code с CheApi: ANTHROPIC_BASE_URL, ANTHROPIC_AUTH_TOKEN, выбор модели и решение ошибок. Оплата в рублях, без подписки Claude Max.",
  alternates: { canonical: "/claude-code" },
};

const INSTALL = `# Node.js 18+
npm install -g @anthropic-ai/claude-code

# проверка
claude --version`;

const ENV = `# ~/.zshrc или ~/.bashrc
export ANTHROPIC_BASE_URL="https://cheapi.ru"
export ANTHROPIC_AUTH_TOKEN="che_sk_ваш_ключ"
export ANTHROPIC_MODEL="claude-sonnet-5-5"
export ANTHROPIC_SMALL_FAST_MODEL="claude-haiku-5-5"`;

const APPLY = `source ~/.zshrc

# перейдите в проект и запустите
cd ~/projects/my-app
claude`;

const SETTINGS_JSON = `{
  "env": {
    "ANTHROPIC_BASE_URL": "https://cheapi.ru",
    "ANTHROPIC_AUTH_TOKEN": "che_sk_ваш_ключ",
    "ANTHROPIC_MODEL": "claude-sonnet-5-5",
    "ANTHROPIC_SMALL_FAST_MODEL": "claude-haiku-5-5"
  }
}`;

const VERIFY = `curl https://cheapi.ru/v1/messages \\
  -H "x-api-key: $ANTHROPIC_AUTH_TOKEN" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
    "model": "claude-sonnet-5-5",
    "max_tokens": 64,
    "messages": [{"role":"user","content":"ping"}]
  }'`;

const FAQ: FaqItem[] = [
  {
    question: "Чем это отличается от подписки Claude Max?",
    answer:
      "Claude Code можно использовать с API-ключом вместо подписки. Вы платите за токены по факту, без ежемесячной платы и лимитов на «сообщения». Для интенсивной работы это часто дешевле, а для редкой — заметно дешевле.",
  },
  {
    question: "Нужен ли VPN?",
    answer:
      "Нет. Запросы идут на cheapi.ru, а не напрямую в Anthropic. Оплата — российской картой или через СБП. Зарубежная карта и аккаунт Anthropic не нужны.",
  },
  {
    question: "Claude Code пишет «Invalid API key»",
    answer:
      "Проверьте, что ANTHROPIC_AUTH_TOKEN содержит ключ CheApi (che_sk_…), а не ключ Anthropic (sk-ant-…). Переменные должны быть видны процессу: запустите `echo $ANTHROPIC_AUTH_TOKEN` в том же терминале. После изменения ~/.zshrc выполните source ~/.zshrc.",
  },
  {
    question: "Какие модели поддерживаются?",
    answer:
      "Все Claude-модели каталога: Opus 5.5, Opus 5, Sonnet 5.5, Sonnet 5, Haiku 5.5, Haiku 4.5, Fable 5.1 и предыдущие версии. Можно переключаться через ANTHROPIC_MODEL или командой /model внутри Claude Code.",
  },
  {
    question: "Куда уходят данные?",
    answer:
      "Запросы проксируются upstream-провайдеру через TLS. CheApi не сохраняет тексты промптов и ответов — только метаданные: модель, токены, стоимость, статус и задержку. Ключи хранятся в виде хеша.",
  },
  {
    question: "Можно ли использовать корпоративный прокси?",
    answer:
      "Да, если он не подменяет TLS и пропускает POST на cheapi.ru. Укажите HTTPS_PROXY в окружении — Claude Code и Node.js подхватят его. Если proxy требует Basic Auth, добавьте учётные данные в URL.",
  },
];

export default function ClaudeCodePage() {
  const models = [
    {
      id: "claude-sonnet-5-5",
      note: "Оптимальный баланс скорости и качества. Ставьте по умолчанию.",
      tag: "Рекомендуем",
    },
    {
      id: "claude-opus-5-5",
      note: "Сложная архитектура, большие рефакторинги, критичное ревью.",
      tag: "Максимум",
    },
    {
      id: "claude-haiku-5-5",
      note: "Быстрые ответы для мелких правок и фоновых задач.",
      tag: "Быстро",
    },
    {
      id: "claude-sonnet-5",
      note: "Предыдущее поколение, если промпты уже отлажены под него.",
      tag: "Выгодно",
    },
  ]
    .map((item) => ({ ...item, model: MODEL_MAP.get(item.id) }))
    .filter((item): item is typeof item & { model: NonNullable<typeof item.model> } =>
      Boolean(item.model),
    );

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
          { label: "Claude Code" },
        ]}
        eyebrow="Инструменты · Anthropic Claude Code"
        title={
          <>
            Claude Code
            <br />
            <span className="text-gradient">без подписки и VPN</span>
          </>
        }
        description="Тот же терминальный агент, но запросы идут через CheApi, а оплата — в рублях за токены. Настройка занимает две переменные окружения."
        actions={
          <>
            <Link href="/register" className="btn btn-primary btn-lg">
              Создать API-ключ
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href="#setup" className="btn btn-ghost btn-lg">
              Как настроить
            </a>
          </>
        }
        aside={
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0a1712] shadow-lift">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="font-mono text-[0.6875rem] text-white/40">
                ~/.zshrc
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lime/20 bg-lime/10 px-2 py-0.5 font-mono text-[0.6rem] text-lime">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-lime" />
                claude ready
              </span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[0.7rem] leading-[1.9] text-[#d7e5dc]">
              <code>{ENV}</code>
            </pre>
            <div className="border-t border-white/10 px-4 py-2.5 font-mono text-[0.625rem] text-white/35">
              ✓ ключ принят · ✓ модель доступна
            </div>
          </div>
        }
      />

      <section className="container-page py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div className="min-w-0">
            <div id="setup" className="scroll-mt-28 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <p className="eyebrow">Настройка</p>
              <h2 className="h3 mt-3">Две переменные — и готово</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                Claude Code — официальный терминальный агент Anthropic. Он умеет
                работать с любым Anthropic-совместимым endpoint, поэтому CheApi
                подключается без патчей и обёрток.
              </p>

              <ol className="mt-8 grid gap-8">
                <li>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[0.6875rem] font-bold text-white">
                      01
                    </span>
                    <h3 className="!m-0 text-[1.0625rem] font-semibold">Установите Claude Code</h3>
                  </div>
                  <div className="mt-3 pl-9">
                    <CodeBlock code={INSTALL} filename="bash" />
                    <p className="mt-2.5 text-[0.8125rem] text-muted">
                      Нужен Node.js 18+. На macOS также доступна установка через
                      Homebrew: <code>brew install --cask claude-code</code>.
                    </p>
                  </div>
                </li>

                <li>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[0.6875rem] font-bold text-white">
                      02
                    </span>
                    <h3 className="!m-0 text-[1.0625rem] font-semibold">Возьмите ключ CheApi</h3>
                  </div>
                  <div className="mt-3 pl-9">
                    <p className="text-[0.875rem] leading-relaxed text-muted">
                      Кабинет → «Ключи» → «Создать ключ». Скопируйте значение
                      целиком, оно показывается один раз.
                    </p>
                    <Link href="/dashboard/keys" className="btn btn-ghost btn-sm mt-3">
                      <KeyRound className="size-3.5" aria-hidden="true" />
                      Открыть ключи
                    </Link>
                  </div>
                </li>

                <li>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[0.6875rem] font-bold text-white">
                      03
                    </span>
                    <h3 className="!m-0 text-[1.0625rem] font-semibold">
                      Добавьте переменные в shell
                    </h3>
                  </div>
                  <div className="mt-3 pl-9">
                    <CodeBlock code={ENV} filename="~/.zshrc" />
                    <p className="mt-2.5 text-[0.8125rem] text-muted">
                      Для bash используйте <code>~/.bashrc</code>, для fish —{" "}
                      <code>set -Ux</code>. В Windows задайте переменные через
                      «Параметры системы → Переменные среды».
                    </p>
                  </div>
                </li>

                <li>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-ink font-mono text-[0.6875rem] font-bold text-white">
                      04
                    </span>
                    <h3 className="!m-0 text-[1.0625rem] font-semibold">Запустите</h3>
                  </div>
                  <div className="mt-3 pl-9">
                    <CodeBlock code={APPLY} filename="bash" />
                    <p className="mt-2.5 text-[0.8125rem] text-muted">
                      Claude Code покажет модель и попросит разрешение на доступ
                      к проекту. При первом запуске не выбирайте вход через
                      Anthropic — используется ключ из окружения.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* settings.json */}
            <div id="settings" className="mt-8 scroll-mt-28 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-cream text-ink">
                  <Settings2 className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
                    Альтернатива: settings.json
                  </h2>
                  <p className="text-[0.75rem] text-muted">
                    Если не хочется трогать shell-профиль
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[0.875rem] leading-relaxed text-muted">
                Claude Code читает <code>~/.claude/settings.json</code>. Блок{" "}
                <code>env</code> задаёт переменные только для агента, не
                затрагивая остальной терминал.
              </p>
              <CodeBlock code={SETTINGS_JSON} filename="~/.claude/settings.json" tone="light" className="mt-3" />
              <p className="mt-2.5 text-[0.75rem] text-muted">
                Не коммитьте этот файл в репозиторий. Для командной работы
                используйте переменные окружения или секреты CI.
              </p>
            </div>

            {/* Models */}
            <div id="models" className="mt-8 scroll-mt-28 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-[#fff0e6] text-[#c2612a]">
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
                  Модели для Claude Code
                </h2>
              </div>
              <div className="table-wrap mt-4">
                <table className="data-table min-w-[620px]">
                  <thead>
                    <tr>
                      <th>Модель</th>
                      <th>Зачем</th>
                      <th>1 млн токенов</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Link
                            href={`/models/${item.id}`}
                            className="inline-flex items-center gap-2 font-semibold hover:text-green-deep"
                          >
                            <ModelIcon model={item.model} size={22} plain className="rounded-md" />
                            {item.model.name}
                          </Link>
                          <span className="ml-2 rounded-full bg-cream px-1.5 py-0.5 text-[0.625rem] font-semibold text-muted">
                            {item.tag}
                          </span>
                        </td>
                        <td className="text-[0.8125rem] text-muted">{item.note}</td>
                        <td className="whitespace-nowrap font-semibold tabular-nums">
                          {formatRub(
                            modelPricePerMillion(item.model.coef, DEFAULT_TOPUP_RUB),
                            2,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[0.75rem] text-muted">
                Внутри Claude Code модель можно сменить командой{" "}
                <code>/model</code>. Для фоновых задач агент использует{" "}
                <code>ANTHROPIC_SMALL_FAST_MODEL</code> — Haiku заметно дешевле.
              </p>
            </div>

            {/* Verify */}
            <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-green-soft text-green-deep">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
                  Проверка без Claude Code
                </h2>
              </div>
              <p className="mt-4 text-[0.875rem] leading-relaxed text-muted">
                Если агент не запускается, сначала проверьте связку обычным
                curl-запросом. Так сразу видно, в чём проблема: ключ, сеть или
                сам клиент.
              </p>
              <CodeBlock code={VERIFY} filename="bash" className="mt-3" />
            </div>

            {/* Troubleshooting */}
            <div id="troubleshooting" className="mt-8 scroll-mt-28 rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-[#fff1e7] text-[#b45a1f]">
                  <Wrench className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-[1.125rem] font-semibold tracking-[-0.02em]">
                  Типичные ошибки
                </h2>
              </div>
              <div className="mt-5 grid gap-4">
                {[
                  {
                    problem: "Invalid API key · Please run /login",
                    solution:
                      "Claude Code не видит ANTHROPIC_AUTH_TOKEN или использует сохранённый вход Anthropic. Проверьте echo $ANTHROPIC_AUTH_TOKEN, выполните /logout внутри агента и перезапустите терминал.",
                  },
                  {
                    problem: "401 · authentication_error",
                    solution:
                      "Ключ отозван или скопирован не полностью. Создайте новый в кабинете и обновите переменную. Ключи Anthropic (sk-ant-…) не подходят — нужен che_sk_….",
                  },
                  {
                    problem: "model_not_found",
                    solution:
                      "Проверьте точный ID в каталоге. Для Claude Code используйте claude-sonnet-5-5, claude-opus-5-5 или claude-haiku-5-5. Алиасы с датой тоже работают.",
                  },
                  {
                    problem: "402 · insufficient_balance",
                    solution:
                      "Пополните баланс в кабинете. После зачисления ключ продолжит работать без перевыпуска. Минимум — 25 ₽.",
                  },
                  {
                    problem: "Долгие ответы и таймауты",
                    solution:
                      "Ограничьте контекст: не добавляйте в сессию лишние файлы. Проверьте, что ANTHROPIC_BASE_URL указывает на https://cheapi.ru без /v1 на конце — SDK добавит путь сам.",
                  },
                  {
                    problem: "Слишком большой расход",
                    solution:
                      "Установите Haiku для фоновых задач и Sonnet для основной работы. Opus включайте точечно — он в 1,8 раза дороже Sonnet 5.5. История расходов есть в кабинете.",
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
                  ["Настройка", "#setup"],
                  ["settings.json", "#settings"],
                  ["Модели", "#models"],
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
              <p className="mt-3 text-[1rem] font-semibold">Быстрый старт</p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-white/55">
                Три команды до первого запуска.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-black/30 p-3 font-mono text-[0.65rem] leading-relaxed text-lime">
                <code>{`npm i -g @anthropic-ai/claude-code
export ANTHROPIC_BASE_URL=https://cheapi.ru
export ANTHROPIC_AUTH_TOKEN=che_sk_…
claude`}</code>
              </pre>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5">
              <Zap className="size-5 text-green-deep" aria-hidden="true" />
              <p className="mt-3 text-[1rem] font-semibold">5 млн токенов</p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                Новым аккаунтам — бесплатно. Хватит, чтобы попробовать Claude
                Code на реальном проекте.
              </p>
              <Link href="/register" className="btn btn-primary btn-sm mt-4 w-full">
                Начать
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
