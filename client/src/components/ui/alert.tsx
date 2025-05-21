import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-gray-900/80 text-gray-100 border-gray-800 backdrop-blur-sm",
        destructive: "bg-red-900/20 text-red-400 border-red-800/50 [&>svg]:text-red-400",
        success: "bg-green-900/20 text-green-400 border-green-800/50 [&>svg]:text-green-400",
        warning: "bg-yellow-900/20 text-yellow-400 border-yellow-800/50 [&>svg]:text-yellow-400",
        info: "bg-cyan-900/20 text-cyan-400 border-cyan-800/50 [&>svg]:text-cyan-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      alertVariants({ variant }),
      "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]", // subtle inner glow
      className
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-1 font-medium leading-none tracking-tight",
      "font-mono text-sm uppercase tracking-wider", // crypto-style typography
      "flex items-center gap-2", // for potential icon integration
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm [&_p]:leading-relaxed",
      "text-gray-300 font-light", // softer description text
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };