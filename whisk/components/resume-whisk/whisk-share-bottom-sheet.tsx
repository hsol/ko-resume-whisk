"use client";

import { Loader2, Share2 } from "lucide-react";

import { AdsenseDisplayUnit } from "@/components/ads/adsense-display-unit";
import { Button } from "@/components/ui/button";

import { WhiskLayoutColumn } from "./whisk-layout-column";

export function WhiskShareBottomSheet({
  onShare,
  isBusy = false,
  disabled = false,
  translateAdSlot,
  translateAdMountKey = 0,
  showTranslateAd = false,
}: {
  onShare: () => void;
  isBusy?: boolean;
  disabled?: boolean;
  /** 번역 중·typed 출력 중에는 하단 공유 CTA 자리에 광고 슬롯 표시 */
  translateAdSlot?: string;
  translateAdMountKey?: number;
  showTranslateAd?: boolean;
}) {
  const showAd = Boolean(showTranslateAd && translateAdSlot);

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 shrink-0 rounded-t-2xl border-t border-border/70 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90"
      aria-label={showAd ? "스폰서" : "공유하기"}
    >
      <WhiskLayoutColumn>
        {showAd && translateAdSlot ? (
          <AdsenseDisplayUnit
            key={translateAdMountKey}
            adSlot={translateAdSlot}
            variant="footer-cta"
            minSkeletonMs={700}
          />
        ) : (
          <Button
            type="button"
            variant="default"
            className="h-12 w-full gap-2 rounded-xl px-6 text-base font-semibold shadow-sm"
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
        )}
      </WhiskLayoutColumn>
    </footer>
  );
}
