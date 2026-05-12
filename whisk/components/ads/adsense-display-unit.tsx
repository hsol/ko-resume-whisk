"use client";

import * as React from "react";

import { AdsenseSkeleton } from "@/components/ads/adsense-skeleton";
import { ADSENSE_CLIENT } from "@/lib/adsense-config";
import { ensureAdsenseScript } from "@/lib/adsense-script";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  adSlot: string;
  className?: string;
  /** 스켈레톤을 최소 이 시간(ms)은 보여 CLS·깜빡임 완화 */
  minSkeletonMs?: number;
};

/**
 * 자동 광고 `ins.adsbygoogle` + `(adsbygoogle = window.adsbygoogle || []).push({})`
 * 스크립트는 전역 1회만 로드합니다.
 */
export function AdsenseDisplayUnit({
  adSlot,
  className,
  minSkeletonMs = 900,
}: Props) {
  const insRef = React.useRef<HTMLModElement>(null);
  const pushedRef = React.useRef(false);
  const [showSkeleton, setShowSkeleton] = React.useState(true);
  const [scriptFailed, setScriptFailed] = React.useState(false);

  React.useEffect(() => {
    const ins = insRef.current;
    if (!ins || pushedRef.current) return;

    let cancelled = false;
    const minUntil = Date.now() + minSkeletonMs;

    const hideSkeleton = () => {
      const delay = Math.max(0, minUntil - Date.now());
      window.setTimeout(() => {
        if (!cancelled) setShowSkeleton(false);
      }, delay);
    };

    void (async () => {
      try {
        await ensureAdsenseScript();
        if (cancelled || !insRef.current || pushedRef.current) {
          hideSkeleton();
          return;
        }
        pushedRef.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        setScriptFailed(true);
      } finally {
        hideSkeleton();
      }
    })();

    const failSafe = window.setTimeout(() => {
      if (!cancelled) setShowSkeleton(false);
    }, 12_000);

    return () => {
      cancelled = true;
      window.clearTimeout(failSafe);
    };
  }, [adSlot, minSkeletonMs]);

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-2xl min-h-[120px] overflow-hidden",
        className,
      )}
    >
      {(showSkeleton || scriptFailed) && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center bg-[#f9f9f9]/90 p-2",
            !showSkeleton && scriptFailed && "bg-transparent",
          )}
        >
          <AdsenseSkeleton className="max-h-full border-0 bg-muted/20" />
        </div>
      )}
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
