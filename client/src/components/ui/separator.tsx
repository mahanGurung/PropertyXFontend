import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-gradient-to-r from-transparent via-gray-700 to-transparent",
        orientation === "horizontal" 
          ? "h-px w-full my-4" 
          : "h-full w-px mx-4",
        "data-[orientation=horizontal]:hover:via-cyan-400",
        "data-[orientation=vertical]:hover:via-cyan-400",
        "transition-colors duration-300",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }