"use client";

import * as React from "react";

/**
 * 일일 번역 쿼터 (자동 공유 모드)
 *
 * 핵심 흐름:
 * - 무료 번역(오늘 첫 번역)은 백그라운드로 스냅샷을 자동 생성하고 그 공유
 *   URL을 localStorage에 함께 저장한다.
 * - 1회 사용 후 공유 버튼을 누르지 않은 사용자가 새 진입(새로고침/재방문)을
 *   하면, 저장된 공유 URL로 자동 리다이렉트되어 자기 결과를 보게 되고
 *   거기서 공유 버튼을 누르도록 유도된다.
 * - 락 해제 조건: (1) 공유 버튼 클릭, (2) 다음 날 자정.
 */

const STORAGE_KEY = "whisk:quota:v2";

type QuotaSnapshot = {
  /** YYYY-MM-DD 로컬 타임 */
  date: string;
  /** 오늘 무료 번역을 사용했는지 */
  translatedToday: boolean;
  /** 오늘 공유 버튼을 한 번이라도 눌렀는지 */
  sharedToday: boolean;
  /** 첫 번역 직후 백그라운드로 만든 스냅샷 공유 URL (앱 내부 경로+쿼리) */
  snapshotShareUrl: string | null;
};

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function freshSnapshot(): QuotaSnapshot {
  return {
    date: todayKey(),
    translatedToday: false,
    sharedToday: false,
    snapshotShareUrl: null,
  };
}

function isValidSnapshot(v: unknown): v is QuotaSnapshot {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.date === "string" &&
    typeof o.translatedToday === "boolean" &&
    typeof o.sharedToday === "boolean" &&
    (o.snapshotShareUrl === null || typeof o.snapshotShareUrl === "string")
  );
}

function readSnapshot(): QuotaSnapshot {
  if (typeof window === "undefined") return freshSnapshot();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshSnapshot();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidSnapshot(parsed)) return freshSnapshot();
    if (parsed.date !== todayKey()) return freshSnapshot();
    return parsed;
  } catch {
    return freshSnapshot();
  }
}

function writeSnapshot(s: QuotaSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* private 모드·quota 초과 등에서 실패 시 무시 */
  }
}

/** 같은 세션의 어디서든 최신 락 상태를 동기로 읽기 위한 헬퍼 */
export function readQuotaCanTranslate(): boolean {
  const s = readSnapshot();
  return !s.translatedToday || s.sharedToday;
}

/** 락 상태일 때 자동 리다이렉트할 URL (없으면 null) */
export function readQuotaRedirectUrl(): string | null {
  const s = readSnapshot();
  if (!s.translatedToday) return null;
  if (s.sharedToday) return null;
  return s.snapshotShareUrl;
}

/** 오늘 무료 번역을 이미 사용했는지 (동기 읽기) */
export function readQuotaTranslatedToday(): boolean {
  return readSnapshot().translatedToday;
}

export function useWhiskDailyQuota() {
  const [snapshot, setSnapshot] = React.useState<QuotaSnapshot>(freshSnapshot);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setSnapshot(readSnapshot());
    setHydrated(true);
  }, []);

  /** 다른 탭의 변경 동기화 */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setSnapshot(readSnapshot());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /** 자정 직후 자동 리셋 */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const now = new Date();
    const next = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      5,
    );
    const ms = Math.max(1000, next.getTime() - now.getTime());
    const t = window.setTimeout(() => {
      const fresh = freshSnapshot();
      writeSnapshot(fresh);
      setSnapshot(fresh);
    }, ms);
    return () => window.clearTimeout(t);
  }, [snapshot.date]);

  /**
   * 첫 번역 직후 호출. 백그라운드로 만든 스냅샷 URL과 함께 카운트를 올린다.
   * 두 번째 이후 번역에서는 호출하지 않음 (URL 덮어쓰기 방지).
   */
  const recordFirstTranslation = React.useCallback(
    (snapshotShareUrl: string) => {
      setSnapshot(() => {
        const today = todayKey();
        const next: QuotaSnapshot = {
          date: today,
          translatedToday: true,
          sharedToday: false,
          snapshotShareUrl,
        };
        writeSnapshot(next);
        return next;
      });
    },
    [],
  );

  /** 공유 버튼 성공 클릭 시 호출 → 락 해제 */
  const markShared = React.useCallback(() => {
    setSnapshot((prev) => {
      const today = todayKey();
      const base = prev.date === today ? prev : freshSnapshot();
      const next: QuotaSnapshot = { ...base, sharedToday: true };
      writeSnapshot(next);
      return next;
    });
  }, []);

  return {
    hydrated,
    translatedToday: snapshot.translatedToday,
    sharedToday: snapshot.sharedToday,
    snapshotShareUrl: snapshot.snapshotShareUrl,
    canTranslate: !snapshot.translatedToday || snapshot.sharedToday,
    recordFirstTranslation,
    markShared,
  };
}
