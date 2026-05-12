import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { WhiskLayoutColumn } from "./whisk-layout-column";

export function WhiskShareBottomSheet({
  onShare,
}: {
  onShare: () => void;
}) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-40 shrink-0 rounded-t-2xl border-t border-border/70 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90"
      aria-label="공유하기"
    >
      <WhiskLayoutColumn>
        <Button
          type="button"
          variant="default"
          className="h-12 w-full gap-2 rounded-xl px-6 text-base font-semibold shadow-sm"
          onClick={onShare}
        >
          <Share2 className="size-5" strokeWidth={2} aria-hidden />
          공유하기
        </Button>
      </WhiskLayoutColumn>
    </footer>
  );
}
