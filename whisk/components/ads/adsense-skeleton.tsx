import { cn } from "@/lib/utils";

/** 광고 슬롯이 비어 있거나 로드 전·실패 시 자리 표시 */
export function AdsenseSkeleton({ className }: { className?: string }) {
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
