"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowUp,
  ChevronDown,
  Coins,
  Loader2,
  RotateCcw,
  Settings2,
  Sparkles,
} from "lucide-react";
import { formatRub, formatTokens } from "@/lib/format";
import { cn } from "@/lib/format";
import { ModelIcon } from "@/components/model-icon";
import type { FamilyId } from "@/lib/models";

type ChatModel = { id: string; name: string; family: FamilyId };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: string;
};

const SUGGESTIONS = [
  "Объясни, чем отличается OpenAI-совместимый API от нативного SDK.",
  "Напиши функцию на TypeScript для ретраев с экспоненциальной задержкой.",
  "Сравни Claude и GPT для задач code review: плюсы и минусы.",
];

export function Playground({
  models,
  balance,
  rate,
}: {
  models: ChatModel[];
  balance: number;
  rate: number;
}) {
  const router = useRouter();
  const [model, setModel] = useState(models[0]?.id ?? "");
  const [system, setSystem] = useState("");
  const [showSystem, setShowSystem] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState(balance);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || pending) return;

    idRef.current += 1;
    const userMessage: Message = {
      id: `u_${idRef.current}`,
      role: "user",
      content,
    };
    const history = [...messages, userMessage];

    setMessages(history);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/playground", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          system: showSystem ? system : undefined,
          messages: history.map(({ role, content: body }) => ({ role, content: body })),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        content?: string;
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
        balance_tokens?: number;
      };

      if (!response.ok) throw new Error(data.error ?? "Модель не ответила.");

      const before = currentBalance;
      const after = typeof data.balance_tokens === "number" ? data.balance_tokens : before;
      const spent = Math.max(0, before - after);
      const meta = [
        data.usage?.total_tokens ? `${data.usage.total_tokens.toLocaleString("ru-RU")} токенов` : null,
        spent ? `−${formatTokens(spent)} · ${formatRub((spent * rate) / 1_000_000)}` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      idRef.current += 1;
      const assistantId = `a_${idRef.current}`;
      setMessages((current) => [
        ...current,
        {
          id: assistantId,
          role: "assistant",
          content: data.content || "Модель вернула пустой ответ.",
          meta: meta || undefined,
        },
      ]);
      setCurrentBalance(after);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось получить ответ.");
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      setInput(content);
    } finally {
      setPending(false);
      textareaRef.current?.focus();
    }
  }

  const selected = models.find((item) => item.id === model);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <ModelIcon family={selected?.family} size={32} />
            <div>
              <div className="text-[0.8125rem] font-semibold">Песочница</div>
              <div className="text-[0.6875rem] text-muted">
                {selected?.name ?? "Модель"} · реальный баланс
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            disabled={messages.length === 0 || pending}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.75rem] font-medium text-muted transition-colors hover:bg-cream hover:text-ink disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" />
            Очистить
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-lime-soft text-green-deep">
                <Sparkles className="size-5" />
              </span>
              <h2 className="mt-3 text-[1.05rem] font-semibold">Проверьте модель без кода</h2>
              <p className="mt-1 max-w-sm text-[0.8125rem] leading-relaxed text-muted">
                Сообщения уходят в то же API, что используют ваши приложения. Списываются
                реальные токены по вашей ставке.
              </p>
              <div className="mt-5 grid w-full max-w-md gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-left text-[0.8125rem] leading-snug text-ink-soft transition-colors hover:border-line-strong hover:bg-cream"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col",
                    message.role === "user" ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[0.875rem] leading-relaxed sm:max-w-[85%]",
                      message.role === "user"
                        ? "rounded-br-md bg-ink text-white"
                        : "rounded-bl-md border border-line bg-cream/50 text-ink",
                    )}
                  >
                    {message.content}
                  </div>
                  {message.meta && (
                    <div className="mt-1 flex items-center gap-1 px-1 font-mono text-[0.625rem] text-muted">
                      <Coins className="size-3" />
                      {message.meta}
                    </div>
                  )}
                </div>
              ))}
              {pending && (
                <div className="flex items-center gap-2 rounded-xl border border-line bg-cream/40 px-3.5 py-2.5 text-[0.75rem] text-muted">
                  <Loader2 className="size-3.5 animate-spin text-green-deep" />
                  Модель думает…
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3 py-2.5 text-[0.75rem] leading-relaxed text-danger sm:mx-5">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {error}
          </div>
        )}

        <form
          className="border-t border-line p-3 sm:p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <div className="flex items-end gap-2 rounded-2xl border border-line-strong bg-white p-2 focus-within:border-green focus-within:shadow-[0_0_0_4px_rgba(18,183,106,0.1)]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              rows={2}
              maxLength={12_000}
              placeholder="Спросите что угодно… Enter — отправить, Shift+Enter — новая строка"
              className="max-h-40 min-h-[52px] flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-[0.875rem] leading-relaxed outline-none placeholder:text-[#9aa79f]"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-white transition-colors hover:bg-[#163328] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Отправить сообщение"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[0.625rem] text-muted">
            <span className="leading-snug">Списание — только за фактически использованные токены</span>
            <span className="shrink-0 whitespace-nowrap font-mono">{formatTokens(currentBalance)}</span>
          </div>
        </form>
      </div>

      <aside className="grid content-start gap-4">
        <div className="rounded-2xl border border-line bg-white p-4">
          <h2 className="flex items-center gap-2 text-[0.875rem] font-semibold">
            <Settings2 className="size-4 text-green-deep" />
            Параметры
          </h2>

          <label htmlFor="playground-model" className="label mt-4">
            Модель
          </label>
          <div className="relative">
            <select
              id="playground-model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="field appearance-none pr-9 text-[0.8125rem]"
            >
              {models.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowSystem((current) => !current)}
            className="mt-4 flex w-full items-center justify-between text-[0.8125rem] font-medium"
          >
            Системный промпт
            <ChevronDown
              className={cn("size-3.5 text-muted transition-transform", showSystem && "rotate-180")}
            />
          </button>
          {showSystem && (
            <textarea
              value={system}
              onChange={(event) => setSystem(event.target.value)}
              rows={4}
              maxLength={4000}
              placeholder="Ты — внимательный ассистент…"
              className="field mt-2 resize-y text-[0.8125rem]"
            />
          )}
        </div>

        <div className="rounded-2xl border border-line bg-cream/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-muted">
              Баланс
            </span>
            <Coins className="size-3.5 text-green-deep" />
          </div>
          <div className="mt-1.5 text-[1.3rem] font-bold tracking-[-0.03em]">
            {formatTokens(currentBalance)}
          </div>
          <div className="text-[0.6875rem] text-muted">
            ≈ {formatRub((currentBalance * rate) / 1_000_000)}
          </div>
          <p className="mt-3 border-t border-line pt-3 text-[0.6875rem] leading-relaxed text-muted">
            Для продакшена используйте API-ключ и свой сервер. Песочница ограничена 20 запросами
            в минуту.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4">
          <h2 className="text-[0.8125rem] font-semibold">Промпт ушёл?</h2>
          <p className="mt-1 text-[0.6875rem] leading-relaxed text-muted">
            Сравните ответ с тем, что получаете в коде. Если модель ведёт себя иначе — напишите
            в поддержку, разберёмся вместе.
          </p>
          <a
            href="https://t.me/cheapi_support"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-[0.75rem] font-semibold text-green-deep hover:underline"
          >
            @cheapi_support
          </a>
        </div>
      </aside>
    </div>
  );
}
