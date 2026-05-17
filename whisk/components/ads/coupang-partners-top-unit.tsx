"use client";

import { CoupangPartnersUnit } from "@/components/ads/coupang-partners-unit";
import { COUPANG_TOP_BANNER_WIDGET } from "@/lib/coupang-partners-config";
import { cn } from "@/lib/utils";

const TOP_BANNER_MAX_WIDTH = 680;

type Props = {
  className?: string;
  mountKey?: number;
  minSkeletonMs?: number;
};

/** 태블릿 이상 상단 쿠팡 파트너스 캐러셀 (680×100) */
export function CoupangPartnersTopUnit({
  className,
  mountKey = 0,
  minSkeletonMs = 700,
}: Props) {
  return (
    <CoupangPartnersUnit
      widget={COUPANG_TOP_BANNER_WIDGET}
      className={cn("min-h-[100px] w-full", className)}
      mountKey={mountKey}
      minSkeletonMs={minSkeletonMs}
      skeletonCompact
      showDisclosure
      resolveWidth={(hostWidth) =>
        String(Math.min(TOP_BANNER_MAX_WIDTH, Math.max(1, Math.round(hostWidth))))
      }
      hostClassName="relative mx-auto flex h-[100px] w-full max-w-[680px] min-w-0 items-center justify-center overflow-hidden"
    />
  );
}
