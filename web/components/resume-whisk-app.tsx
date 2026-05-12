"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Copy,
  Star,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE_INPUT =
  "퇴사하고 3개월 동안 집에서 넷플릭스 보면서 쉬었습니다. 가끔 유튜브로 코딩 강의 틀어놨습니다.";

const SAMPLE_OUTPUT =
  "지속 가능한 성장을 위해 Strategic Pause를 선택, 업계 트렌드를 분석함. 신규 기술 스택을 자기 주도적으로 학습하며 커리어 재정비의 시기를 가짐.";

export function ResumeWhiskApp() {
  const [sourceLang, setSourceLang] = React.useState("ko");
  const [targetKind, setTargetKind] = React.useState("resume");
  const [inputText, setInputText] = React.useState(SAMPLE_INPUT);
  const [outputText, setOutputText] = React.useState(SAMPLE_OUTPUT);
  const [starred, setStarred] = React.useState(false);

  const swapPanels = () => {
    setInputText(outputText);
    setOutputText(inputText);
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#f9f9f9] px-4 py-10 pb-16">
      <Card className="w-full max-w-3xl gap-0 overflow-hidden rounded-3xl border-0 bg-white py-0 shadow-sm ring-1 ring-black/[0.06]">
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3 sm:px-5">
          <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger
              size="sm"
              className="h-9 min-w-0 flex-1 border-0 bg-transparent shadow-none hover:bg-muted/50 focus-visible:ring-0 sm:max-w-[140px]"
            >
              <SelectValue placeholder="언어" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">한국어</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            title="입력과 결과 바꾸기"
            onClick={swapPanels}
          >
            <ArrowLeftRight className="size-5" strokeWidth={1.75} />
          </Button>

          <Select value={targetKind} onValueChange={setTargetKind}>
            <SelectTrigger
              size="sm"
              className="h-9 min-w-0 flex-1 border-0 bg-transparent shadow-none hover:bg-muted/50 focus-visible:ring-0 sm:max-w-[140px]"
            >
              <SelectValue placeholder="출력" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resume">Resume</SelectItem>
              <SelectItem value="cover">자기소개서</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative px-4 pt-4 pb-2 sm:px-5">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px] resize-none border-0 bg-transparent p-0 text-base leading-relaxed text-[#1a1f2c] shadow-none focus-visible:ring-0 md:text-[15px]"
            placeholder="평범한 문장을 입력하세요"
          />
          <div className="mt-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              title="읽기"
            >
              <Volume2 className="size-5" strokeWidth={1.5} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              title="복사"
              onClick={() => void copyText(inputText)}
            >
              <Copy className="size-5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        <Separator className="bg-border/70" />

        <div className="relative px-4 pt-4 pb-3 sm:px-5">
          <Textarea
            readOnly
            value={outputText}
            className="min-h-[200px] resize-none border-0 bg-transparent p-0 text-base leading-relaxed text-[#1a1f2c] shadow-none focus-visible:ring-0 md:text-[15px]"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                title="읽기"
              >
                <Volume2 className="size-5" strokeWidth={1.5} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                title="복사"
                onClick={() => void copyText(outputText)}
              >
                <Copy className="size-5" strokeWidth={1.5} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={
                  starred
                    ? "text-amber-500 hover:text-amber-600"
                    : "text-muted-foreground hover:text-foreground"
                }
                title="즐겨찾기"
                onClick={() => setStarred((s) => !s)}
              >
                <Star
                  className="size-5"
                  strokeWidth={1.5}
                  fill={starred ? "currentColor" : "none"}
                />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground/80">@yeol.dev</span>
          </div>
        </div>
      </Card>

      <div className="mt-12 max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#1a1f2c] sm:text-4xl">
          공백기를 전략으로
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          쉰 게 아니라 투자한 것입니다
        </p>
      </div>
    </div>
  );
}
