import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-cyber-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-cyber-border data-[state=checked]:bg-cyber-cyan data-[state=checked]:border-cyber-cyan data-[state=checked]:text-white",
        success: "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white",
        warning: "border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 data-[state=checked]:text-black",
        error: "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 data-[state=checked]:text-white",
      },
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string
  description?: string
  error?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
            className={cn(
              checkboxVariants({ variant, size }),
              "absolute opacity-0 peer",
              className
            )}
            data-state={checked ? "checked" : "unchecked"}
            onChange={handleChange}
            {...props}
          />
          <div className={cn(
            checkboxVariants({ variant, size }),
            "bg-cyber-surface/50 backdrop-blur-sm peer-checked:bg-cyber-cyan peer-checked:border-cyber-cyan peer-focus-visible:ring-2 peer-focus-visible:ring-cyber-cyan/50"
          )}>
            {checked && (
              <CheckIcon className={cn(
                "text-white",
                size === "sm" && "h-2 w-2",
                size === "md" && "h-3 w-3", 
                size === "lg" && "h-4 w-4"
              )} />
            )}
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
Checkbox.displayName = "Checkbox"

// Check Icon
const CheckIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    className={cn("h-3 w-3", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={3}
    {...props}
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
)

export { Checkbox, checkboxVariants }