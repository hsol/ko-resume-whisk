"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { CoupangPartnersUnit } from "@/components/ads/coupang-partners-unit";
import { COUPANG_SHARE_DIALOG_WIDGET } from "@/lib/coupang-partners-config";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 스냅샷 저장·웹 공유·복사 등 비동기 작업 진행 중 */
  isBusy: boolean;
  /** 공유 시도마다 증가시켜 광고 슬롯을 새로 마운트(재 push) */
  mountKey: number;
  /** 스냅샷 URL (준비 완료 후 복사용) */
  preparedShareUrl: string | null;
  onCopyPreparedUrl: () => void;
};

export function WhiskShareAdDialog({
  open,
  onOpenChange,
  isBusy,
  mountKey,
  preparedShareUrl,
  onCopyPreparedUrl,
}: Props) {
  const showCopyLink =
    !isBusy && Boolean(preparedShareUrl?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[100] bg-black/45" />
        <DialogContent className="fixed left-1/2 top-1/2 z-[101] w-[min(100%-1.5rem,28rem)] max-h-[min(90dvh,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border/60 bg-white p-4 pt-12 shadow-xl outline-none">
          <DialogClose asChild>
            <button
              type="button"
              className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="닫기"
            >
              <X className="size-5" strokeWidth={2} aria-hidden />
            </button>
          </DialogClose>
          <DialogTitle className="sr-only">
            {isBusy ? "공유 링크 준비 중" : "공유 링크 준비됨"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isBusy
              ? "스냅샷을 저장하는 동안 표시됩니다. 준비가 끝나도 창은 자동으로 닫히지 않으며, 닫기·배경·Esc로 닫을 수 있습니다."
              : "닫기 버튼, 바깥 영역, Esc 키로 이 창을 닫을 수 있습니다. URL 복사로 스냅샷 링크를 클립보드에 넣을 수 있습니다."}
          </DialogDescription>
          {open ? (
            <CoupangPartnersUnit
              key={mountKey}
              mountKey={mountKey}
              widget={COUPANG_SHARE_DIALOG_WIDGET}
              minSkeletonMs={600}
              showDisclosure
              hostClassName="mx-auto flex w-full max-w-[360px] min-h-[390px] items-center justify-center overflow-hidden"
            />
          ) : null}
          {showCopyLink ? (
            <div className="mb-3 flex justify-center">
              <button
                type="button"
                className="text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary/90 hover:decoration-primary"
                onClick={onCopyPreparedUrl}
              >
                URL 복사하여 공유하기
              </button>
            </div>
          ) : null}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
