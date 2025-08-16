import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonVariants = cva(
  "animate-pulse bg-gradient-to-r from-cyber-surface/20 via-cyber-surface/40 to-cyber-surface/20 rounded",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyber-surface/20 via-cyber-surface/40 to-cyber-surface/20",
        card: "bg-gradient-to-r from-card-from/20 via-card-to/40 to-card-from/20",
        text: "bg-gradient-to-r from-gray-600/20 via-gray-500/40 to-gray-600/20",
        avatar: "bg-gradient-to-r from-cyber-cyan/20 via-cyber-cyan/40 to-cyber-cyan/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant,
  width,
  height,
  ...props
}) => {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    />
  )
}

// Predefined skeleton components
const SkeletonText: React.FC<{
  lines?: number
  className?: string
  variant?: "default" | "card" | "text" | "avatar"
}> = ({ lines = 3, className, variant = "text" }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant={variant}
          className={cn(
            "h-4",
            index === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

const SkeletonCard: React.FC<{
  className?: string
  showImage?: boolean
  showTitle?: boolean
  showText?: boolean
  showButton?: boolean
}> = ({ 
  className, 
  showImage = true, 
  showTitle = true, 
  showText = true, 
  showButton = true 
}) => {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {showImage && (
        <Skeleton variant="card" className="w-full h-32 rounded-lg" />
      )}
      {showTitle && (
        <Skeleton variant="text" className="w-3/4 h-6" />
      )}
      {showText && (
        <SkeletonText lines={2} variant="text" />
      )}
      {showButton && (
        <Skeleton variant="default" className="w-24 h-10 rounded-md" />
      )}
    </div>
  )
}

const SkeletonAvatar: React.FC<{
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}> = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  return (
    <Skeleton
      variant="avatar"
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  )
}

const SkeletonTable: React.FC<{
  rows?: number
  columns?: number
  className?: string
}> = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex space-x-2">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            variant="text"
            className="h-6 flex-1"
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              className="h-4 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const SkeletonList: React.FC<{
  items?: number
  className?: string
  showAvatar?: boolean
  showTitle?: boolean
  showText?: boolean
}> = ({ 
  items = 3, 
  className, 
  showAvatar = true, 
  showTitle = true, 
  showText = true 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-start space-x-3">
          {showAvatar && <SkeletonAvatar size="md" />}
          <div className="flex-1 space-y-2">
            {showTitle && (
              <Skeleton variant="text" className="w-1/2 h-4" />
            )}
            {showText && (
              <Skeleton variant="text" className="w-full h-3" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonAvatar, 
  SkeletonTable, 
  SkeletonList,
  skeletonVariants 
}
