import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:from-cyan-600 hover:to-purple-700 hover:shadow-cyan-500/20",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/10",
        outline: "border border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-cyan-400",
        secondary: "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white",
        ghost: "text-gray-400 hover:bg-gray-800/50 hover:text-cyan-400",
        link: "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300",
        premium: "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-gray-900 font-bold shadow-lg hover:shadow-yellow-500/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }