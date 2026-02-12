import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle } from "lucide-react"
import * as React from "react"

import { cn } from "../../lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground hover:shadow-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 py-1 text-xs",
        default: "h-10 px-3 py-2 text-sm file:text-sm",
        lg: "h-12 px-4 py-3 text-base"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, error, ...props }, ref) => {
    if (error) {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(
              inputVariants({ size }),
              "border-destructive pr-10 text-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
          <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
