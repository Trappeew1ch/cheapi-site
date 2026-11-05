"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/format";

export type KeyItem = {
  id: string;
  name: string;
  prefix: string;
  last4: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export function KeysManager({ initialKeys }: { initialKeys: KeyItem[] }) {
  const router = useRouter();
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; key: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = keys.filter((key) => !key.revoked_at);

  async function create() {
    setError(null);
    setCreating(true);
    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name || "API key" }),
      });
      const data = (await response.json()) as {
        error?: string;
        id?: string;
        key?: string;
        name?: string;
      };
      if (!response.ok || !data.key) {
        throw new Error(data.error ?? "Не удалось создать ключ.");
      }
      setCreated({ id: data.id!, key: data.key, name: data.name ?? name });
      setName("");
      setKeys((current) => [
        {
          id: data.id!,
          name: data.name ?? name,
          prefix: "che_sk",
          last4: data.key!.slice(-4),
          created_at: new Date().toISOString(),
          last_used_at: null,
          revoked_at: null,
        },
        ...current,
      ]);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ошибка.");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    setError(null);
    setRevoking(id);
    try {
      const response = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Не удалось отозвать ключ.");
      setKeys((current) =>
        current.map((key) =>
          key.id === id ? { ...key, revoked_at: new Date().toISOString() } : key,
        ),
      );
      if (created?.id === id) setCreated(null);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ошибка.");
    } finally {
      setRevoking(null);
    }
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Браузер не разрешил копирование. Выделите ключ вручную.");
    }
  }

  function confirmRevoke(id: string, label: string) {
    if (window.confirm(`Отозвать ключ «${label}»? Приложения с этим ключом перестанут работать.`)) {
      void revoke(id);
    }
  }

  return (
    <div className="grid gap-5">
      {created && (
        <div className="rounded-2xl border border-green/30 bg-green-soft p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green/15 text-green-deep">
              <Check className="size-4" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[0.95rem] font-semibold text-ink">Ключ «{created.name}» создан</h2>
              <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-soft">
                Скопируйте его сейчас — полностью ключ больше не показывается.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <code className="min-w-0 flex-1 select-all overflow-x-auto rounded-xl border border-green/20 bg-white px-3 py-2.5 font-mono text-[0.8125rem] text-ink">
                  {created.key}
                </code>
                <button
                  type="button"
                  onClick={() => void copy(created.key)}
                  className="btn btn-primary btn-sm shrink-0"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCreated(null)}
                className="mt-2 text-[0.75rem] font-medium text-green-deep hover:underline"
              >
                Я сохранил ключ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Создать ключ</h2>
        <p className="mt-0.5 text-[0.8125rem] text-muted">
          Дайте ключу понятное имя — например, «Codex» или «Production».
        </p>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            if (active.length >= 10) {
              setError("Достигнут лимит: 10 активных ключей. Отзовите старый.");
              return;
            }
            void create();
          }}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Название ключа"
            maxLength={60}
            className="field sm:max-w-xs"
          />
          <button
            type="submit"
            disabled={creating || active.length >= 10}
            className="btn btn-primary btn-sm shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Создать ключ
          </button>
        </form>
        <p className="mt-2 text-[0.6875rem] text-muted">
          Активных ключей: {active.length} из 10. Ключ хранится как SHA-256-хеш.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger/5 px-3.5 py-3 text-[0.8125rem] text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">Ваши ключи</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted">
            Ключи с пометкой «отозван» больше не работают, но остаются в истории.
          </p>
        </div>

        {keys.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-cream text-green-deep">
              <KeyRound className="size-5" />
            </span>
            <h3 className="mt-3 text-[0.95rem] font-semibold">Пока нет ключей</h3>
            <p className="mt-1 max-w-xs text-[0.8125rem] text-muted">
              Создайте первый ключ — он понадобится для Codex, Claude Code или вашего кода.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="data-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Ключ</th>
                  <th>Создан</th>
                  <th>Использован</th>
                  <th>Статус</th>
                  <th className="text-right">Действие</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => {
                  const revoked = Boolean(key.revoked_at);
                  return (
                    <tr key={key.id} className={cn(revoked && "opacity-55")}>
                      <td className="font-medium">{key.name}</td>
                      <td>
                        <span className="font-mono text-[0.75rem] text-muted">
                          {key.prefix}…{key.last4}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-[0.75rem] text-muted">
                        {formatDate(key.created_at)}
                      </td>
                      <td className="whitespace-nowrap text-[0.75rem] text-muted">
                        {key.last_used_at ? formatRelative(key.last_used_at) : "—"}
                      </td>
                      <td>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
                            revoked
                              ? "bg-line text-muted"
                              : "bg-green-soft text-green-deep",
                          )}
                        >
                          <span
                            className={cn("size-1.5 rounded-full", revoked ? "bg-muted" : "bg-green")}
                          />
                          {revoked ? "Отозван" : "Активен"}
                        </span>
                      </td>
                      <td className="text-right">
                        {!revoked && (
                          <button
                            type="button"
                            onClick={() => confirmRevoke(key.id, key.name)}
                            disabled={revoking === key.id}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.75rem] font-medium text-muted transition-colors hover:bg-danger/5 hover:text-danger disabled:opacity-50"
                          >
                            {revoking === key.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                            Отозвать
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            <div className="divide-y divide-line md:hidden">
              {keys.map((key) => {
                const revoked = Boolean(key.revoked_at);
                return (
                  <div key={key.id} className={cn("px-4 py-4", revoked && "opacity-55")}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[0.875rem] font-medium">{key.name}</div>
                        <div className="mt-0.5 font-mono text-[0.6875rem] text-muted">
                          {key.prefix}…{key.last4}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
                          revoked ? "bg-line text-muted" : "bg-green-soft text-green-deep",
                        )}
                      >
                        <span
                          className={cn("size-1.5 rounded-full", revoked ? "bg-muted" : "bg-green")}
                        />
                        {revoked ? "Отозван" : "Активен"}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <span className="text-[0.6875rem] text-muted">
                        {key.last_used_at
                          ? `Использован ${formatRelative(key.last_used_at)}`
                          : `Создан ${formatDate(key.created_at)}`}
                      </span>
                      {!revoked && (
                        <button
                          type="button"
                          onClick={() => confirmRevoke(key.id, key.name)}
                          disabled={revoking === key.id}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.75rem] font-medium text-muted transition-colors hover:bg-danger/5 hover:text-danger disabled:opacity-50"
                        >
                          {revoking === key.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          Отозвать
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-cream/70 p-4 text-[0.8125rem] leading-relaxed text-muted">
        <strong className="font-semibold text-ink">Безопасность.</strong> Ключ виден только при
        создании. Если он попал в публичный репозиторий, отзовите его и выпустите новый. Не
        используйте один ключ в нескольких проектах — так проще понять, откуда утечка.
      </div>
    </div>
  );
}
