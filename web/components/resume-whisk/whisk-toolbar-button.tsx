import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WhiskToolbarButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        "min-h-11 min-w-11 touch-manipulation text-muted-foreground hover:text-foreground sm:min-h-8 sm:min-w-8 sm:size-8",
        className,
      )}
      {...props}
    />
  );
}
