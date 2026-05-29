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
import { WhiskTranslateAdTopBar } from "@/components/resume-whisk/whisk-translate-ad-top-bar";
import { WhiskShareAdDialog } from "@/components/resume-whisk/whisk-share-ad-dialog";
import { WhiskEditConfirmDialog } from "@/components/resume-whisk/whisk-edit-confirm-dialog";
import {
  COPY_EDIT_TOOLTIP,
  WhiskEditableTagline,
} from "@/components/resume-whisk/whisk-editable-tagline";
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
import { getWhiskWaitingPresetStrings } from "@/lib/whisk-waiting-presets";
import {
  readQuotaCanTranslate,
  readQuotaRedirectUrl,
  readQuotaTranslatedToday,
  useWhiskDailyQuota,
} from "@/lib/whisk-daily-quota";
import { SITE_NAME } from "@/lib/site-seo";

const TEST_MODE_INPUT = "테스트";
const TEST_MODE_DELAY_MS = 1000;

const SAMPLE_INPUT =
  "퇴사하고 3개월 동안 집에서 넷플릭스 보면서 쉬었습니다. 가끔 유튜브로 코딩 강의 틀어놨습니다.";

const SAMPLE_OUTPUT =
  "지속 가능한 성장을 위해 Strategic Pause를 선택, 업계 트렌드를 분석함. 신규 기술 스택을 자기 주도적으로 학습하며 커리어 재정비의 시기를 가짐.";

