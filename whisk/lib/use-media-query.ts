"use client";

import * as React from "react";

/** `window.matchMedia(query)` — 클라이언트 첫 스냅샷 반영, SSR은 `getServerSnapshot` */
export function useMediaQuery(
  query: string,
  serverSnapshot = false,
): boolean {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = React.useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  const getServerSnapshot = React.useCallback(
    () => serverSnapshot,
    [serverSnapshot],
  );

  return React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
}
