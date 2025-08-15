import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FUICardProps {
  children: ReactNode;
  className?: string;
  glowing?: boolean;
  title?: string;
  subtitle?: string;
  rightElement?: ReactNode;
  variant?: 'default' | 'primary' | 'warning' | 'success';
}

export function FUICard({ 
  children, 
  className, 
  glowing = false, 
  title, 
  subtitle,
  rightElement,
  variant = 'default'
}: FUICardProps) {
  const variants = {
    default: "border-border",
    primary: "border-primary/50 bg-primary/5",
    warning: "border-orange-500/50 bg-orange-500/5",
    success: "border-green-500/50 bg-green-500/5"
  };

  return (
    <div className={cn(
      "skeuo-surface relative overflow-hidden",
      glowing && "shadow-[0_0_20px_rgba(96,165,250,0.3)]",
      variants[variant],
      className
    )}>
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/30"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-primary/30"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-primary/30"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/30"></div>
      
      {/* Header */}
      {(title || rightElement) && (
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-foreground tracking-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {rightElement}
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        {children}
      </div>
      
      {/* Animated scan line */}
      {glowing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}