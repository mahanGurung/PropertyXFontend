import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2",
          "text-sm text-gray-100 placeholder:text-gray-500",
          "ring-offset-gray-900 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-100",
          "transition-all duration-200 focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "shadow-sm hover:shadow-cyan-500/10 focus:shadow-cyan-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }