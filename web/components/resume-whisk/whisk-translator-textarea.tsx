import * as React from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function WhiskTranslatorTextarea({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Textarea>, "rows">) {
  return (
    <Textarea
      rows={5}
      className={cn(
        "field-sizing-fixed block !min-h-0 h-[calc(1.375em*5+1rem)] max-h-[calc(1.375em*5+1rem)] w-full shrink-0 resize-none overflow-y-auto border-0 bg-transparent px-0 py-2 text-base leading-snug text-[#1a1f2c] shadow-none focus-visible:ring-0 sm:text-[15px] md:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
