"use client";

import Typed from "typed.js";
import * as React from "react";

import { WHISK_WAITING_PRESET_STRINGS } from "@/lib/whisk-waiting-presets";

import {
  whiskTranslatorOutputInnerClass,
  whiskTranslatorOutputShellClass,
} from "./whisk-typed-translator-output";

type Props = {
  /** 번역 요청이 진행 중일 때만 true — false가 되면 Typed 인스턴스를 destroy 합니다. */
  active: boolean;
};

/** API 응답 대기 중 after 영역에 프리셋 문장을 타이핑 후 지우며 순회합니다. */
export function WhiskWaitingPresetTyped({ active }: Props) {
  const elRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!active) return;
    const el = elRef.current;
    if (!el) return;

    el.innerHTML = "";

    const typed = new Typed(el, {
      strings: [...WHISK_WAITING_PRESET_STRINGS],
      typeSpeed: 26,
      backSpeed: 18,
      backDelay: 520,
      startDelay: 100,
      loop: true,
      smartBackspace: false,
      showCursor: true,
      cursorChar: "▍",
    });

    return () => {
      typed.destroy();
    };
  }, [active]);

  return (
    <div className={whiskTranslatorOutputShellClass} aria-hidden="true">
      <span ref={elRef} className={whiskTranslatorOutputInnerClass} />
    </div>
  );
}