const TAGLINE_REVEAL_DELAY_MS = 600;
const COPY_TITLE_MAX = 500;
const COPY_DESC_MAX = 2_000;
const COPY_EDIT_HINT_AUTO_DISMISS_MS = 8_000;
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
  const [editConfirmOpen, setEditConfirmOpen] = React.useState(false);
  const [editConfirmVariant, setEditConfirmVariant] = React.useState<
    "edit" | "locked"
  >("edit");
  const pendingEditTextRef = React.useRef<string | null>(null);

  /**
   * 일일 쿼터: 무료 번역은 백그라운드로 스냅샷 자동 생성 후 그 URL을
   * localStorage에 저장. 1회 사용 후 공유 안 누른 상태로 재진입하면
   * 그 URL로 자동 리다이렉트.
   */
  const { recordFirstTranslation, markShared } = useWhiskDailyQuota();
  const firstQuotaHintShownRef = React.useRef(false);
  /** mount 시 락 판단을 한 번만 하도록 */
  const lockRedirectAttemptedRef = React.useRef(false);
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

  /**
   * 마운트 시 락 자동 리다이렉트.
   * 같은 사용자가 1회 사용 + 공유 안 누른 상태에서 새 진입(새로고침/재방문)을
   * 하면 자기가 만든 공유 URL로 보낸다. 이미 그 페이지에 있으면(쿼리에 같은
   * snapshot id 포함) 리다이렉트하지 않아 루프를 방지.
   */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (lockRedirectAttemptedRef.current) return;
    lockRedirectAttemptedRef.current = true;

    const redirectUrl = readQuotaRedirectUrl();
    if (!redirectUrl) return;

    try {
      const target = new URL(redirectUrl, window.location.origin);
      const targetSnapshot = target.searchParams.get("snapshot");
      const currentSnapshot = searchParams.get("snapshot");
      if (targetSnapshot && targetSnapshot === currentSnapshot) return;
      router.replace(
        `${target.pathname}${target.search}${target.hash}`,
        { scroll: false },
      );
    } catch {
      /* URL 파싱 실패 시 무시 */
    }
    // 의도적으로 deps에 searchParams를 넣지 않음 — 마운트 시 한 번만 판단.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const openLockedDialog = React.useCallback(() => {
    pendingEditTextRef.current = null;
    setEditConfirmVariant("locked");
    setEditConfirmOpen(true);
  }, []);

  const runWhisk = React.useCallback(async () => {
    if (!snapshotHydrated) return;

    const trimmed = inputText.trim();
    if (!trimmed) {
      showCopyHint("번역할 내용을 입력해 주세요");
      return;
    }

    // 락 게이트는 "공유할 결과가 실제로 화면에 있는" 경우에만 발동.
    // 스냅샷 hydration 실패 등으로 결과가 비어 있는데 락만 걸리면 사용자가
    // 아무것도 못 하게 되므로, 그 케이스에서는 락을 무시하고 새 번역을 허용.
    if (
      !readQuotaCanTranslate() &&
      effectiveOutputText.trim().length > 0
    ) {
      openLockedDialog();
      return;
    }
    const wasFirstTranslation = !readQuotaTranslatedToday();

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

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches
    ) {
      setTranslateAdMountKey((k) => k + 1);
    }
    /**
     * 번역 성공 직후 호출. 첫 무료 번역이면 백그라운드로 스냅샷을 자동
     * 생성해서 그 URL을 localStorage에 기록 — 사용자가 새로고침해도 그
     * URL로 자동 리다이렉트되어 공유를 유도할 수 있게 됨.
     */
    const noteSuccessfulTranslation = (outputForSnapshot: string) => {
      if (!firstQuotaHintShownRef.current) {
        firstQuotaHintShownRef.current = true;
        showCopyHint(
          "오늘 무료 1회 사용 · 1번 공유하면 추가 번역 가능 (자정 초기화)",
        );
      }
      if (!wasFirstTranslation) return;
      void (async () => {
        try {
          const copy = pendingWhiskCopyRef.current;
          const res = await fetch("/api/snapshots", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              from: fromKey,
              to: toKey,
              input: trimmed,
              output: outputForSnapshot,
              copy_title: copy?.primary ?? WHISK_TAGLINE_PRIMARY,
              copy_desc: copy?.secondary ?? WHISK_TAGLINE_SECONDARY,
            }),
          });
          if (!res.ok) return;
          const data: unknown = await res.json().catch(() => null);
          if (
            !data ||
            typeof data !== "object" ||
            typeof (data as { id?: unknown }).id !== "string" ||
            !isUuidV4((data as { id: string }).id)
          ) {
            return;
          }
          const id = (data as { id: string }).id;
          const query = `snapshot=${encodeURIComponent(id)}&utm_source=share`;
          const shareUrl = new URL(
            `${pathname}?${query}`,
            window.location.origin,
          ).href;
          recordFirstTranslation(shareUrl);
        } catch {
          /* 백그라운드 실패는 사일런트 — 락이 활성화되지 않을 뿐 */
        }
      })();
    };

    setIsWhisking(true);
    try {
      if (trimmed === TEST_MODE_INPUT) {
        await new Promise<void>((resolve, reject) => {
          if (controller.signal.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }
          const timer = window.setTimeout(() => {
            controller.signal.removeEventListener("abort", onAbort);
            resolve();
          }, TEST_MODE_DELAY_MS);
          const onAbort = () => {
            window.clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
          };
          controller.signal.addEventListener("abort", onAbort, { once: true });
        });

        const presets = getWhiskWaitingPresetStrings(fromKey, toKey);
        const sampleText =
          presets[Math.floor(Math.random() * presets.length)] ?? "";

        pendingWhiskCopyRef.current = {
          primary: WHISK_TAGLINE_PRIMARY,
          secondary: WHISK_TAGLINE_SECONDARY,
        };
        setTaglinesVisible(false);
        whiskTypedSeqRef.current += 1;
        setWhiskTypedOutput({
          text: sampleText,
          seq: whiskTypedSeqRef.current,
        });
        noteSuccessfulTranslation(sampleText);
        return;
      }

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
      noteSuccessfulTranslation(d.text);
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
  }, [
    fromKey,
    toKey,
    inputText,
    pathname,
    router,
    searchParams,
    showCopyHint,
    snapshotHydrated,
    openLockedDialog,
    recordFirstTranslation,
    effectiveOutputText,
  ]);

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

      const title = SITE_NAME;
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
      if (shareFlowSucceeded) {
        // 일일 쿼터 해제: 오늘 한 번이라도 공유하면 락 풀림.
        markShared();
      } else {
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
    markShared,
  ]);

  const resetTranslationForInputEdit = React.useCallback(() => {
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
    setOutputText("");
    setShareDialogPreparedUrl(null);

    if (searchParams.has("snapshot") || searchParams.has("utm_source")) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("snapshot");
      next.delete("utm_source");
      hydratedSnapshotRef.current = null;
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

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
  const snapshotBusy =
    snapshotId !== null && isUuidV4(snapshotId) && !snapshotHydrated;
  const snapshotLocked =
    isUuidV4(snapshotId) && snapshotHydrated;
  const inputReadOnly = isWhisking || snapshotBusy;
  const inputNeedsEditConfirm =
    (hasOutputToShare || snapshotLocked) && !inputReadOnly;

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = clampWhiskInput(e.target.value);
      if (inputReadOnly) return;

      if (inputNeedsEditConfirm && next !== inputText) {
        // 화면에 실제 보여줄 결과가 없으면(예: 스냅샷 hydration 실패) 락도,
        // 수정 컨펌도 띄우지 않고 그냥 입력을 적용 — 사용자가 갇히지 않도록.
        if (!hasOutputToShare) {
          setInputText(next);
          return;
        }
        if (!readQuotaCanTranslate()) {
          openLockedDialog();
          return;
        }
        pendingEditTextRef.current = next;
        setEditConfirmVariant("edit");
        setEditConfirmOpen(true);
        return;
      }

      setInputText(next);
    },
    [
      inputNeedsEditConfirm,
      inputReadOnly,
      inputText,
      openLockedDialog,
      hasOutputToShare,
    ],
  );

  const handleEditConfirmOpenChange = React.useCallback((open: boolean) => {
    setEditConfirmOpen(open);
    if (!open) {
      pendingEditTextRef.current = null;
    }
  }, []);

  const handleEditConfirmAccept = React.useCallback(() => {
    const next = pendingEditTextRef.current;
    pendingEditTextRef.current = null;
    setEditConfirmOpen(false);
    if (next === null) return;
    resetTranslationForInputEdit();
    setInputText(next);
  }, [resetTranslationForInputEdit]);

  const copyEditable =
    hasOutputToShare &&
    taglinesVisible &&
    !snapshotLocked &&
    !isWhisking &&
    !isSharing &&
    !snapshotBusy;

  const [copyEditHintOpen, setCopyEditHintOpen] = React.useState(false);

  React.useEffect(() => {
    if (!copyEditable) {
      setCopyEditHintOpen(false);
      return;
    }
    setCopyEditHintOpen(true);
    const timer = window.setTimeout(
      () => setCopyEditHintOpen(false),
      COPY_EDIT_HINT_AUTO_DISMISS_MS,
    );
    return () => clearTimeout(timer);
  }, [copyEditable]);

  const dismissCopyEditHint = React.useCallback(() => {
    setCopyEditHintOpen(false);
  }, []);

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
    <div className="relative flex h-dvh min-h-0 w-full max-h-dvh flex-col overflow-hidden bg-[#f9f9f9]">
      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col",
          snapshotBusy && "pointer-events-none select-none",
        )}
        aria-busy={snapshotBusy}
        inert={snapshotBusy ? true : undefined}
      >
        {copyHint ? <WhiskCopyToast message={copyHint} /> : null}

        <WhiskTranslateAdTopBar />

        <WhiskLayoutColumn
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto pb-[calc(4.75rem+env(safe-area-inset-bottom))]",
            showWhiskTranslateAd &&
              "max-sm:pb-[calc(8rem+env(safe-area-inset-bottom))]",
          )}
        >
        <div className="flex w-full flex-1 flex-col justify-center gap-4 sm:gap-8">
          <Card className="relative flex w-full shrink-0 flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-sm ring-1 ring-black/[0.06] md:rounded-3xl md:shadow-md">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-4 py-2 sm:gap-3 sm:px-6 sm:py-2.5 md:px-7">
            <div className="flex min-h-8 min-w-0 flex-1 items-center pl-0.5 sm:max-w-[160px] sm:pl-1">
              <span className="text-sm font-medium text-[#1a1f2c] sm:text-base">
                {LANGUAGE_LABEL_MAP[fromKey]}
              </span>
            </div>

            <WhiskToolbarButton
              className="min-h-9 min-w-9 shrink-0 sm:min-h-8 sm:min-w-8"
              title="입력과 결과 바꾸기"
              disabled={isWhisking || isSharing || snapshotBusy}
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
              readOnly={inputReadOnly}
              value={inputText}
              maxLength={WHISK_INPUT_MAX_CHARS}
              onChange={handleInputChange}
              placeholder={SAMPLE_INPUT}
              aria-describedby="whisk-input-char-count"
              aria-readonly={inputReadOnly || undefined}
            />
            <div className="mt-1 flex w-full min-w-0 shrink-0 items-center gap-2 sm:mt-1.5">
              <div className="flex shrink-0 items-center gap-0.5">
                <WhiskToolbarButton
                  title="복사"
                  disabled={isWhisking || isSharing || snapshotBusy}
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
                disabled={
                  isWhisking || isSharing || !inputText.trim() || snapshotBusy
                }
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
              className={`flex shrink-0 flex-col px-3 pt-2 pb-2 sm:px-4 sm:pt-3 sm:pb-2.5 md:px-5 md:pb-3 ${isWhisking || snapshotBusy ? "pointer-events-none" : ""}`}
            >
            {whiskTypedOutput ? (
              <WhiskTypedTranslatorOutput
                key={whiskTypedOutput.seq}
                text={whiskTypedOutput.text}
                onComplete={onWhiskTypedComplete}
              />
            ) : isWhisking ? (
              <WhiskWaitingPresetTyped
                active
                fromKey={fromKey}
                toKey={toKey}
              />
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
                disabled={isWhisking || isSharing || snapshotBusy}
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
            {snapshotBusy ? (
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#1a1f2c]/[0.14] backdrop-blur-[2px] md:rounded-3xl"
                role="status"
                aria-live="polite"
                aria-label="스냅샷 불러오는 중"
              >
                <Loader2
                  className="size-10 shrink-0 animate-spin text-white drop-shadow-sm"
                  aria-hidden
                />
              </div>
            ) : null}
          </Card>

          <div
            className={cn(
              "relative flex w-full shrink-0 flex-col items-center px-0.5 pt-2 text-center transition-opacity ease-in-out sm:pt-3",
              taglinesVisible
                ? "opacity-100 duration-[1200ms]"
                : "pointer-events-none opacity-0 duration-200",
            )}
          >
            {copyEditable && copyEditHintOpen ? (
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 max-w-[min(100%,18rem)] -translate-x-1/2 rounded-lg bg-[#1a1f2c] px-3 py-2 text-xs font-medium leading-snug text-white shadow-md sm:text-sm"
              >
                {COPY_EDIT_TOOLTIP}
                <span
                  className="absolute left-1/2 top-full -mt-px size-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-[#1a1f2c]"
                  aria-hidden
                />
              </div>
            ) : null}
            <WhiskEditableTagline
              variant="primary"
              value={taglinePrimary}
              editable={copyEditable}
              maxLength={COPY_TITLE_MAX}
              onCommit={(next) => {
                dismissCopyEditHint();
                setTaglinePrimary(next);
              }}
              onEditInteraction={dismissCopyEditHint}
            />
            <WhiskEditableTagline
              variant="secondary"
              value={taglineSecondary}
              editable={copyEditable}
              maxLength={COPY_DESC_MAX}
              onCommit={(next) => {
                dismissCopyEditHint();
                setTaglineSecondary(next);
              }}
              onEditInteraction={dismissCopyEditHint}
            />
          </div>
        </div>
      </WhiskLayoutColumn>

      <WhiskShareBottomSheet
        onShare={() => void handleShare()}
        isBusy={isSharing}
        disabled={shareControlsDisabled}
        showTranslateAd={showWhiskTranslateAd}
        translateAdMountKey={translateAdMountKey}
      />
      </div>

      <WhiskShareAdDialog
        open={shareAdDialogOpen}
        onOpenChange={handleShareAdDialogOpenChange}
        isBusy={isSharing}
        mountKey={shareAdMountKey}
        preparedShareUrl={shareDialogPreparedUrl}
        onCopyPreparedUrl={() => void copyPreparedShareUrl()}
      />

      <WhiskEditConfirmDialog
        open={editConfirmOpen}
        onOpenChange={handleEditConfirmOpenChange}
        variant={editConfirmVariant}
        onConfirm={handleEditConfirmAccept}
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
