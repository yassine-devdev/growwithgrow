import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-transparent",
  {
    variants: {
      variant: {
        default: "border-cyber-cyan border-t-transparent",
        purple: "border-cyber-purple border-t-transparent",
        orange: "border-cyber-orange border-t-transparent",
        white: "border-white border-t-transparent",
      },
      size: {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12",
        "2xl": "w-16 h-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
  showLabel?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  variant,
  size,
  label = "Loading...",
  showLabel = false,
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      role="status"
      aria-label={label}
      {...props}
    >
      <div className={cn(spinnerVariants({ variant, size }))} />
      {showLabel && (
        <span className="text-sm text-gray-400 font-mono">{label}</span>
      )}
    </div>
  )
}

// Cyberpunk pulse spinner variant
const pulseSpinnerVariants = cva(
  "rounded-full bg-cyber-cyan animate-pulse",
  {
    variants: {
      variant: {
        default: "bg-cyber-cyan",
        purple: "bg-cyber-purple",
        orange: "bg-cyber-orange",
        white: "bg-white",
      },
      size: {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4",
        xl: "w-6 h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface PulseSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pulseSpinnerVariants> {
  dots?: number
  label?: string
}

const PulseSpinner: React.FC<PulseSpinnerProps> = ({
  className,
  variant,
  size,
  dots = 3,
  label = "Loading...",
  ...props
}) => {
  return (
    <div
      className={cn("flex items-center justify-center gap-1", className)}
      role="status"
      aria-label={label}
      {...props}
    >
      {Array.from({ length: dots }).map((_, index) => (
        <div
          key={index}
          className={cn(
            pulseSpinnerVariants({ variant, size }),
            "animate-pulse"
          )}
          style={{
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}

// Cyberpunk matrix spinner
const MatrixSpinner: React.FC<{
  className?: string
  size?: "sm" | "md" | "lg"
  label?: string
}> = ({ className, size = "md", label = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2", className)}
      role="status"
      aria-label={label}
    >
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 border-2 border-cyber-cyan rounded-lg animate-pulse" />
        <div className="absolute inset-1 border border-cyber-cyan/50 rounded-md animate-ping" />
        <div className="absolute inset-2 bg-cyber-cyan/20 rounded-sm animate-pulse" />
      </div>
      <span className="text-xs text-cyber-cyan font-mono animate-pulse">
        {label}
      </span>
    </div>
  )
}

export { LoadingSpinner, PulseSpinner, MatrixSpinner, spinnerVariants }
