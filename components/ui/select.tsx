import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Select Context
interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select component")
  }
  return context
}

// Select Root
export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
}

const Select: React.FC<SelectProps> = ({ 
  value, 
  onValueChange, 
  children, 
  disabled = false 
}) => {
  const [open, setOpen] = React.useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (!disabled) {
      setOpen(newOpen)
    }
  }

  return (
    <SelectContext.Provider value={{ 
      value, 
      onValueChange, 
      open, 
      onOpenChange: handleOpenChange 
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// Select Trigger
const selectTriggerVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-md border border-cyber-border bg-cyber-surface/50 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50 focus:border-cyber-cyan disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-cyber-border",
        error: "border-red-500 focus:ring-red-500/50 focus:border-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof selectTriggerVariants> {
  placeholder?: string
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, variant, placeholder, children, ...props }, ref) => {
    const { open, onOpenChange } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        className={cn(selectTriggerVariants({ variant }), className)}
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        {...props}
      >
        <span className="truncate">
          {children || <span className="text-gray-400">{placeholder}</span>}
        </span>
        <ChevronDownIcon className={cn(
          "h-4 w-4 opacity-50 transition-transform duration-200",
          open && "rotate-180"
        )} />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

// Select Value
export interface SelectValueProps {
  placeholder?: string
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = useSelectContext()
  
  if (!value) {
    return <span className="text-gray-400">{placeholder}</span>
  }
  
  return <span>{value}</span>
}

// Select Content
export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "top" | "bottom"
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, position = "bottom", children, ...props }, ref) => {
    const { open, onOpenChange } = useSelectContext()
    const contentRef = React.useRef<HTMLDivElement>(null)

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          onOpenChange(false)
        }
      }

      if (open) {
        document.addEventListener("mousedown", handleClickOutside)
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [open, onOpenChange])

    // Close on escape
    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onOpenChange(false)
        }
      }

      if (open) {
        document.addEventListener("keydown", handleEscape)
      }

      return () => {
        document.removeEventListener("keydown", handleEscape)
      }
    }, [open, onOpenChange])

    if (!open) return null

    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-cyber-border bg-cyber-surface/95 backdrop-blur-xl shadow-lg",
          position === "top" ? "bottom-full mb-1" : "top-full mt-1",
          "w-full",
          className
        )}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

// Select Item
export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, disabled = false, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange, onOpenChange } = useSelectContext()
    const isSelected = selectedValue === value

    const handleClick = () => {
      if (!disabled) {
        onValueChange(value)
        onOpenChange(false)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
          isSelected 
            ? "bg-cyber-cyan/20 text-cyber-cyan" 
            : "text-white hover:bg-cyber-surface/50",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        {isSelected && (
          <CheckIcon className="ml-auto h-4 w-4" />
        )}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

// Select Label
const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-gray-300", className)}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

// Select Separator
const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-cyber-border/50", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

// Icons
const ChevronDownIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
)

const CheckIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
)

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  selectTriggerVariants,
}