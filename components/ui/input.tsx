import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-cyber-border bg-cyber-surface/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 focus:border-cyber-cyan disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-cyber-border",
        error: "border-red-500 focus:ring-red-500/50 focus:border-red-500",
        success: "border-green-500 focus:ring-green-500/50 focus:border-green-500",
        warning: "border-yellow-500 focus:ring-yellow-500/50 focus:border-yellow-500",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string
  success?: string
  warning?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, success, warning, leftIcon, rightIcon, ...props }, ref) => {
    // Determine variant based on props
    const inputVariant = error ? "error" : success ? "success" : warning ? "warning" : variant

    return (
      <div className="relative w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant: inputVariant, size: size as "sm" | "md" | "lg" }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || success || warning) && (
          <p
            className={cn(
              "mt-1 text-sm",
              error && "text-red-400",
              success && "text-green-400",
              warning && "text-yellow-400"
            )}
          >
            {error || success || warning}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
