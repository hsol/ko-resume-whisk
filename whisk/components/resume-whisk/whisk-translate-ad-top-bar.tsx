"use client";

import { CoupangPartnersTopUnit } from "@/components/ads/coupang-partners-top-unit";
import { useMediaQuery } from "@/lib/use-media-query";

import { WhiskLayoutColumn } from "./whisk-layout-column";

/** 태블릿 이상(`sm+`) 레이아웃 상단 배너 (680×100) — 문서 흐름, 비 fixed */
export function WhiskTranslateAdTopBar({
  mountKey = 0,
}: {
  mountKey?: number;
}) {
  const isTabletUp = useMediaQuery("(min-width: 640px)");

  if (!isTabletUp) {
    return null;
  }

  return (
    <header
      className="shrink-0 border-b border-border/60 bg-[#f9f9f9] pb-2 pt-1"
      aria-label="스폰서"
    >
      <WhiskLayoutColumn>
        <CoupangPartnersTopUnit mountKey={mountKey} minSkeletonMs={700} />
      </WhiskLayoutColumn>
    </header>
  );
}
