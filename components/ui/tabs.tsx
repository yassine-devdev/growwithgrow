import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Tabs Root Context
interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component")
  }
  return context
}

// Tabs Root
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, onValueChange, orientation = "horizontal", ...props }, ref) => {
    return (
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          className={cn(
            "w-full",
            orientation === "vertical" && "flex gap-4",
            className
          )}
          {...props}
        />
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

// Tabs List
const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-md p-1 bg-cyber-surface/30 border border-cyber-border/50 backdrop-blur-sm",
  {
    variants: {
      orientation: {
        horizontal: "h-10 w-full",
        vertical: "flex-col h-auto w-48",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(tabsListVariants({ orientation }), className)}
      role="tablist"
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

// Tabs Trigger
const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      state: {
        active: "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 shadow-sm",
        inactive: "text-gray-400 hover:text-white hover:bg-cyber-surface/50",
      },
      orientation: {
        horizontal: "flex-1",
        vertical: "w-full justify-start",
      },
    },
    defaultVariants: {
      state: "inactive",
      orientation: "horizontal",
    },
  }
)

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, orientation = "horizontal", ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabsContext()
    const isActive = selectedValue === value

    return (
      <button
        ref={ref}
        className={cn(
          tabsTriggerVariants({ 
            state: isActive ? "active" : "inactive",
            orientation 
          }),
          className
        )}
        role="tab"
        aria-selected={isActive}
        onClick={() => onValueChange(value)}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

// Tabs Content
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext()
    const isActive = selectedValue === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        className={cn(
          "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        role="tabpanel"
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants }