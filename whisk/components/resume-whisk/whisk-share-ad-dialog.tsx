"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";

import { AdsenseDisplayUnit } from "@/components/ads/adsense-display-unit";
import { ADSENSE_SLOT_SHARE } from "@/lib/adsense-config";

type Props = {
  open: boolean;
  /** 공유 시도마다 증가시켜 광고 슬롯을 새로 마운트(재 push) */
  mountKey: number;
};

export function WhiskShareAdDialog({ open, mountKey }: Props) {
  return (
    <Dialog open={open} modal>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[100] bg-black/45" />
        <DialogContent
          className="fixed left-1/2 top-1/2 z-[101] w-[min(100%-1.5rem,28rem)] max-h-[min(90dvh,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border/60 bg-white p-4 shadow-xl outline-none"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">공유 링크 준비 중</DialogTitle>
          <DialogDescription className="sr-only">
            스냅샷 링크를 만드는 동안 표시됩니다.
          </DialogDescription>
          <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
            링크 준비 중…
          </p>
          {open ? (
            <AdsenseDisplayUnit
              key={mountKey}
              adSlot={ADSENSE_SLOT_SHARE}
              minSkeletonMs={600}
            />
          ) : null}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
