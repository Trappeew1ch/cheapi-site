import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  all,
  get,
  newId,
  run,
  sha256,
  transaction,
  verifyPassword,
  hashPassword,
  type ApiKeyRow,
  type UserRow,
} from "@/lib/db";
import { DEFAULT_RATE, WELCOME_TOKENS } from "@/lib/pricing";

export const SESSION_COOKIE = "che_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  telegram: string | null;
  balance_tokens: number;
  rate_rub_per_m: number;
  role: string;
  created_at: string;
};

function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    email: row.email,
    telegram: row.telegram,
    balance_tokens: Number(row.balance_tokens),
    rate_rub_per_m: Number(row.rate_rub_per_m),
    role: row.role,
    created_at: row.created_at,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function passwordProblem(password: string): string | null {
  if (password.length < 8) return "Пароль должен быть не короче 8 символов";
  if (password.length > 128) return "Пароль слишком длинный";
  if (!/[a-zA-Zа-яА-Я]/.test(password) || !/[0-9]/.test(password)) {
    return "Добавьте в пароль хотя бы одну букву и одну цифру";
  }
  return null;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return get<UserRow>("SELECT * FROM users WHERE email = ?", normalizeEmail(email));
}

export function getUserById(id: string): UserRow | undefined {
  return get<UserRow>("SELECT * FROM users WHERE id = ?", id);
}

export function createUser(email: string, password: string, telegram?: string) {
  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();
  const id = newId("usr");

  return transaction(() => {
    run(
      "INSERT INTO users (id, email, password_hash, telegram, balance_tokens, rate_rub_per_m, role, created_at) VALUES (?, ?, ?, ?, ?, ?, 'user', ?)",
      id,
      normalized,
      hashPassword(password),
      telegram?.trim() || null,
      WELCOME_TOKENS,
      DEFAULT_RATE,
      now,
    );

    if (WELCOME_TOKENS > 0) {
      run(
        "INSERT INTO topups (id, user_id, amount_rub, tokens, status, provider, promo_code, created_at, paid_at) VALUES (?, ?, ?, ?, 'succeeded', 'promo', 'WELCOME', ?, ?)",
        newId("top"),
        id,
        (WELCOME_TOKENS * DEFAULT_RATE) / 1_000_000,
        WELCOME_TOKENS,
        now,
        now,
      );
    }

    return getUserById(id)!;
  });
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 86_400_000);
  run(
    "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    sha256(token),
    userId,
    expires.toISOString(),
    now.toISOString(),
  );

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    run("DELETE FROM sessions WHERE token_hash = ?", sha256(token));
  }
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = get<UserRow & { expires_at: string }>(
    "SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?",
    sha256(token),
  );
  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    run("DELETE FROM sessions WHERE token_hash = ?", sha256(token));
    return null;
  }

  return toSessionUser(row);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export function verifyUserPassword(user: UserRow, password: string): boolean {
  return verifyPassword(password, user.password_hash);
}

export function createApiKey(userId: string, name: string) {
  const raw = `che_sk_${crypto.randomBytes(24).toString("base64url")}`;
  const id = newId("key");
  const now = new Date().toISOString();
  run(
    "INSERT INTO api_keys (id, user_id, name, prefix, last4, key_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    id,
    userId,
    name.trim().slice(0, 60) || "API key",
    "che_sk",
    raw.slice(-4),
    sha256(raw),
    now,
  );
  return { id, key: raw, name, createdAt: now };
}

export function getApiKeys(userId: string): ApiKeyRow[] {
  return all<ApiKeyRow>(
    "SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC",
    userId,
  );
}

export function revokeApiKey(userId: string, keyId: string): boolean {
  const result = run(
    "UPDATE api_keys SET revoked_at = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL",
    new Date().toISOString(),
    keyId,
    userId,
  );
  return Number(result.changes) > 0;
}

export type AuthenticatedKey = {
  key: ApiKeyRow;
  user: UserRow;
};

export function authenticateApiKey(request: Request): AuthenticatedKey | null {
  const authorization = request.headers.get("authorization");
  const headerKey = request.headers.get("x-api-key");
  const raw = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : headerKey?.trim();

  if (!raw || raw.length < 20) return null;

  const key = get<ApiKeyRow>(
    "SELECT * FROM api_keys WHERE key_hash = ? AND revoked_at IS NULL",
    sha256(raw),
  );
  if (!key) return null;

  const user = getUserById(key.user_id);
  if (!user) return null;

  const lastUsed = key.last_used_at ? new Date(key.last_used_at).getTime() : 0;
  if (Date.now() - lastUsed > 60_000) {
    run(
      "UPDATE api_keys SET last_used_at = ? WHERE id = ?",
      new Date().toISOString(),
      key.id,
    );
  }

  return { key, user };
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(keyId: string, limit = 120): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(keyId);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(keyId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const host = request.headers.get("host");
    return originHost === host;
  } catch {
    return false;
  }
}
