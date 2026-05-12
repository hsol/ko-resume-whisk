"use client";

import * as React from "react";
import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeftRight,
  Copy,
  Share2,
  Volume2,
} from "lucide-react";

import { WhiskCopyToast } from "@/components/resume-whisk/whisk-copy-toast";
import { WhiskLayoutColumn } from "@/components/resume-whisk/whisk-layout-column";
import { WhiskShareBottomSheet } from "@/components/resume-whisk/whisk-share-bottom-sheet";
import { WhiskToolbarButton } from "@/components/resume-whisk/whisk-toolbar-button";
import { WhiskTranslatorTextarea } from "@/components/resume-whisk/whisk-translator-textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { copyToClipboard } from "@/lib/resume-whisk-clipboard";
import {
  DEFAULT_PANEL_FROM,
  DEFAULT_PANEL_TO,
  LANGUAGE_LABEL_MAP,
  resolvePanelLanguageKey,
} from "@/lib/resume-whisk-languages";

const SAMPLE_INPUT =
  "퇴사하고 3개월 동안 집에서 넷플릭스 보면서 쉬었습니다. 가끔 유튜브로 코딩 강의 틀어놨습니다.";

const SAMPLE_OUTPUT =
  "지속 가능한 성장을 위해 Strategic Pause를 선택, 업계 트렌드를 분석함. 신규 기술 스택을 자기 주도적으로 학습하며 커리어 재정비의 시기를 가짐.";

function ResumeWhiskAppInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const fromKey = resolvePanelLanguageKey(
    searchParams.get("from"),
    DEFAULT_PANEL_FROM,
  );
  const toKey = resolvePanelLanguageKey(
    searchParams.get("to"),
    DEFAULT_PANEL_TO,
  );

  React.useEffect(() => {
    const rf = searchParams.get("from");
    const rt = searchParams.get("to");
    if (rf === fromKey && rt === toKey) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("from", fromKey);
    next.set("to", toKey);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [fromKey, toKey, pathname, router, searchParams]);

  const [inputText, setInputText] = React.useState(SAMPLE_INPUT);
  const [outputText, setOutputText] = React.useState(SAMPLE_OUTPUT);
  const [copyHint, setCopyHint] = React.useState<string | null>(null);
  const copyHintTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (copyHintTimer.current) clearTimeout(copyHintTimer.current);
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

  const handleShare = React.useCallback(async () => {
    const body = outputText.trim();
    if (!body) {
      showCopyHint("공유할 내용이 없어요");
      return;
    }

    const url =
      typeof window !== "undefined" && window.location?.href
        ? window.location.href
        : "";
    const title = "자소서 거품기";
    const shareData: ShareData = {
      title,
      text: `${body}\n\n— ${title}`,
      url: url || undefined,
    };

    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share(shareData);
        return;
      } catch (err: unknown) {
        const name = err instanceof Error ? err.name : "";
        if (name === "AbortError") return;
      }
    }

    const ok = await copyToClipboard(outputText);
    showCopyHint(
      ok
        ? "Web Share를 쓸 수 없어 클립보드에 복사했어요"
        : "복사할 수 없어요. 권한·보안 연결을 확인해 주세요.",
    );
  }, [outputText, showCopyHint]);

  const swapPanels = () => {
    setInputText(outputText);
    setOutputText(inputText);
    const next = new URLSearchParams(searchParams.toString());
    next.set("from", toKey);
    next.set("to", fromKey);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="relative flex h-dvh min-h-0 w-full max-h-dvh flex-col overflow-hidden bg-[#f9f9f9] pt-[max(1rem,env(safe-area-inset-top))]">
      {copyHint ? <WhiskCopyToast message={copyHint} /> : null}

      <WhiskLayoutColumn className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-[calc(4.75rem+env(safe-area-inset-bottom))]">
        <Card className="flex w-full shrink-0 flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-sm ring-1 ring-black/[0.06] md:rounded-3xl md:shadow-md">
          <div className="flex shrink-0 items-center justify-between gap-1 border-b border-border/60 px-3 py-2.5 sm:gap-2 sm:px-4 sm:py-3 md:px-5">
            <div className="flex min-h-10 min-w-0 flex-1 items-center sm:min-h-9 sm:max-w-[160px]">
              <span className="text-sm font-medium text-[#1a1f2c] sm:text-base">
                {LANGUAGE_LABEL_MAP[fromKey]}
              </span>
            </div>

            <WhiskToolbarButton
              className="shrink-0"
              title="입력과 결과 바꾸기"
              onClick={swapPanels}
            >
              <ArrowLeftRight
                className="size-5 sm:size-[1.125rem]"
                strokeWidth={1.75}
              />
            </WhiskToolbarButton>

            <div className="flex min-h-10 min-w-0 flex-1 items-center justify-end sm:min-h-9 sm:max-w-[160px]">
              <span className="text-sm font-medium text-[#1a1f2c] sm:text-base">
                {LANGUAGE_LABEL_MAP[toKey]}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col px-3 pt-2 pb-1.5 sm:px-4 sm:pt-3 sm:pb-2 md:px-5">
            <WhiskTranslatorTextarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="평범한 문장을 입력하세요"
            />
            <div className="mt-1 flex shrink-0 items-center gap-0.5 sm:mt-1.5">
              <WhiskToolbarButton title="읽기">
                <Volume2 className="size-5" strokeWidth={1.5} />
              </WhiskToolbarButton>
              <WhiskToolbarButton
                title="복사"
                onClick={() => void handleCopy(inputText)}
              >
                <Copy className="size-5" strokeWidth={1.5} />
              </WhiskToolbarButton>
            </div>
          </div>

          <Separator className="shrink-0 bg-border/70" />

          <div className="flex shrink-0 flex-col px-3 pt-2 pb-2 sm:px-4 sm:pt-3 sm:pb-2.5 md:px-5 md:pb-3">
            <WhiskTranslatorTextarea readOnly value={outputText} />
            <div className="mt-1 flex shrink-0 items-center gap-0.5 sm:mt-1.5">
              <WhiskToolbarButton title="읽기">
                <Volume2 className="size-5" strokeWidth={1.5} />
              </WhiskToolbarButton>
              <WhiskToolbarButton
                title="복사"
                onClick={() => void handleCopy(outputText)}
              >
                <Copy className="size-5" strokeWidth={1.5} />
              </WhiskToolbarButton>
              <WhiskToolbarButton
                title="공유하기"
                onClick={() => void handleShare()}
              >
                <Share2 className="size-5" strokeWidth={1.5} />
              </WhiskToolbarButton>
            </div>
          </div>
        </Card>

        <div className="flex w-full shrink-0 flex-col items-center px-0.5 pt-2 text-center sm:pt-3">
          <h1 className="max-w-[95%] text-balance text-[clamp(1.35rem,2.75svh+0.85rem,3.75rem)] font-bold tracking-tight text-[#1a1f2c] sm:max-w-none md:text-[clamp(1.5rem,2.5svh+1rem,4.5rem)] lg:text-[clamp(1.75rem,2.25svh+1.1rem,4.5rem)]">
            공백기를 전략으로
          </h1>
          <p className="mt-2 max-w-[95%] text-balance text-[clamp(0.9rem,1.35svh+0.65rem,1.75rem)] leading-snug text-muted-foreground sm:mt-2.5 md:mt-3 md:text-[clamp(1rem,1.2svh+0.7rem,1.875rem)] lg:text-[clamp(1.05rem,1.1svh+0.75rem,1.875rem)]">
            쉰 게 아니라 투자한 것입니다
          </p>
        </div>
      </WhiskLayoutColumn>

      <WhiskShareBottomSheet onShare={() => void handleShare()} />
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
