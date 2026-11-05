import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DEFAULT_RATE } from "@/lib/pricing";

type Row = Record<string, unknown>;

let cached: DatabaseSync | null = null;

function databasePath(): string {
  const custom = process.env.DATABASE_PATH;
  if (custom) return custom;
  return path.join(process.cwd(), "data", "cheapi.db");
}

export function getDb(): DatabaseSync {
  if (cached) return cached;

  const file = databasePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const database = new DatabaseSync(file);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA busy_timeout = 5000;");
  migrate(database);
  seed(database);
  cached = database;
  return database;
}

function migrate(database: DatabaseSync) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      telegram TEXT,
      balance_tokens INTEGER NOT NULL DEFAULT 0,
      rate_rub_per_m REAL NOT NULL DEFAULT ${DEFAULT_RATE},
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      prefix TEXT NOT NULL,
      last4 TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      last_used_at TEXT,
      revoked_at TEXT
    );

    CREATE TABLE IF NOT EXISTS topups (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount_rub REAL NOT NULL,
      tokens INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      provider TEXT NOT NULL DEFAULT 'yookassa',
      provider_id TEXT,
      promo_code TEXT,
      created_at TEXT NOT NULL,
      paid_at TEXT
    );

    CREATE TABLE IF NOT EXISTS promo_codes (
      code TEXT PRIMARY KEY,
      tokens INTEGER NOT NULL,
      max_uses INTEGER NOT NULL DEFAULT 1000,
      uses INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS promo_redemptions (
      code TEXT NOT NULL,
      user_id TEXT NOT NULL,
      redeemed_at TEXT NOT NULL,
      PRIMARY KEY (code, user_id)
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key_id TEXT,
      model TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      cached_tokens INTEGER NOT NULL DEFAULT 0,
      charged_tokens INTEGER NOT NULL DEFAULT 0,
      cost_rub REAL NOT NULL DEFAULT 0,
      status INTEGER NOT NULL DEFAULT 200,
      latency_ms INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_keys_user ON api_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_topups_user ON topups(user_id);
    CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage_logs(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_usage_model ON usage_logs(model);
  `);
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(12).toString("hex")}`;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return crypto.timingSafeEqual(expected, derived);
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function seed(database: DatabaseSync) {
  const now = new Date().toISOString();
  const promoCount = database
    .prepare("SELECT COUNT(*) AS count FROM promo_codes")
    .get() as Row;

  if (Number(promoCount.count) === 0) {
    database
      .prepare(
        "INSERT INTO promo_codes (code, tokens, max_uses, uses, active, created_at) VALUES (?, ?, ?, 0, 1, ?)",
      )
      .run("CHE5M", 5_000_000, 10_000, now);
  }

  const hasDemo = database
    .prepare("SELECT id FROM users WHERE email = ?")
    .get("demo@cheapi.ru");
  if (hasDemo) return;

  const demoId = newId("usr");
  const adminId = newId("usr");

  database
    .prepare(
      "INSERT INTO users (id, email, password_hash, balance_tokens, rate_rub_per_m, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      demoId,
      "demo@cheapi.ru",
      hashPassword("demo1234"),
      25_000_000,
      DEFAULT_RATE,
      "user",
      now,
    );

  database
    .prepare(
      "INSERT INTO users (id, email, password_hash, balance_tokens, rate_rub_per_m, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      adminId,
      "admin@cheapi.ru",
      hashPassword("admin1234"),
      50_000_000,
      DEFAULT_RATE,
      "admin",
      now,
    );

  const keyPrefix = "che_sk_demo";
  const rawKey = `${keyPrefix}_${crypto.randomBytes(16).toString("base64url")}`;
  database
    .prepare(
      "INSERT INTO api_keys (id, user_id, name, prefix, last4, key_hash, created_at, last_used_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      newId("key"),
      demoId,
      "Demo key",
      keyPrefix,
      rawKey.slice(-4),
      sha256(rawKey),
      now,
      now,
    );

  const demoModels: Array<[string, number, number, number]> = [
    ["gpt-6.1-sol", 18_000, 4_200, 4],
    ["claude-sonnet-5-5", 9_600, 2_100, 11],
    ["deepseek-flash", 64_000, 12_000, 0.3],
    ["glm-5.3", 21_000, 5_200, 1.5],
    ["gpt-6.1-terra", 8_800, 1_900, 1.5],
    ["claude-opus-5-5", 3_200, 960, 20],
  ];
  const insertUsage = database.prepare(
    "INSERT INTO usage_logs (id, user_id, key_id, model, endpoint, input_tokens, output_tokens, cached_tokens, charged_tokens, cost_rub, status, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );

  for (let day = 13; day >= 0; day -= 1) {
    const requests = 4 + ((day * 7 + 3) % 9);
    for (let i = 0; i < requests; i += 1) {
      const [model, input, output, coef] = demoModels[(day + i) % demoModels.length];
      const cached = Math.round(input * 0.35);
      const charged = Math.ceil((input + output + cached * 0.4) * coef);
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(9 + ((i * 3) % 12), (i * 17) % 60, 0, 0);
      insertUsage.run(
        newId("req"),
        demoId,
        null,
        model,
        "/v1/chat/completions",
        input,
        output,
        cached,
        charged,
        (charged * DEFAULT_RATE) / 1_000_000,
        200,
        480 + ((i * 137) % 1900),
        date.toISOString(),
      );
    }
  }

  // Keep the demo balance consistent with the seeded spend: welcome credit minus usage.
  database
    .prepare(
      "UPDATE users SET balance_tokens = MAX(0, ? - (SELECT COALESCE(SUM(charged_tokens), 0) FROM usage_logs WHERE user_id = ?)) WHERE id = ?",
    )
    .run(25_000_000, demoId, demoId);

  // Welcome credit for the seeded accounts, recorded for transparency.
  const insertTopup = database.prepare(
    "INSERT INTO topups (id, user_id, amount_rub, tokens, status, provider, promo_code, created_at, paid_at) VALUES (?, ?, ?, ?, 'succeeded', 'promo', ?, ?, ?)",
  );
  insertTopup.run(
    newId("top"),
    demoId,
    (25_000_000 * DEFAULT_RATE) / 1_000_000,
    25_000_000,
    "WELCOME",
    now,
    now,
  );
  insertTopup.run(
    newId("top"),
    adminId,
    (50_000_000 * DEFAULT_RATE) / 1_000_000,
    50_000_000,
    "WELCOME",
    now,
    now,
  );
}

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  telegram: string | null;
  balance_tokens: number;
  rate_rub_per_m: number;
  role: string;
  created_at: string;
};

export type ApiKeyRow = {
  id: string;
  user_id: string;
  name: string;
  prefix: string;
  last4: string;
  key_hash: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export type UsageRow = {
  id: string;
  user_id: string;
  key_id: string | null;
  model: string;
  endpoint: string;
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  charged_tokens: number;
  cost_rub: number;
  status: number;
  latency_ms: number;
  created_at: string;
};

export function all<T>(sql: string, ...params: Array<string | number | null>): T[] {
  const statement = getDb().prepare(sql);
  return statement.all(...params) as unknown as T[];
}

export function get<T>(sql: string, ...params: Array<string | number | null>): T | undefined {
  const statement = getDb().prepare(sql);
  return statement.get(...params) as unknown as T | undefined;
}

export function run(sql: string, ...params: Array<string | number | null>) {
  const statement = getDb().prepare(sql);
  return statement.run(...params);
}

export function transaction<T>(fn: () => T): T {
  const database = getDb();
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
