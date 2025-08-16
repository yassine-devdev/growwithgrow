import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative h-4 w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-cyber-surface/50 border border-cyber-border/30",
        success: "bg-green-900/30 border border-green-500/30",
        warning: "bg-yellow-900/30 border border-yellow-500/30",
        error: "bg-red-900/30 border border-red-500/30",
      },
      size: {
        sm: "h-2",
        md: "h-4",
        lg: "h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const progressBarVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyber-purple to-cyber-cyan",
        success: "bg-gradient-to-r from-green-600 to-green-400",
        warning: "bg-gradient-to-r from-yellow-600 to-yellow-400",
        error: "bg-gradient-to-r from-red-600 to-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  showLabel?: boolean
  label?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    variant, 
    size, 
    value = 0, 
    max = 100, 
    showLabel = false,
    label,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    return (
      <div className="w-full space-y-2">
        {(showLabel || label) && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">
              {label || "Progress"}
            </span>
            <span className="text-gray-400">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(progressVariants({ variant, size }), className)}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
          aria-valuemin={0}
          {...props}
        >
          <div
            className={cn(progressBarVariants({ variant }))}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

// Circular Progress Component
export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  label?: string
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className,
    variant = "default",
    value = 0,
    max = 100,
    size = 120,
    strokeWidth = 8,
    showLabel = false,
    label,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const colorMap = {
      default: "stroke-cyber-cyan",
      success: "stroke-green-400",
      warning: "stroke-yellow-400",
      error: "stroke-red-400",
    }

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-cyber-surface/50"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-300 ease-in-out", colorMap[variant])}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-white">
              {Math.round(percentage)}%
            </span>
            {label && (
              <span className="text-xs text-gray-400 mt-1">
                {label}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

export { Progress, CircularProgress, progressVariants, progressBarVariants }