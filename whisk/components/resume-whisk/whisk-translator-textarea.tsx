import * as React from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** 입력·출력 textarea와 typed.js 셸이 동일한 글자 크기·행간을 쓰도록 공유합니다. (`Textarea` 기본 `md:text-sm` 덮어씀) */
export const whiskTranslatorFieldTypographyClass =
  "text-base leading-snug text-[#1a1f2c] sm:text-[15px] md:text-[15px] md:leading-relaxed";

export const whiskTranslatorFieldHeightClass =
  "h-[calc(1.375em*5+1rem)] max-h-[calc(1.375em*5+1rem)]";

export function WhiskTranslatorTextarea({
  className,
  shortOnMobile = false,
  ...props
}: Omit<React.ComponentProps<typeof Textarea>, "rows"> & {
  /** `<sm`에서 시각적 높이를 3줄로 줄임(모바일 세로 절약) */
  shortOnMobile?: boolean;
}) {
  return (
    <Textarea
      rows={5}
      className={cn(
        "field-sizing-fixed block !min-h-0 w-full shrink-0 resize-none overflow-y-auto border-0 bg-transparent px-0 py-2 shadow-none focus-visible:ring-0",
        whiskTranslatorFieldTypographyClass,
        shortOnMobile
          ? "h-[calc(1.375em*3+1rem)] max-h-[calc(1.375em*3+1rem)] sm:h-[calc(1.375em*5+1rem)] sm:max-h-[calc(1.375em*5+1rem)]"
          : whiskTranslatorFieldHeightClass,
        className,
      )}
      {...props}
    />
  );
}
