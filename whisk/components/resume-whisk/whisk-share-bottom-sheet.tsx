"use client";

import { Loader2, Share2 } from "lucide-react";

import { CoupangPartnersCtaUnit } from "@/components/ads/coupang-partners-cta-unit";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

import { WhiskLayoutColumn } from "./whisk-layout-column";

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
            "h-12 w-full gap-2 rounded-xl px-6 text-base font-semibold shadow-sm",
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
          {isBusy ? "링크 준비 중…" : "공유하기"}
        </Button>
      </WhiskLayoutColumn>
    </footer>
  );
}
