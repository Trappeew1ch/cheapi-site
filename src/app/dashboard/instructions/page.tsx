import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  KeyRound,
  LifeBuoy,
  Terminal,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { CodeTabs } from "@/components/code-tabs";
import { PageHead } from "@/components/dashboard-ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Инструкции" };

const TOOL_TABS = [
  {
    label: "Codex CLI",
    filename: "terminal",
    code: `export OPENAI_BASE_URL="${SITE.apiBase}"
export OPENAI_API_KEY="che_sk_..."
codex`,
  },
  {
    label: "Claude Code",
    filename: "terminal",
    code: `export ANTHROPIC_BASE_URL="https://cheapi.ru"
export ANTHROPIC_AUTH_TOKEN="che_sk_..."
claude`,
  },
  {
    label: "Python",
    filename: "main.py",
    code: `from openai import OpenAI

client = OpenAI(
    api_key="che_sk_...",
    base_url="${SITE.apiBase}",
)

response = client.chat.completions.create(
    model="gpt-6.1-sol",
    messages=[{"role": "user", "content": "Привет!"}],
)
print(response.choices[0].message.content)`,
  },
  {
    label: "Node.js",
    filename: "index.ts",
    code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "che_sk_...",
  baseURL: "${SITE.apiBase}",
});

const response = await client.chat.completions.create({
  model: "gpt-6.1-sol",
  messages: [{ role: "user", content: "Привет!" }],
});
console.log(response.choices[0].message.content);`,
  },
  {
    label: "cURL",
    filename: "terminal",
    code: `curl ${SITE.apiBase}/chat/completions \\
  -H "Authorization: Bearer che_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-6.1-sol",
    "messages": [{"role": "user", "content": "Привет!"}]
  }'`,
  },
  {
    label: "Cursor",
    filename: "settings",
    code: `# Cursor → Settings → Models → OpenAI API Key
Base URL: ${SITE.apiBase}
API Key:  che_sk_...
Model:    gpt-6.1-sol`,
  },
];

export default async function InstructionsPage() {
  const user = await requireUser();

  return (
    <div className="grid gap-6">
      <PageHead
        eyebrow="Подключение"
        title="Инструкции"
        description={`Привет, ${user.email.split("@")[0]}. Ниже — готовые конфиги для популярных инструментов. Замените che_sk_... на свой ключ.`}
        actions={
          <Link href="/dashboard/keys" className="btn btn-primary btn-sm">
            <KeyRound className="size-4" />
            Создать ключ
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "Создайте ключ",
            text: "В разделе «API-ключи». Полная строка показывается один раз.",
            href: "/dashboard/keys",
            link: "Перейти к ключам",
          },
          {
            step: "02",
            title: "Подставьте base URL",
            text: `Для OpenAI-совместимых инструментов — ${SITE.apiBase}. Для Anthropic — https://cheapi.ru.`,
            href: "/docs",
            link: "Документация",
          },
          {
            step: "03",
            title: "Отправьте запрос",
            text: "Модель указывайте из каталога. Баланс и расход видны в кабинете.",
            href: "/models",
            link: "Каталог моделей",
          },
        ].map((item) => (
          <div key={item.step} className="rounded-2xl border border-line bg-white p-4">
            <span className="font-mono text-[0.6875rem] font-semibold text-green-deep">{item.step}</span>
            <h2 className="mt-1.5 text-[0.9375rem] font-semibold">{item.title}</h2>
            <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">{item.text}</p>
            <Link
              href={item.href}
              className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-green-deep hover:underline"
            >
              {item.link}
              <ArrowRight className="size-3" />
            </Link>
          </div>
        ))}
      </section>

      <section className="min-w-0 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-green-deep" />
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Готовые конфиги</h2>
        </div>
        <p className="mt-1 text-[0.8125rem] text-muted">
          Выберите инструмент. Все примеры используют ваш реальный баланс.
        </p>
        <CodeTabs tabs={TOOL_TABS} className="mt-4" />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 text-[1rem] font-semibold">
            <CheckCircle2 className="size-4 text-green-deep" />
            Что поддерживается
          </h2>
          <ul className="mt-3 grid gap-2 text-[0.8125rem] leading-relaxed text-muted">
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-green" />
              <span>
                <code className="rounded bg-cream px-1 py-0.5 font-mono text-[0.75rem]">/v1/chat/completions</code>{" "}
                — OpenAI-совместимый чат, включая стриминг.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-green" />
              <span>
                <code className="rounded bg-cream px-1 py-0.5 font-mono text-[0.75rem]">/v1/messages</code>{" "}
                — Anthropic-формат для Claude Code и SDK.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-green" />
              <span>Изображения, транскрибация и эмбеддинги — по тем же ключам.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-green" />
              <span>Заголовки Authorization: Bearer и x-api-key.</span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 text-[1rem] font-semibold">
            <LifeBuoy className="size-4 text-green-deep" />
            Если не работает
          </h2>
          <ol className="mt-3 grid gap-2.5 text-[0.8125rem] leading-relaxed text-muted">
            <li>
              <strong className="font-medium text-ink">401</strong> — ключ не передан или отозван.
              Проверьте заголовок и создайте новый ключ.
            </li>
            <li>
              <strong className="font-medium text-ink">402</strong> — недостаточно баланса.
              Пополните в разделе «Баланс и оплата».
            </li>
            <li>
              <strong className="font-medium text-ink">404</strong> — проверьте base URL: для
              OpenAI-клиентов он должен заканчиваться на <code className="rounded bg-cream px-1 font-mono text-[0.75rem]">/v1</code>.
            </li>
            <li>
              <strong className="font-medium text-ink">429</strong> — превышен лимит 120 запросов в
              минуту. Добавьте ретраи с задержкой.
            </li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/docs" className="btn btn-white btn-sm">
              <BookOpen className="size-3.5" />
              Открыть документацию
            </Link>
            <a
              href={SITE.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              Написать в поддержку
            </a>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-cream/70 p-5">
        <h2 className="text-[0.9375rem] font-semibold">Ваш эндпоинт</h2>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 overflow-x-auto rounded-xl border border-line bg-white px-3 py-2.5 font-mono text-[0.8125rem]">
            {SITE.apiBase}
          </code>
          <Link href="/dashboard/keys" className="btn btn-primary btn-sm shrink-0">
            <KeyRound className="size-3.5" />
            К ключам
          </Link>
        </div>
        <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted">
          Не публикуйте ключ в клиентском коде и публичных репозиториях. Для браузера используйте
          серверный прокси.
        </p>
      </section>
    </div>
  );
}
