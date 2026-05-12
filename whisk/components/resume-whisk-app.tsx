"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  Copy,
  Loader2,
  Share2,
} from "lucide-react";

import { WhiskCopyToast } from "@/components/resume-whisk/whisk-copy-toast";
import { WhiskLayoutColumn } from "@/components/resume-whisk/whisk-layout-column";
import { WhiskShareAdDialog } from "@/components/resume-whisk/whisk-share-ad-dialog";
import { WhiskShareBottomSheet } from "@/components/resume-whisk/whisk-share-bottom-sheet";
import { WhiskToolbarButton } from "@/components/resume-whisk/whisk-toolbar-button";
import { WhiskTranslatorTextarea } from "@/components/resume-whisk/whisk-translator-textarea";
import { WhiskTypedTranslatorOutput } from "@/components/resume-whisk/whisk-typed-translator-output";
import { WhiskWaitingPresetTyped } from "@/components/resume-whisk/whisk-waiting-preset-typed";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/resume-whisk-clipboard";
import { objectParticleEulReul } from "@/lib/hangul-particle";
import {
  WHISK_INPUT_MAX_CHARS,
  clampWhiskInput,
} from "@/lib/resume-whisk-input-limits";
import { isUuidV4 } from "@/lib/snapshot-id";
import { ADSENSE_SLOT_TRANSLATE_CTA } from "@/lib/adsense-config";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PANEL_FROM,
  DEFAULT_PANEL_TO,
  LANGUAGE_KO,
  LANGUAGE_LABEL_MAP,
  LANGUAGE_RESUME,
  type LanguageKey,
  parseLanguageKey,
} from "@/lib/resume-whisk-languages";
import {
  WHISK_TAGLINE_PRIMARY,
  WHISK_TAGLINE_SECONDARY,
} from "@/lib/resume-whisk-taglines";

const SAMPLE_INPUT =
  "퇴사하고 3개월 동안 집에서 넷플릭스 보면서 쉬었습니다. 가끔 유튜브로 코딩 강의 틀어놨습니다.";

const SAMPLE_OUTPUT =
  "지속 가능한 성장을 위해 Strategic Pause를 선택, 업계 트렌드를 분석함. 신규 기술 스택을 자기 주도적으로 학습하며 커리어 재정비의 시기를 가짐.";

const TAGLINE_REVEAL_DELAY_MS = 600;

/** 모바일 번역·typed·하단 광고 구간 Sonner 토스트 id */
const WHISK_TRANSLATE_AD_TOAST_ID = "whisk-translate-ad";

function ResumeWhiskAppInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [fromKey, setFromKey] = React.useState<LanguageKey>(DEFAULT_PANEL_FROM);
  const [toKey, setToKey] = React.useState<LanguageKey>(DEFAULT_PANEL_TO);

  const snapshotId = searchParams.get("snapshot");
  const [snapshotHydrated, setSnapshotHydrated] = React.useState(
    () => !isUuidV4(snapshotId),
  );
  const hydratedSnapshotRef = React.useRef<string | null>(null);
  const [isSharing, setIsSharing] = React.useState(false);
  const [shareAdDialogOpen, setShareAdDialogOpen] = React.useState(false);
  const [shareDialogPreparedUrl, setShareDialogPreparedUrl] = React.useState<
    string | null
  >(null);
  const [shareAdMountKey, setShareAdMountKey] = React.useState(0);
  const [translateAdMountKey, setTranslateAdMountKey] = React.useState(0);
  const [whiskTypedOutput, setWhiskTypedOutput] = React.useState<{
    text: string;
    seq: number;
  } | null>(null);
  const whiskTypedSeqRef = React.useRef(0);
  const pendingWhiskCopyRef = React.useRef<{
    primary: string;
    secondary: string;
  } | null>(null);
  const taglineRevealTimerRef = React.useRef<number | null>(null);

  /** 레거시 ?from=&to= 한 번 반영 후 URL에서 제거 */
  React.useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    if (!fromParam && !toParam) return;

    const fk = parseLanguageKey(fromParam);
    const tk = parseLanguageKey(toParam);
    if (fk && tk) {
      queueMicrotask(() => {
        setFromKey(fk);
        setToKey(tk);
      });
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete("from");
    next.delete("to");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const [inputText, setInputText] = React.useState("");
  const [outputText, setOutputText] = React.useState("");
  const effectiveOutputText = whiskTypedOutput?.text ?? outputText;
  const [taglinePrimary, setTaglinePrimary] = React.useState(WHISK_TAGLINE_PRIMARY);
  const [taglineSecondary, setTaglineSecondary] = React.useState(
    WHISK_TAGLINE_SECONDARY,
  );
  const [taglinesVisible, setTaglinesVisible] = React.useState(true);
  const [isWhisking, setIsWhisking] = React.useState(false);
  const whiskAbortRef = React.useRef<AbortController | null>(null);
  const [copyHint, setCopyHint] = React.useState<string | null>(null);
  const copyHintTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyHintTimer.current) clearTimeout(copyHintTimer.current);
      if (taglineRevealTimerRef.current !== null) {
        clearTimeout(taglineRevealTimerRef.current);
        taglineRevealTimerRef.current = null;
      }
      whiskAbortRef.current?.abort();
    };
  }, []);

  const showCopyHint = React.useCallback((message: string) => {
    if (copyHintTimer.current) clearTimeout(copyHintTimer.current);
    setCopyHint(message);
    copyHintTimer.current = setTimeout(() => {
      setCopyHint(null);
      copyHintTimer.current = null;
    }, 2200);
  }, []);

  React.useEffect(() => {
    if (!isUuidV4(snapshotId)) {
      hydratedSnapshotRef.current = null;
      queueMicrotask(() => {
        setSnapshotHydrated(true);
      });
      return;
    }

    if (hydratedSnapshotRef.current === snapshotId) {
      queueMicrotask(() => {
        setSnapshotHydrated(true);
      });
      return;
    }

    const sid = snapshotId;

    queueMicrotask(() => {
      setSnapshotHydrated(false);
    });
    const ac = new AbortController();

    void (async () => {
      try {
        const res = await fetch(`/api/snapshots/${sid}`, {
          signal: ac.signal,
        });
        const data: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof (data as { error: unknown }).error === "string"
              ? (data as { error: string }).error
              : "공유 링크를 불러오지 못했어요";
          showCopyHint(msg);
          return;
        }
        if (!data || typeof data !== "object") {
          showCopyHint("공유 링크를 불러오지 못했어요");
          return;
        }
        const d = data as {
          from?: unknown;
          to?: unknown;
          input?: unknown;
          output?: unknown;
          copy_title?: unknown;
          copy_desc?: unknown;
        };
        const fk = parseLanguageKey(typeof d.from === "string" ? d.from : null);
        const tk = parseLanguageKey(typeof d.to === "string" ? d.to : null);
        if (
          !fk ||
          !tk ||
          typeof d.input !== "string" ||
          typeof d.output !== "string" ||
          typeof d.copy_title !== "string" ||
          typeof d.copy_desc !== "string"
        ) {
          showCopyHint("공유 데이터 형식이 올바르지 않아요");
          return;
        }

        hydratedSnapshotRef.current = sid;
        setWhiskTypedOutput(null);
        setFromKey(fk);
        setToKey(tk);
        setInputText(clampWhiskInput(d.input));
        setOutputText(d.output);
        setTaglinePrimary(d.copy_title);
        setTaglineSecondary(d.copy_desc);
        setTaglinesVisible(true);

        const next = new URLSearchParams();
        next.set("snapshot", sid);
        if (searchParams.get("utm_source") === "share") {
          next.set("utm_source", "share");
        }
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        showCopyHint("공유 링크를 불러오지 못했어요");
      } finally {
        if (!ac.signal.aborted) {
          queueMicrotask(() => {
            setSnapshotHydrated(true);
          });
        }
      }
    })();

    return () => ac.abort();
  }, [snapshotId, pathname, router, searchParams, showCopyHint]);

  const onWhiskTypedComplete = React.useCallback((final: string) => {
    setOutputText(final);
    setWhiskTypedOutput(null);

    const pending = pendingWhiskCopyRef.current;
    if (!pending) {
      setTaglinesVisible(true);
      return;
    }

    if (taglineRevealTimerRef.current !== null) {
      clearTimeout(taglineRevealTimerRef.current);
      taglineRevealTimerRef.current = null;
    }

    taglineRevealTimerRef.current = window.setTimeout(() => {
      taglineRevealTimerRef.current = null;
      const p = pendingWhiskCopyRef.current;
      pendingWhiskCopyRef.current = null;
      if (p) {
        setTaglinePrimary(p.primary);
        setTaglineSecondary(p.secondary);
        requestAnimationFrame(() => {
          setTaglinesVisible(true);
        });
      } else {
        setTaglinesVisible(true);
      }
    }, TAGLINE_REVEAL_DELAY_MS);
  }, []);

  const handleCopy = React.useCallback(
    async (text: string) => {
      if (!text.trim()) {
        showCopyHint("복사할 내용이 없어요");
        return;
      }
      const ok = await copyToClipboard(text);
      showCopyHint(
        ok ? "클립보드에 복사했어요" : "복사할 수 없어요. 권한·보안 연결을 확인해 주세요.",
      );
    },
    [showCopyHint],
  );

  const runWhisk = React.useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      showCopyHint("번역할 내용을 입력해 주세요");
      return;
    }

    let direction: "ko_resume" | "resume_ko" | null = null;
    if (fromKey === LANGUAGE_KO && toKey === LANGUAGE_RESUME) {
      direction = "ko_resume";
    } else if (fromKey === LANGUAGE_RESUME && toKey === LANGUAGE_KO) {
      direction = "resume_ko";
    } else {
      showCopyHint("지원하지 않는 방향이에요");
      return;
    }

    whiskAbortRef.current?.abort();
    const controller = new AbortController();
    whiskAbortRef.current = controller;

    if (searchParams.has("snapshot")) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("snapshot");
      next.delete("utm_source");
      hydratedSnapshotRef.current = null;
      setSnapshotHydrated(true);
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }

    if (taglineRevealTimerRef.current !== null) {
      window.clearTimeout(taglineRevealTimerRef.current);
      taglineRevealTimerRef.current = null;
    }
    pendingWhiskCopyRef.current = null;
    setTaglinesVisible(true);

    setTranslateAdMountKey((k) => k + 1);
    setIsWhisking(true);
    try {
      const res = await fetch("/api/whisk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, input: trimmed }),
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "변환에 실패했어요";
        showCopyHint(msg);
        return;
      }
      if (!data || typeof data !== "object") {
        showCopyHint("응답을 이해할 수 없어요");
        return;
      }
      const d = data as {
        text?: unknown;
        copy?: { title?: unknown; desc?: unknown };
      };
      if (typeof d.text !== "string") {
        showCopyHint("응답을 이해할 수 없어요");
        return;
      }
      pendingWhiskCopyRef.current = {
        primary:
          d.copy && typeof d.copy.title === "string"
            ? d.copy.title
            : WHISK_TAGLINE_PRIMARY,
        secondary:
          d.copy && typeof d.copy.desc === "string"
            ? d.copy.desc
            : WHISK_TAGLINE_SECONDARY,
      };
      setTaglinesVisible(false);
      whiskTypedSeqRef.current += 1;
      setWhiskTypedOutput({ text: d.text, seq: whiskTypedSeqRef.current });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      if (taglineRevealTimerRef.current !== null) {
        window.clearTimeout(taglineRevealTimerRef.current);
        taglineRevealTimerRef.current = null;
      }
      pendingWhiskCopyRef.current = null;
      setTaglinesVisible(true);
      showCopyHint("변환에 실패했어요");
    } finally {
      setIsWhisking(false);
    }
  }, [fromKey, toKey, inputText, pathname, router, searchParams, showCopyHint]);

  const handleShareAdDialogOpenChange = React.useCallback((open: boolean) => {
    setShareAdDialogOpen(open);
    if (!open) setShareDialogPreparedUrl(null);
  }, []);

  const copyPreparedShareUrl = React.useCallback(async () => {
    if (!shareDialogPreparedUrl) return;
    const ok = await copyToClipboard(shareDialogPreparedUrl);
    showCopyHint(
      ok
        ? "링크를 클립보드에 복사했어요"
        : "복사할 수 없어요. 권한·보안 연결을 확인해 주세요.",
    );
  }, [shareDialogPreparedUrl, showCopyHint]);

  const handleShare = React.useCallback(async () => {
    if (typeof window === "undefined") return;

    if (!effectiveOutputText.trim()) {
      showCopyHint("공유할 변환 결과가 없어요");
      return;
    }
    if (!snapshotHydrated) return;

    setShareDialogPreparedUrl(null);
    setShareAdMountKey((k) => k + 1);
    setShareAdDialogOpen(true);
    setIsSharing(true);
    let shareFlowSucceeded = false;
    try {
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromKey,
          to: toKey,
          input: inputText,
          output: effectiveOutputText,
          copy_title: taglinePrimary,
          copy_desc: taglineSecondary,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "공유 링크를 만들지 못했어요";
        showCopyHint(msg);
        return;
      }
      if (
        !data ||
        typeof data !== "object" ||
        typeof (data as { id?: unknown }).id !== "string" ||
        !isUuidV4((data as { id: string }).id)
      ) {
        showCopyHint("스냅샷을 저장하지 못했어요");
        return;
      }
      const id = (data as { id: string }).id;
      hydratedSnapshotRef.current = id;

      const query = `snapshot=${encodeURIComponent(id)}&utm_source=share`;
      const shareUrl = new URL(`${pathname}?${query}`, window.location.origin).href;
      setShareDialogPreparedUrl(shareUrl);
      router.replace(`${pathname}?${query}`, { scroll: false });

      const title = "자소서 거품기";
      const shareData: ShareData = {
        title,
        url: shareUrl,
      };

      const nav = typeof navigator !== "undefined" ? navigator : undefined;
      if (nav?.share) {
        try {
          await nav.share(shareData);
          shareFlowSucceeded = true;
          return;
        } catch (err: unknown) {
          const name = err instanceof Error ? err.name : "";
          if (name === "AbortError") {
            shareFlowSucceeded = true;
            return;
          }
        }
      }

      const ok = await copyToClipboard(shareUrl);
      showCopyHint(
        ok
          ? "Web Share를 쓸 수 없어 링크를 클립보드에 복사했어요"
          : "복사할 수 없어요. 권한·보안 연결을 확인해 주세요.",
      );
      shareFlowSucceeded = true;
    } finally {
      setIsSharing(false);
      if (!shareFlowSucceeded) {
        setShareAdDialogOpen(false);
      }
    }
  }, [
    fromKey,
    inputText,
    effectiveOutputText,
    pathname,
    router,
    showCopyHint,
    taglinePrimary,
    taglineSecondary,
    toKey,
    snapshotHydrated,
  ]);

  const swapPanels = () => {
    whiskAbortRef.current?.abort();
    setIsWhisking(false);
    setWhiskTypedOutput(null);
    if (taglineRevealTimerRef.current !== null) {
      window.clearTimeout(taglineRevealTimerRef.current);
      taglineRevealTimerRef.current = null;
    }
    pendingWhiskCopyRef.current = null;
    setTaglinesVisible(true);
    setTaglinePrimary(WHISK_TAGLINE_PRIMARY);
    setTaglineSecondary(WHISK_TAGLINE_SECONDARY);
    setInputText(clampWhiskInput(outputText));
    setOutputText(inputText);
    setFromKey(toKey);
    setToKey(fromKey);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("snapshot");
    next.delete("utm_source");
    next.delete("from");
    next.delete("to");
    const q = next.toString();
    hydratedSnapshotRef.current = null;
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const showWhiskTranslateAd = isWhisking || whiskTypedOutput !== null;
  const hasOutputToShare = effectiveOutputText.trim().length > 0;
  const shareControlsDisabled =
    !snapshotHydrated || !hasOutputToShare || isWhisking || isSharing;

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissToast = () => {
      toast.dismiss(WHISK_TRANSLATE_AD_TOAST_ID);
    };

    const narrow = window.matchMedia("(max-width: 639px)").matches;
    if (!narrow) {
      dismissToast();
      return dismissToast;
    }

    const adPhase = isWhisking || whiskTypedOutput !== null;
    if (adPhase) {
      const fromLabel = LANGUAGE_LABEL_MAP[fromKey];
      const toLabel = LANGUAGE_LABEL_MAP[toKey];
      const eulReul = objectParticleEulReul(fromLabel);
      toast.loading(`${fromLabel}${eulReul} ${toLabel}로 변환하는 중 ...`, {
        id: WHISK_TRANSLATE_AD_TOAST_ID,
        duration: Number.POSITIVE_INFINITY,
      });
    } else {
      dismissToast();
    }

    return dismissToast;
  }, [isWhisking, whiskTypedOutput, fromKey, toKey]);

  return (
    <div className="relative flex h-dvh min-h-0 w-full max-h-dvh flex-col overflow-hidden bg-[#f9f9f9] pt-[max(1rem,env(safe-area-inset-top))]">
      {copyHint ? <WhiskCopyToast message={copyHint} /> : null}

      <WhiskLayoutColumn className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(4.75rem+env(safe-area-inset-bottom))]">
        <div className="flex w-full flex-1 flex-col justify-center gap-4 sm:gap-8">
          <Card className="flex w-full shrink-0 flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-sm ring-1 ring-black/[0.06] md:rounded-3xl md:shadow-md">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-4 py-2 sm:gap-3 sm:px-6 sm:py-2.5 md:px-7">
            <div className="flex min-h-8 min-w-0 flex-1 items-center pl-0.5 sm:max-w-[160px] sm:pl-1">
              <span className="text-sm font-medium text-[#1a1f2c] sm:text-base">
                {LANGUAGE_LABEL_MAP[fromKey]}
              </span>
            </div>

            <WhiskToolbarButton
              className="min-h-9 min-w-9 shrink-0 sm:min-h-8 sm:min-w-8"
              title="입력과 결과 바꾸기"
              disabled={isWhisking || isSharing}
              onClick={swapPanels}
            >
              <ArrowLeftRight
                className="size-5 sm:size-[1.125rem]"
                strokeWidth={1.75}
              />
            </WhiskToolbarButton>

            <div className="flex min-h-8 min-w-0 flex-1 items-center justify-end pr-0.5 sm:max-w-[160px] sm:pr-1">
              <span className="text-sm font-medium text-[#1a1f2c] sm:text-base">
                {LANGUAGE_LABEL_MAP[toKey]}
              </span>
            </div>
            </div>

            <div className="flex shrink-0 flex-col px-3 pt-2 pb-1.5 sm:px-4 sm:pt-3 sm:pb-2 md:px-5">
            <WhiskTranslatorTextarea
              shortOnMobile
              value={inputText}
              maxLength={WHISK_INPUT_MAX_CHARS}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={SAMPLE_INPUT}
              aria-describedby="whisk-input-char-count"
            />
            <div className="mt-1 flex w-full min-w-0 shrink-0 items-center gap-2 sm:mt-1.5">
              <div className="flex shrink-0 items-center gap-0.5">
                <WhiskToolbarButton
                  title="복사"
                  disabled={isWhisking || isSharing}
                  onClick={() => void handleCopy(inputText)}
                >
                  <Copy className="size-5" strokeWidth={1.5} />
                </WhiskToolbarButton>
              </div>
              <span
                id="whisk-input-char-count"
                className="ml-auto shrink-0 text-right text-xs leading-none text-muted-foreground tabular-nums"
                aria-live="polite"
              >
                {inputText.length}/{WHISK_INPUT_MAX_CHARS}
              </span>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-8 shrink-0 gap-1.5 px-3 font-semibold shadow-sm sm:h-8"
                disabled={isWhisking || isSharing || !inputText.trim()}
                aria-busy={isWhisking}
                onClick={() => void runWhisk()}
              >
                {isWhisking ? (
                  <>
                    <Loader2
                      className="size-3.5 animate-spin"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>번역 중…</span>
                  </>
                ) : (
                  "번역하기"
                )}
              </Button>
            </div>
            </div>

            <Separator className="shrink-0 bg-border/70" />

            <div
              className={`flex shrink-0 flex-col px-3 pt-2 pb-2 sm:px-4 sm:pt-3 sm:pb-2.5 md:px-5 md:pb-3 ${isWhisking ? "pointer-events-none" : ""}`}
            >
            {whiskTypedOutput ? (
              <WhiskTypedTranslatorOutput
                key={whiskTypedOutput.seq}
                text={whiskTypedOutput.text}
                onComplete={onWhiskTypedComplete}
              />
            ) : isWhisking ? (
              <WhiskWaitingPresetTyped active />
            ) : (
              <WhiskTranslatorTextarea
                readOnly
                value={outputText}
                placeholder={SAMPLE_OUTPUT}
              />
            )}
            <div className="mt-1 hidden shrink-0 items-center gap-0.5 sm:mt-1.5 sm:flex">
              <WhiskToolbarButton
                title="복사"
                disabled={isWhisking || isSharing}
                onClick={() => void handleCopy(effectiveOutputText)}
              >
                <Copy className="size-5" strokeWidth={1.5} />
              </WhiskToolbarButton>
              <WhiskToolbarButton
                title={
                  isSharing
                    ? "링크 준비 중…"
                    : !snapshotHydrated
                      ? "불러오는 중…"
                      : !hasOutputToShare
                        ? "변환 결과가 있어야 공유할 수 있어요"
                        : "스냅샷 링크 공유"
                }
                disabled={shareControlsDisabled}
                aria-busy={isSharing}
                onClick={() => void handleShare()}
              >
                {isSharing ? (
                  <Loader2
                    className="size-5 animate-spin"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                ) : (
                  <Share2 className="size-5" strokeWidth={1.5} />
                )}
              </WhiskToolbarButton>
            </div>
            </div>
            <div className="flex shrink-0 justify-end border-t border-border/50 px-3 py-1.5 sm:px-4 md:px-5">
              <a
                href="https://hsol.info?utm_source=whisk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-medium tracking-tight text-muted-foreground underline-offset-2 hover:text-foreground hover:underline sm:text-[11px]"
              >
                hsol.info
              </a>
            </div>
          </Card>

          <div
            className={cn(
              "flex w-full shrink-0 flex-col items-center px-0.5 pt-2 text-center transition-opacity ease-in-out sm:pt-3",
              taglinesVisible
                ? "opacity-100 duration-[1200ms]"
                : "pointer-events-none opacity-0 duration-200",
            )}
          >
            <h1 className="max-w-[95%] text-balance text-[clamp(1.35rem,2.75svh+0.85rem,3.75rem)] font-bold tracking-tight text-[#1a1f2c] sm:max-w-none md:text-[clamp(1.5rem,2.5svh+1rem,4.5rem)] lg:text-[clamp(1.75rem,2.25svh+1.1rem,4.5rem)]">
              {taglinePrimary}
            </h1>
            <p className="mt-2 max-w-[95%] text-balance text-[clamp(0.9rem,1.35svh+0.65rem,1.75rem)] leading-snug text-muted-foreground sm:mt-2.5 md:mt-3 md:text-[clamp(1rem,1.2svh+0.7rem,1.875rem)] lg:text-[clamp(1.05rem,1.1svh+0.75rem,1.875rem)]">
              {taglineSecondary}
            </p>
          </div>
        </div>
      </WhiskLayoutColumn>

      <WhiskShareAdDialog
        open={shareAdDialogOpen}
        onOpenChange={handleShareAdDialogOpenChange}
        isBusy={isSharing}
        mountKey={shareAdMountKey}
        preparedShareUrl={shareDialogPreparedUrl}
        onCopyPreparedUrl={() => void copyPreparedShareUrl()}
      />

      <WhiskShareBottomSheet
        onShare={() => void handleShare()}
        isBusy={isSharing}
        disabled={shareControlsDisabled}
        showTranslateAd={showWhiskTranslateAd}
        translateAdSlot={ADSENSE_SLOT_TRANSLATE_CTA}
        translateAdMountKey={translateAdMountKey}
      />
    </div>
  );
}

export function ResumeWhiskApp() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh w-full bg-[#f9f9f9] pt-[max(1rem,env(safe-area-inset-top))]" />
      }
    >
      <ResumeWhiskAppInner />
    </Suspense>
  );
}
