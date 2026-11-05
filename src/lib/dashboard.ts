import "server-only";
import { all, get, type UsageRow, type UserRow } from "@/lib/db";

export type Stats = {
  requests: number;
  tokens: number;
  rub: number;
  latency: number;
  todayTokens: number;
  todayRequests: number;
};

export type DailyUsage = {
  date: string;
  label: string;
  requests: number;
  tokens: number;
  rub: number;
};

export type ModelUsage = {
  model: string;
  requests: number;
  tokens: number;
  rub: number;
};

export type DashboardTopup = {
  id: string;
  user_id: string;
  amount_rub: number;
  tokens: number;
  status: string;
  provider: string;
  provider_id: string | null;
  promo_code: string | null;
  created_at: string;
  paid_at: string | null;
};

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function getStats(userId: string, days = 30): Stats {
  const since = daysAgoIso(days);
  const today = daysAgoIso(1);

  const totals = get<{
    requests: number;
    tokens: number;
    rub: number;
    latency: number;
  }>(
    `SELECT COUNT(*) AS requests,
            COALESCE(SUM(charged_tokens), 0) AS tokens,
            COALESCE(SUM(cost_rub), 0) AS rub,
            COALESCE(AVG(latency_ms), 0) AS latency
       FROM usage_logs
      WHERE user_id = ? AND created_at >= ?`,
    userId,
    since,
  );

  const todayRow = get<{ requests: number; tokens: number }>(
    `SELECT COUNT(*) AS requests, COALESCE(SUM(charged_tokens), 0) AS tokens
       FROM usage_logs
      WHERE user_id = ? AND created_at >= ?`,
    userId,
    today,
  );

  return {
    requests: Number(totals?.requests ?? 0),
    tokens: Number(totals?.tokens ?? 0),
    rub: Number(totals?.rub ?? 0),
    latency: Number(totals?.latency ?? 0),
    todayTokens: Number(todayRow?.tokens ?? 0),
    todayRequests: Number(todayRow?.requests ?? 0),
  };
}

export function getDailyUsage(userId: string, days = 14): DailyUsage[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const rows = all<{
    day: string;
    requests: number;
    tokens: number;
    rub: number;
  }>(
    `SELECT substr(created_at, 1, 10) AS day,
            COUNT(*) AS requests,
            COALESCE(SUM(charged_tokens), 0) AS tokens,
            COALESCE(SUM(cost_rub), 0) AS rub
       FROM usage_logs
      WHERE user_id = ? AND created_at >= ?
      GROUP BY day
      ORDER BY day ASC`,
    userId,
    start.toISOString(),
  );

  const byDay = new Map(rows.map((row) => [row.day, row]));
  const result: DailyUsage[] = [];
  const formatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" });

  for (let index = 0; index < days; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const row = byDay.get(key);
    result.push({
      date: key,
      label: formatter.format(date).replace(".", ""),
      requests: Number(row?.requests ?? 0),
      tokens: Number(row?.tokens ?? 0),
      rub: Number(row?.rub ?? 0),
    });
  }

  return result;
}

export function getModelUsage(userId: string, days = 30, limit = 8): ModelUsage[] {
  return all<ModelUsage>(
    `SELECT model,
            COUNT(*) AS requests,
            COALESCE(SUM(charged_tokens), 0) AS tokens,
            COALESCE(SUM(cost_rub), 0) AS rub
       FROM usage_logs
      WHERE user_id = ? AND created_at >= ?
      GROUP BY model
      ORDER BY tokens DESC
      LIMIT ?`,
    userId,
    daysAgoIso(days),
    limit,
  ).map((row) => ({
    ...row,
    requests: Number(row.requests),
    tokens: Number(row.tokens),
    rub: Number(row.rub),
  }));
}

export function getRecentUsage(userId: string, limit = 10): UsageRow[] {
  return all<UsageRow>(
    "SELECT * FROM usage_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    userId,
    limit,
  );
}

export function getAllUsage(userId: string, limit = 200): UsageRow[] {
  return all<UsageRow>(
    "SELECT * FROM usage_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    userId,
    limit,
  );
}

export function getTopups(userId: string, limit = 25): DashboardTopup[] {
  return all<DashboardTopup>(
    "SELECT * FROM topups WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    userId,
    limit,
  );
}

export function getKeysSummary(userId: string) {
  const row = get<{ total: number; active: number; used: number }>(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN revoked_at IS NULL THEN 1 ELSE 0 END), 0) AS active,
            COALESCE(SUM(CASE WHEN last_used_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS used
       FROM api_keys WHERE user_id = ?`,
    userId,
  );
  return {
    total: Number(row?.total ?? 0),
    active: Number(row?.active ?? 0),
    used: Number(row?.used ?? 0),
  };
}

export function getAdminOverview() {
  const users = all<
    UserRow & { requests: number; spent: number; last_request: string | null }
  >(
    `SELECT u.*,
            COALESCE((SELECT COUNT(*) FROM usage_logs l WHERE l.user_id = u.id), 0) AS requests,
            COALESCE((SELECT SUM(cost_rub) FROM usage_logs l WHERE l.user_id = u.id), 0) AS spent,
            (SELECT MAX(created_at) FROM usage_logs l WHERE l.user_id = u.id) AS last_request
       FROM users u
      ORDER BY u.created_at DESC
      LIMIT 100`,
  );

  const totals = get<{ users: number; tokens: number; rub: number; requests: number }>(
    `SELECT (SELECT COUNT(*) FROM users) AS users,
            (SELECT COALESCE(SUM(balance_tokens), 0) FROM users) AS tokens,
            (SELECT COALESCE(SUM(cost_rub), 0) FROM usage_logs) AS rub,
            (SELECT COUNT(*) FROM usage_logs) AS requests`,
  );

  return {
    users,
    totals: {
      users: Number(totals?.users ?? 0),
      tokens: Number(totals?.tokens ?? 0),
      rub: Number(totals?.rub ?? 0),
      requests: Number(totals?.requests ?? 0),
    },
  };
}
