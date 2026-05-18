"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export const COPY_EDIT_TOOLTIP =
  "탭해서 수정할 수 있어요. 다른 곳을 누르면 저장돼요.";

type Variant = "primary" | "secondary";

const variantClass: Record<Variant, string> = {
  primary:
    "max-w-[95%] text-balance text-[clamp(1.35rem,2.75svh+0.85rem,3.75rem)] font-bold tracking-tight text-[#1a1f2c] sm:max-w-none md:text-[clamp(1.5rem,2.5svh+1rem,4.5rem)] lg:text-[clamp(1.75rem,2.25svh+1.1rem,4.5rem)]",
  secondary:
    "mt-2 max-w-[95%] text-balance text-[clamp(0.9rem,1.35svh+0.65rem,1.75rem)] leading-snug text-muted-foreground sm:mt-2.5 md:mt-3 md:text-[clamp(1rem,1.2svh+0.7rem,1.875rem)] lg:text-[clamp(1.05rem,1.1svh+0.75rem,1.875rem)]",
};

type Props = {
  variant: Variant;
  value: string;
  editable: boolean;
  maxLength: number;
  onCommit: (next: string) => void;
  onEditInteraction?: () => void;
};

function normalizeText(raw: string, maxLength: number): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function insertPlainTextAtSelection(text: string) {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  sel.deleteFromDocument();
  sel.getRangeAt(0).insertNode(document.createTextNode(text));
  sel.collapseToEnd();
}

export function WhiskEditableTagline({
  variant,
  value,
  editable,
  maxLength,
  onCommit,
  onEditInteraction,
}: Props) {
  const ref = React.useRef<HTMLHeadingElement | HTMLParagraphElement>(null);
  const committedRef = React.useRef(value);

  React.useLayoutEffect(() => {
    committedRef.current = value;
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.textContent !== value) {
      el.textContent = value;
    }
  }, [value, editable]);

  const commitFromDom = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    let next = normalizeText(el.textContent ?? "", maxLength);
    if (!next) {
      next = committedRef.current;
    }
    if (el.textContent !== next) {
      el.textContent = next;
    }
    if (next !== committedRef.current) {
      committedRef.current = next;
      onCommit(next);
    }
  }, [maxLength, onCommit]);

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent) => {
      if (!editable) return;
      e.preventDefault();
      const pasted = e.clipboardData.getData("text/plain").replace(/\r?\n/g, " ");
      insertPlainTextAtSelection(pasted);
    },
    [editable],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!editable) return;
      if (e.key === "Enter") {
        e.preventDefault();
        ref.current?.blur();
      }
    },
    [editable],
  );

  const shared = {
    contentEditable: editable,
    suppressContentEditableWarning: true as const,
    title: editable ? COPY_EDIT_TOOLTIP : undefined,
    onFocus: editable ? onEditInteraction : undefined,
    onBlur: editable ? commitFromDom : undefined,
    onPaste: handlePaste,
    onKeyDown: handleKeyDown,
    className: cn(
      variantClass[variant],
      editable &&
        "cursor-text rounded-md outline-none ring-offset-2 transition-shadow focus-visible:ring-2 focus-visible:ring-ring/40",
    ),
    role: editable ? ("textbox" as const) : undefined,
    "aria-label": editable
      ? variant === "primary"
        ? "공유 제목 편집"
        : "공유 설명 편집"
      : undefined,
    children: editable ? null : value,
  };

  if (variant === "primary") {
    return <h1 ref={ref} {...shared} />;
  }
  return <p ref={ref} {...shared} />;
}
