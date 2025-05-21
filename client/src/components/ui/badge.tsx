import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-cyan-600 text-white hover:bg-cyan-700",
        secondary:
          "border-transparent bg-gray-700 text-gray-200 hover:bg-gray-600",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-700",
        success:
          "border-transparent bg-green-600 text-white hover:bg-green-700",
        warning:
          "border-transparent bg-yellow-500 text-gray-900 hover:bg-yellow-600",
        outline: 
          "border-gray-600 text-gray-300 hover:bg-gray-800/50",
        premium:
          "bg-gradient-to-r from-purple-600 to-cyan-500 text-white border-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }