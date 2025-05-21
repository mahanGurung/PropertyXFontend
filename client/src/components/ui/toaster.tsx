import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertCircle, AlertTriangle, Info, Circle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle className="flex items-center gap-2">
                {props.variant === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                )}
                {props.variant === 'destructive' && (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                )}
                {props.variant === 'warning' && (
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                )}
                {props.variant === 'info' && (
                  <Info className="h-4 w-4 text-blue-400" />
                )}
                {(!props.variant || props.variant === 'default') && (
                  <Circle className="h-4 w-4 text-cyan-400" />
                )}
                {title}
              </ToastTitle>}
              {description && (
                <ToastDescription className="pl-6">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="[--viewport-padding:_25px] sm:right-[25px]" />
    </ToastProvider>
  )
}