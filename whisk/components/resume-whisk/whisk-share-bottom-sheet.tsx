"use client";

import * as React from "react";
import { Loader2, Share2 } from "lucide-react";

import { CoupangPartnersCtaUnit } from "@/components/ads/coupang-partners-cta-unit";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { WHISK_SHARE_NUDGE_LABELS } from "@/lib/whisk-share-nudges";

import { WhiskLayoutColumn } from "./whisk-layout-column";

/** 다음 라벨로 넘어가는 주기 (페이드아웃 시작부터 다음 페이드아웃까지) */
const NUDGE_CYCLE_MS = 3000;
/** 페이드아웃·페이드인 각각의 전환 시간 */
const NUDGE_FADE_MS = 280;

export function WhiskShareBottomSheet({
  onShare,
  isBusy = false,
  disabled = false,
  translateAdMountKey = 0,
  showTranslateAd = false,
}: {
  onShare: () => void;
  isBusy?: boolean;
  disabled?: boolean;
  /** 번역 중·typed 출력 중에는 하단 공유 CTA 자리에 쿠팡 파트너스 배너 */
  translateAdMountKey?: number;
  showTranslateAd?: boolean;
}) {
  const showAd = showTranslateAd;
  const isMobile = useMediaQuery("(max-width: 639px)");
  const showMobileTranslateAd = showAd && isMobile;

  const showingNudge = !isBusy && !disabled;

  /**
   * 활성 상태일 때만 2초 간격으로 다음 카피로 페이드 전환. 초기 인덱스는
   * 매 마운트마다 무작위로 잡아 사용자가 항상 1번 카피부터 보지 않게 한다.
   */
  const [nudgeIndex, setNudgeIndex] = React.useState(() =>
    Math.floor(Math.random() * WHISK_SHARE_NUDGE_LABELS.length),
  );
  const [nudgeOpaque, setNudgeOpaque] = React.useState(true);

  React.useEffect(() => {
    if (!showingNudge) return;
    let swapTimer: number | null = null;
    const cycle = window.setInterval(() => {
      setNudgeOpaque(false);
      swapTimer = window.setTimeout(() => {
        setNudgeIndex(
          (prev) => (prev + 1) % WHISK_SHARE_NUDGE_LABELS.length,
        );
        setNudgeOpaque(true);
        swapTimer = null;
      }, NUDGE_FADE_MS);
    }, NUDGE_CYCLE_MS);

    return () => {
      window.clearInterval(cycle);
      if (swapTimer !== null) {
        window.clearTimeout(swapTimer);
        // 페이드아웃 중 일시정지가 걸리면 다음 활성화 시 라벨이 안 보일 수
        // 있어 보이는 상태로 되돌려둔다.
        setNudgeOpaque(true);
      }
    };
  }, [showingNudge]);

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 shrink-0 rounded-t-2xl border-t border-border/70 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90"
      aria-label={showMobileTranslateAd ? "스폰서" : "공유하기"}
    >
      <WhiskLayoutColumn>
        {showMobileTranslateAd ? (
          <CoupangPartnersCtaUnit
            key={translateAdMountKey}
            mountKey={translateAdMountKey}
            minSkeletonMs={700}
          />
        ) : null}
        <Button
          type="button"
          variant="default"
          className={cn(
            // 텍스트 길이가 바뀌어도 아이콘이 좌측에 고정되도록 grid 3열로 강제
            // 구성: [아이콘 | 중앙 텍스트 | 아이콘 폭 더미]
            "!grid h-12 w-full grid-cols-[1.25rem_1fr_1.25rem] items-center gap-2 rounded-xl px-6 text-base font-semibold shadow-sm",
            showMobileTranslateAd && "hidden",
          )}
          onClick={onShare}
          disabled={disabled || isBusy}
          aria-busy={isBusy}
        >
          {isBusy ? (
            <Loader2
              className="size-5 shrink-0 animate-spin"
              strokeWidth={2}
              aria-hidden
            />
          ) : (
            <Share2 className="size-5 shrink-0" strokeWidth={2} aria-hidden />
          )}
          {isBusy ? (
            <span className="text-center">링크 준비 중…</span>
          ) : disabled ? (
            <span className="text-center">공유하기</span>
          ) : (
            <span
              className={cn(
                "text-center transition-opacity ease-in-out",
                nudgeOpaque ? "opacity-100" : "opacity-0",
              )}
              style={{ transitionDuration: `${NUDGE_FADE_MS}ms` }}
              aria-live="polite"
            >
              {WHISK_SHARE_NUDGE_LABELS[nudgeIndex]}
            </span>
          )}
          <span aria-hidden />
        </Button>
      </WhiskLayoutColumn>
    </footer>
  );
}
