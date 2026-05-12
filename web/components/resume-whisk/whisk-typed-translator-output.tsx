"use client";

import Typed from "typed.js";
import * as React from "react";

const boxClass =
  "field-sizing-fixed block !min-h-0 h-[calc(1.375em*5+1rem)] max-h-[calc(1.375em*5+1rem)] w-full shrink-0 overflow-y-auto border-0 bg-transparent px-0 py-2 text-left text-base leading-snug text-[#1a1f2c] shadow-none sm:text-[15px] md:leading-relaxed whitespace-pre-wrap break-words";

type Props = {
  text: string;
  onComplete: (finalText: string) => void;
};

/** 번역 API 결과를 typed.js로 한 글자씩 표시한 뒤 `onComplete`로 넘깁니다. */
export function WhiskTypedTranslatorOutput({ text, onComplete }: Props) {
  const elRef = React.useRef<HTMLDivElement>(null);
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
      ref={elRef}
      className={boxClass}
      aria-live="polite"
      aria-busy="true"
      aria-label="번역 결과"
    />
  );
}
