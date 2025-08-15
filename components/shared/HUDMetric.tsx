import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HUDMetricProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HUDMetric({ 
  label, 
  value, 
  icon, 
  trend, 
  trendValue, 
  className,
  size = 'md' 
}: HUDMetricProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-muted-foreground'
  };

  const trendSymbols = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  const sizes = {
    sm: {
      value: 'text-xl',
      label: 'text-xs',
      container: 'p-3'
    },
    md: {
      value: 'text-2xl',
      label: 'text-sm',
      container: 'p-4'
    },
    lg: {
      value: 'text-3xl',
      label: 'text-base',
      container: 'p-6'
    }
  };

  return (
    <div className={cn(
      "skeuo-inset border border-border/50 rounded-lg relative",
      sizes[size].container,
      className
    )}>
      {/* Holographic corner */}
      <div className="absolute top-1 right-1 w-2 h-2 bg-primary/50 rounded-full animate-pulse"></div>
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && <div className="text-primary">{icon}</div>}
            <p className={cn("text-muted-foreground font-medium tracking-wide", sizes[size].label)}>
              {label}
            </p>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className={cn("font-mono font-bold text-foreground", sizes[size].value)}>
              {value}
            </span>
            
            {trend && trendValue && (
              <span className={cn("text-xs font-medium", trendColors[trend])}>
                {trendSymbols[trend]} {trendValue}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-lg border border-primary/20 animate-pulse pointer-events-none"></div>
    </div>
  );
}