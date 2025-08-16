import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

const metricCardVariants = cva(
  "transition-all duration-200",
  {
    variants: {
      trend: {
        up: "border-green-500/30 bg-gradient-to-br from-green-900/20 to-green-800/10",
        down: "border-red-500/30 bg-gradient-to-br from-red-900/20 to-red-800/10",
        neutral: "border-cyber-border bg-gradient-to-br from-cyber-surface/20 to-cyber-surface/10",
      },
      size: {
        sm: "",
        md: "",
        lg: "p-8",
      },
    },
    defaultVariants: {
      trend: "neutral",
      size: "md",
    },
  }
)

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
  }
  icon?: React.ReactNode
  description?: string
  loading?: boolean
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    className, 
    trend, 
    size, 
    title, 
    value, 
    change, 
    icon, 
    description, 
    loading = false,
    ...props 
  }, ref) => {
    const trendDirection = change 
      ? change.value > 0 
        ? "up" 
        : change.value < 0 
          ? "down" 
          : "neutral"
      : trend

    return (
      <Card
        ref={ref}
        className={cn(metricCardVariants({ trend: trendDirection, size }), className)}
        {...props}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <div className="h-8 bg-cyber-surface/50 rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-bold text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
            )}
            
            {change && !loading && (
              <div className="flex items-center space-x-2 text-xs">
                <TrendIcon direction={trendDirection} />
                <span className={cn(
                  "font-medium",
                  trendDirection === "up" && "text-green-400",
                  trendDirection === "down" && "text-red-400",
                  trendDirection === "neutral" && "text-gray-400"
                )}>
                  {change.value > 0 ? "+" : ""}{change.value}%
                </span>
                <span className="text-gray-400">
                  from {change.period}
                </span>
              </div>
            )}
            
            {description && (
              <p className="text-xs text-gray-400">
                {description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)
MetricCard.displayName = "MetricCard"

// Trend Icon Component
const TrendIcon: React.FC<{ direction: "up" | "down" | "neutral" }> = ({ direction }) => {
  if (direction === "up") {
    return (
      <svg className="h-3 w-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
        <polyline points="17,6 23,6 23,12" />
      </svg>
    )
  }
  
  if (direction === "down") {
    return (
      <svg className="h-3 w-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" />
        <polyline points="17,18 23,18 23,12" />
      </svg>
    )
  }
  
  return (
    <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export { MetricCard, metricCardVariants }