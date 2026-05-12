import { cn } from "@/lib/utils";

/** 광고 슬롯이 비어 있거나 로드 전·실패 시 자리 표시 */
export function AdsenseSkeleton({
  className,
  compact = false,
}: {
  className?: string;
  /** 하단 CTA(`h-12`) 리본과 맞춘 얕은 플레이스홀더 */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 w-full flex-col justify-center gap-1.5 rounded-lg border border-border/40 bg-muted/25 px-2 py-1",
          className,
        )}
        aria-hidden
      >
        <div className="h-2 w-1/3 animate-pulse rounded bg-muted-foreground/15" />
        <div className="h-2 w-[70%] animate-pulse rounded bg-muted-foreground/12" />
        <div className="h-2 w-2/3 animate-pulse rounded bg-muted-foreground/10" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[120px] w-full max-w-2xl flex-col gap-3 rounded-xl border border-border/50 bg-muted/30 p-4",
        className,
      )}
      aria-hidden
    >
      <div className="h-3 w-2/5 animate-pulse rounded-md bg-muted-foreground/15" />
      <div className="h-3 w-4/5 animate-pulse rounded-md bg-muted-foreground/12" />
      <div className="h-3 w-3/5 animate-pulse rounded-md bg-muted-foreground/10" />
      <div className="mt-auto h-16 w-full animate-pulse rounded-lg bg-muted-foreground/10" />
    </div>
  );
}
