import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-cyber-cyan data-[state=unchecked]:bg-cyber-surface/50",
        success: "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-cyber-surface/50",
        warning: "data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-cyber-surface/50",
        error: "data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-cyber-surface/50",
      },
      size: {
        sm: "h-4 w-7",
        md: "h-6 w-11",
        lg: "h-8 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
  {
    variants: {
      size: {
        sm: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
        md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        lg: "h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof switchVariants> {
  label?: string
  description?: string
  error?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, variant, size, label, description, error, ...props }, ref) => {
    const [checked, setChecked] = React.useState(props.checked || false)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked)
      props.onChange?.(event)
    }

    return (
      <div className="flex items-start space-x-3">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={ref}
            className="sr-only peer"
            data-state={checked ? "checked" : "unchecked"}
            onChange={handleChange}
            {...props}
          />
          <div className={cn(
            switchVariants({ variant, size }),
            "peer-focus-visible:ring-2 peer-focus-visible:ring-cyber-cyan/50",
            className
          )}>
            <div
              className={cn(
                switchThumbVariants({ size }),
                checked ? "data-[state=checked]:translate-x-5" : "data-[state=unchecked]:translate-x-0"
              )}
              data-state={checked ? "checked" : "unchecked"}
            />
          </div>
        </div>
        
        {(label || description) && (
          <div className="flex-1 space-y-1">
            {label && (
              <label className="text-sm font-medium text-white cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-400">
                {description}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Switch.displayName = "Switch"

export { Switch, switchVariants, switchThumbVariants }