"use client";

import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** 클라이언트 라우팅마다 GA4 `page_path` 갱신(`useSearchParams` 때문에 Suspense로 감쌀 것) */
function GaRoutePathInner({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const qs = searchParams?.toString();
    const pagePath = qs ? `${pathname}?${qs}` : pathname;
    window.gtag?.("config", gaId, { page_path: pagePath });
  }, [pathname, searchParams, gaId]);

  return null;
}

export function GaRoutePath({ gaId }: { gaId: string }) {
  return (
    <React.Suspense fallback={null}>
      <GaRoutePathInner gaId={gaId} />
    </React.Suspense>
  );
}
