import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  className?: string;
}

interface HUDTableProps {
  data: any[];
  columns: Column[];
  title?: string;
  className?: string;
  maxRows?: number;
  variant?: 'default' | 'compact';
}

export function HUDTable({ 
  data, 
  columns, 
  title, 
  className, 
  maxRows = 10,
  variant = 'default'
}: HUDTableProps) {
  const displayData = data.slice(0, maxRows);

  return (
    <div className={cn("skeuo-inset rounded-lg overflow-hidden", className)}>
      {title && (
        <div className="border-b border-border/50 p-4">
          <h4 className="text-lg font-semibold text-foreground tracking-wide">
            {title}
          </h4>
        </div>
      )}
      
      <div className="relative overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-muted/20">
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={cn(
                    "text-left font-medium text-muted-foreground tracking-wide",
                    variant === 'compact' ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm",
                    column.className
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {index === 0 && (
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border/20">
            {displayData.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className="hover:bg-muted/10 transition-colors group"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className={cn(
                      "text-foreground",
                      variant === 'compact' ? "px-3 py-2 text-sm" : "px-4 py-3",
                      column.className
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                      {colIndex === 0 && (
                        <div className="w-1 h-1 bg-primary/30 rounded-full group-hover:bg-primary/60 transition-colors"></div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Holographic scan lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" 
               style={{ top: '50%' }}></div>
        </div>
      </div>
      
      {data.length > maxRows && (
        <div className="border-t border-border/50 p-3 text-center">
          <span className="text-xs text-muted-foreground">
            Showing {maxRows} of {data.length} records
          </span>
        </div>
      )}
    </div>
  );
}