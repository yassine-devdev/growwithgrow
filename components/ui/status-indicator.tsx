import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      status: {
        online: "bg-green-500/20 text-green-400 border border-green-500/30",
        offline: "bg-red-500/20 text-red-400 border border-red-500/30",
        warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        maintenance: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        unknown: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      animated: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      status: "unknown",
      size: "md",
      animated: false,
    },
  }
)

const dotVariants = cva(
  "rounded-full",
  {
    variants: {
      status: {
        online: "bg-green-400",
        offline: "bg-red-400",
        warning: "bg-yellow-400",
        maintenance: "bg-blue-400",
        unknown: "bg-gray-400",
      },
      size: {
        sm: "h-1.5 w-1.5",
        md: "h-2 w-2",
        lg: "h-2.5 w-2.5",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      status: "unknown",
      size: "md",
      animated: false,
    },
  }
)

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  label?: string
  showDot?: boolean
  lastUpdated?: Date
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ 
    className, 
    status, 
    size, 
    animated, 
    label, 
    showDot = true, 
    lastUpdated,
    children,
    ...props 
  }, ref) => {
    const statusLabels = {
      online: "Online",
      offline: "Offline", 
      warning: "Warning",
      maintenance: "Maintenance",
      unknown: "Unknown",
    }

    const displayLabel = label || (status ? statusLabels[status] : "Unknown")

    return (
      <div
        ref={ref}
        className={cn(statusIndicatorVariants({ status, size, animated }), className)}
        {...props}
      >
        {showDot && (
          <div className={cn(dotVariants({ status, size, animated }))} />
        )}
        <span>{displayLabel}</span>
        {children}
        {lastUpdated && (
          <span className="text-gray-500 ml-1">
            ({formatRelativeTime(lastUpdated)})
          </span>
        )}
      </div>
    )
  }
)
StatusIndicator.displayName = "StatusIndicator"

// Health Check Component
export interface HealthCheckProps {
  name: string
  status: "healthy" | "unhealthy" | "degraded" | "unknown"
  responseTime?: number
  lastCheck?: Date
  error?: string
}

const HealthCheck: React.FC<HealthCheckProps> = ({
  name,
  status,
  responseTime,
  lastCheck,
  error,
}) => {
  const statusMap = {
    healthy: "online" as const,
    unhealthy: "offline" as const,
    degraded: "warning" as const,
    unknown: "unknown" as const,
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-cyber-border/30 bg-cyber-surface/20">
      <div className="flex items-center space-x-3">
        <StatusIndicator 
          status={statusMap[status]} 
          label={name}
          size="sm"
          animated={status === "degraded"}
        />
        {responseTime && (
          <span className="text-xs text-gray-400">
            {responseTime}ms
          </span>
        )}
      </div>
      
      <div className="text-right">
        {lastCheck && (
          <div className="text-xs text-gray-400">
            {formatRelativeTime(lastCheck)}
          </div>
        )}
        {error && (
          <div className="text-xs text-red-400 max-w-xs truncate">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

// System Status Component
export interface SystemStatusProps {
  services: HealthCheckProps[]
  overallStatus?: "operational" | "degraded" | "outage"
}

const SystemStatus: React.FC<SystemStatusProps> = ({ 
  services, 
  overallStatus = "operational" 
}) => {
  const statusMap = {
    operational: "online" as const,
    degraded: "warning" as const,
    outage: "offline" as const,
  }

  const statusLabels = {
    operational: "All Systems Operational",
    degraded: "Some Systems Degraded",
    outage: "System Outage",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">System Status</h3>
        <StatusIndicator 
          status={statusMap[overallStatus]}
          label={statusLabels[overallStatus]}
          size="lg"
        />
      </div>
      
      <div className="space-y-2">
        {services.map((service, index) => (
          <HealthCheck key={index} {...service} />
        ))}
      </div>
    </div>
  )
}

// Utility function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`
  } else {
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }
}

export { 
  StatusIndicator, 
  HealthCheck, 
  SystemStatus, 
  statusIndicatorVariants, 
  dotVariants 
}