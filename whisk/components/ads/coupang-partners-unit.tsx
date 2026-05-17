"use client";

import * as React from "react";

import { AdsenseSkeleton } from "@/components/ads/adsense-skeleton";
import type { CoupangPartnersWidgetConfig } from "@/lib/coupang-partners-config";
import { schedulePartnersWidgetRelocate } from "@/lib/coupang-partners-relocate";
import { ensureCoupangPartnersScript } from "@/lib/coupang-partners-script";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    PartnersCoupang?: {
      G: (config: Record<string, string | number>) => void;
    };
  }
}

type Props = {
  widget: CoupangPartnersWidgetConfig;
  className?: string;
  hostClassName?: string;
  mountKey?: number;
  minSkeletonMs?: number;
  skeletonCompact?: boolean;
  showDisclosure?: boolean;
  /** 호스트 너비(px)로 width 문자열 결정. 없으면 widget.width 사용 */
  resolveWidth?: (hostWidth: number) => string;
};

/**
 * 쿠팡 파트너스 `PartnersCoupang.G` 위젯 마운트.
 * `g.js`는 전역 1회 로드, 위젯은 host 컨테이너 안에서 초기화.
 */
export function CoupangPartnersUnit({
  widget,
  className,
  hostClassName,
  mountKey = 0,
  minSkeletonMs = 700,
  skeletonCompact = false,
  showDisclosure = false,
  resolveWidth,
}: Props) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const resolveWidthRef = React.useRef(resolveWidth);
  resolveWidthRef.current = resolveWidth;
  const [showSkeleton, setShowSkeleton] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let stopRelocate: (() => void) | null = null;
    setLoadFailed(false);
    setShowSkeleton(true);
    const minUntil = Date.now() + minSkeletonMs;

    const hideSkeleton = () => {
      const delay = Math.max(0, minUntil - Date.now());
      window.setTimeout(() => {
        if (!cancelled) setShowSkeleton(false);
      }, delay);
    };

    const mountWidget = () => {
      const el = hostRef.current;
      if (!el) return;

      el.replaceChildren();
      const resolve = resolveWidthRef.current;
      const width = resolve
        ? resolve(el.clientWidth)
        : widget.width;
      const config = {
        id: widget.id,
        template: widget.template,
        trackingCode: widget.trackingCode,
        width,
        height: widget.height,
        tsource: widget.tsource,
      };

      const runner = document.createElement("script");
      runner.dataset.coupangRunner = "1";
      runner.text = `new PartnersCoupang.G(${JSON.stringify(config)});`;
      el.appendChild(runner);
    };

    const scheduleMount = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          mountWidget();
          const mountedHost = hostRef.current;
          if (mountedHost) {
            stopRelocate?.();
            stopRelocate = schedulePartnersWidgetRelocate(
              mountedHost,
              widget.id,
            );
          }
        });
      });
    };

    void (async () => {
      try {
        await ensureCoupangPartnersScript();
        if (cancelled || !hostRef.current) {
          hideSkeleton();
          return;
        }
        if (!window.PartnersCoupang?.G) {
          throw new Error("PartnersCoupang.G unavailable");
        }
        scheduleMount();
      } catch {
        if (!cancelled) setLoadFailed(true);
      } finally {
        hideSkeleton();
      }
    })();

    const failSafe = window.setTimeout(() => {
      if (!cancelled) setShowSkeleton(false);
    }, 12_000);

    return () => {
      cancelled = true;
      stopRelocate?.();
      window.clearTimeout(failSafe);
      host.replaceChildren();
    };
  }, [mountKey, minSkeletonMs, widget.id, widget.width, widget.height]);

  return (
    <div className={cn("relative w-full", className)}>
      <div ref={hostRef} className={hostClassName} />
      {(showSkeleton || loadFailed) && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center bg-white/95 p-2 supports-[backdrop-filter]:bg-white/90",
            skeletonCompact && "p-1.5",
            !showSkeleton && loadFailed && "bg-transparent",
          )}
        >
          <AdsenseSkeleton
            compact={skeletonCompact}
            className={cn(
              "max-h-full border-0 bg-muted/20",
              skeletonCompact
                ? "min-h-0 h-full w-full rounded-lg p-2"
                : "min-h-[200px] w-full",
            )}
          />
        </div>
      )}
      {showDisclosure ? (
        <p className="mt-1 text-center text-[9px] leading-tight text-muted-foreground/80">
          이 링크는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를
          제공받습니다.
        </p>
      ) : null}
    </div>
  );
}
