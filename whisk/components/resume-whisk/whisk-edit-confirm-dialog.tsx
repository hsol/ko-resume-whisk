"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";
import * as React from "react";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "수정하기" 버튼 클릭 시 호출 — 호출자가 onOpenChange(false)로 닫는다. */
  onConfirm: () => void;
};

/**
 * 원문 수정 시 번역 결과가 사라지는 점을 알리는 시스템 confirm 대체.
 * 브라우저 기본 confirm 대신 앱 스타일과 일치하는 모달로 보여준다.
 */
export function WhiskEditConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: Props) {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[100] bg-black/45" />
        <DialogContent
          className="fixed left-1/2 top-1/2 z-[101] w-[min(100%-1.5rem,24rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border/60 bg-white p-5 shadow-xl outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            cancelRef.current?.focus();
          }}
        >
          <DialogTitle className="text-base font-semibold text-foreground">
            원문을 수정할까요?
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            수정하면 지금 보이는 번역 결과가 사라집니다.
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              size="default"
              className="h-9 rounded-lg px-4 text-sm font-medium"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="default"
              size="default"
              className="h-9 rounded-lg px-4 text-sm font-semibold"
              onClick={onConfirm}
            >
              수정하기
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
