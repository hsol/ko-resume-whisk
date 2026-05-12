import * as React from "react";

import { cn } from "@/lib/utils";

export function WhiskLayoutColumn({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-sm px-3 sm:max-w-2xl sm:px-4 md:max-w-3xl md:px-5 lg:max-w-4xl lg:px-6",
        className,
      )}
      {...props}
    />
  );
}
