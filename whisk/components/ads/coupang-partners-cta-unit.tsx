"use client";

import { CoupangPartnersUnit } from "@/components/ads/coupang-partners-unit";
import { COUPANG_TRANSLATE_CTA_WIDGET } from "@/lib/coupang-partners-config";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  mountKey?: number;
  minSkeletonMs?: number;
};

/** 하단 CTA 자리 쿠팡 파트너스 캐러셀 (360×80) */
export function CoupangPartnersCtaUnit({
  className,
  mountKey = 0,
  minSkeletonMs = 700,
}: Props) {
  return (
    <CoupangPartnersUnit
      widget={COUPANG_TRANSLATE_CTA_WIDGET}
      className={cn("min-h-[80px] w-full", className)}
      mountKey={mountKey}
      minSkeletonMs={minSkeletonMs}
      skeletonCompact
      showDisclosure
      hostClassName="mx-auto flex h-[80px] w-full max-w-[360px] min-w-0 items-center justify-center overflow-visible"
    />
  );
}
