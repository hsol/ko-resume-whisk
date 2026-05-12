import { NextResponse } from "next/server";

import { getClientIp } from "@/lib/client-ip";
import { getSql } from "@/lib/db";

type Sql = ReturnType<typeof getSql>;

/** 동일 IP에서 연속 호출 사이 최소 간격(초) */
export const API_IP_COOLDOWN_SECONDS = 5;

const COOLDOWN_MS = API_IP_COOLDOWN_SECONDS * 1000;

let ensuredTable: Promise<void> | undefined;

function ensureCooldownTable(sql: Sql): Promise<void> {
  if (!ensuredTable) {
    ensuredTable = sql`
      CREATE TABLE IF NOT EXISTS api_ip_request_cooldown (
        ip text PRIMARY KEY,
        last_allowed_at timestamptz NOT NULL
      )
    `.then(() => undefined);
  }
  return ensuredTable;
}

/**
 * IP당 쿨다운을 통과하면 `null`, 아니면 429 `NextResponse`를 돌려 그대로 `return`하면 됩니다.
 * DB가 없으면 프로세스 로컬 Map으로만 제한(서버리스 다중 인스턴스에서는 약함).
 */
export async function enforceApiIpCooldown(
  request: Request,
): Promise<NextResponse | null> {
  const ip = getClientIp(request) ?? "__unknown__";

  try {
    const sql = getSql();
    await ensureCooldownTable(sql);
    const sec = API_IP_COOLDOWN_SECONDS;
    const rows = await sql`
      INSERT INTO api_ip_request_cooldown (ip, last_allowed_at)
      VALUES (${ip}, now())
      ON CONFLICT (ip) DO UPDATE
        SET last_allowed_at = excluded.last_allowed_at
        WHERE api_ip_request_cooldown.last_allowed_at <= now() - (${sec} * interval '1 second')
      RETURNING last_allowed_at
    `;
    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
      return cooldown429Response();
    }
    return null;
  } catch {
    return enforceMemoryCooldown(ip);
  }
}

const memLast = new Map<string, number>();

function enforceMemoryCooldown(ip: string): NextResponse | null {
  const now = Date.now();
  const last = memLast.get(ip) ?? 0;
  if (now - last < COOLDOWN_MS) {
    return cooldown429Response();
  }
  memLast.set(ip, now);
  return null;
}

function cooldown429Response(): NextResponse {
  return NextResponse.json(
    { error: "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요." },
    {
      status: 429,
      headers: { "Retry-After": String(API_IP_COOLDOWN_SECONDS) },
    },
  );
}
