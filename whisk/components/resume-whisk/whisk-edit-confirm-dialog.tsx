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

export type WhiskEditConfirmVariant = "edit" | "locked";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * - `"edit"`: 일반적인 "원문 수정시 결과 사라짐" 컨펌
   * - `"locked"`: 오늘 무료 번역 1회를 다 써서 추가 번역이 잠긴 상태.
   *   수정 동작은 막고 공유 안내만 노출.
   */
  variant: WhiskEditConfirmVariant;
  /** `"edit"` 변종에서 "수정하기" 버튼 클릭 시 호출 */
  onConfirm: () => void;
};

/**
 * 원문 수정·번역 잠금 안내 모달. 브라우저 기본 confirm 대신 앱 스타일과
 * 일치하는 Radix Dialog로 노출.
 */
export function WhiskEditConfirmDialog({
  open,
  onOpenChange,
  variant,
  onConfirm,
}: Props) {
  const primaryRef = React.useRef<HTMLButtonElement | null>(null);

  const isLocked = variant === "locked";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[100] bg-black/45" />
        <DialogContent
          className="fixed left-1/2 top-1/2 z-[101] w-[min(100%-1.5rem,24rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border/60 bg-white p-5 shadow-xl outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            primaryRef.current?.focus();
          }}
        >
          {isLocked ? (
            <>
              <DialogTitle className="text-base font-semibold text-foreground">
                오늘 무료 번역을 다 썼어요
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                추가 번역은 하루 1회 이상 공유한 뒤 가능해져요.
                <br />
                화면{" "}
                <span className="font-medium text-foreground">하단 공유 버튼</span>
                을 눌러 공유해주세요.
              </DialogDescription>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
                · 매일 자정에 무료 번역 횟수가 다시 1회로 초기화돼요.
              </p>
              <div className="mt-5 flex justify-end">
                <Button
                  ref={primaryRef}
                  type="button"
                  variant="default"
                  size="default"
                  className="h-9 rounded-lg px-4 text-sm font-semibold"
                  onClick={() => onOpenChange(false)}
                >
                  알겠어요
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogTitle className="text-base font-semibold text-foreground">
                원문을 수정할까요?
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                수정하면 지금 보이는 번역 결과가 사라집니다.
              </DialogDescription>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  ref={primaryRef}
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
            </>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
