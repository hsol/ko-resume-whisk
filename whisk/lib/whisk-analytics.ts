"use client";

/**
 * 거품기 GA4 커스텀 이벤트 트래커.
 *
 * 사용자가 만나는 핵심 퍼널에 한 단계당 1개 이벤트가 발화되도록 잘게 쪼개,
 * GA4 Explore → Funnel exploration에서 단계별 전환·드롭오프를 분석할 수
 * 있게 한다. `window.gtag`가 비어 있을 때(=GA 비활성)는 사일런트.
 *
 * 파라미터는 의도적으로 좁고 카디널리티가 낮은 값만 (e.g. direction 2종,
 * method 2종) — GA4 dimension 제한·노이즈 최소화.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

function track(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    cleaned[k] = v;
  }
  try {
    window.gtag?.("event", name, cleaned);
  } catch {
    /* GA 미초기화·차단 환경에서는 무시 */
  }
}

export type WhiskDirection = "ko_resume" | "resume_ko";
export type WhiskShareMethod = "webshare" | "clipboard" | "webshare_dismiss";
export type WhiskQuotaLockTrigger = "translate" | "edit";
export type WhiskCopyArea = "input" | "output";

export const whiskAnalytics = {
  /** 번역 버튼 클릭 — 유효한 입력·방향까지 통과한 시점 */
  translateClick: (direction: WhiskDirection) =>
    track("whisk_translate_click", { direction }),

  /** 번역 응답 성공 (typed 출력 시작 직전) */
  translateSuccess: (direction: WhiskDirection, durationMs: number) =>
    track("whisk_translate_success", {
      direction,
      duration_ms: Math.round(durationMs),
    }),

  /** 번역 응답 실패 — 네트워크·서버 에러·잘못된 응답 모두 포함 */
  translateError: (direction: WhiskDirection, reason: string) =>
    track("whisk_translate_error", { direction, reason }),

  /** typed.js 출력 완료 — 사용자가 결과를 다 본 시점 */
  translateTypedComplete: (direction: WhiskDirection) =>
    track("whisk_typed_complete", { direction }),

  /** 공유 버튼 클릭 — handleShare 진입 */
  shareClick: () => track("whisk_share_click"),

  /** 공유 완료 — webshare 채택 / 클립보드 폴백 분기 기록 */
  shareSuccess: (method: WhiskShareMethod) =>
    track("whisk_share_success", { method }),

  /** 공유 실패 — 스냅샷 API 실패·복사 실패 등 */
  shareError: (reason: string) => track("whisk_share_error", { reason }),

  /** 결과·원문 복사 버튼 클릭 */
  copyResult: (area: WhiskCopyArea) => track("whisk_copy_result", { area }),

  /** 방향 전환 (자소서 ↔ 한국어) */
  directionSwap: (from: string, to: string) =>
    track("whisk_direction_swap", { from, to }),

  /** 일일 쿼터 첫 번역 — 락 진입점 (이 시점부터 추가 번역 잠금) */
  quotaFirstUse: () => track("whisk_quota_first_use"),

  /** 락 다이얼로그 노출 — translate/edit 어느 트리거인지 */
  quotaLockShown: (trigger: WhiskQuotaLockTrigger) =>
    track("whisk_quota_lock_shown", { trigger }),

  /** 락 상태에서 자동 리다이렉트 발생 (새로고침/재방문 케이스) */
  quotaRedirect: () => track("whisk_quota_redirect"),

  /** 원문 수정 컨펌 다이얼로그 노출 */
  editConfirmShown: () => track("whisk_edit_confirm_shown"),

  /** 원문 수정 컨펌 — "수정하기" 클릭 */
  editConfirmAccept: () => track("whisk_edit_confirm_accept"),

  /** 공유 링크(스냅샷)로 진입한 사용자 — utm_source=share 감지 시점 */
  snapshotEntry: () => track("whisk_snapshot_entry"),
};
