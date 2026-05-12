"use client";

import Typed from "typed.js";
import * as React from "react";

/** 스크롤·고정 높이 박스. typed.js 커서는 `el`의 다음 형제로 삽입되므로, 타이핑 타깃은 반드시 이 안의 `span`이어야 합니다. */
export const whiskTranslatorOutputShellClass =
  "whisk-typed-output-shell field-sizing-fixed block !min-h-0 min-w-0 h-[calc(1.375em*5+1rem)] max-h-[calc(1.375em*5+1rem)] w-full shrink-0 overflow-y-auto border-0 bg-transparent px-0 py-2 text-left shadow-none";

/** typed.js가 내용을 채우는 노드 — `inline`으로 두어 커서 `span`이 같은 줄 흐름 끝에 붙습니다. */
export const whiskTranslatorOutputInnerClass =
  "inline min-w-0 max-w-full whitespace-pre-wrap break-words text-base leading-snug text-[#1a1f2c] sm:text-[15px] md:leading-relaxed [vertical-align:baseline]";

type Props = {
  text: string;
  onComplete: (finalText: string) => void;
};

/** 번역 API 결과를 typed.js로 한 글자씩 표시한 뒤 `onComplete`로 넘깁니다. */
export function WhiskTypedTranslatorOutput({ text, onComplete }: Props) {
  const elRef = React.useRef<HTMLSpanElement>(null);
  const onCompleteRef = React.useRef(onComplete);

  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  React.useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    el.innerHTML = "";

    const typed = new Typed(el, {
      strings: [text],
      typeSpeed: 16,
      startDelay: 72,
      showCursor: true,
      cursorChar: "▍",
      smartBackspace: false,
      loop: false,
      onComplete: () => {
        onCompleteRef.current(text);
      },
    });
    return () => {
      typed.destroy();
    };
  }, [text]);

  return (
    <div
      className={whiskTranslatorOutputShellClass}
      aria-live="polite"
      aria-busy="true"
      aria-label="번역 결과"
    >
      <span ref={elRef} className={whiskTranslatorOutputInnerClass} />
    </div>
  );
}
