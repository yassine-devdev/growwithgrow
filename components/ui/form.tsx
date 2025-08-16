import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Form Container
const formVariants = cva(
  "space-y-6",
  {
    variants: {
      variant: {
        default: "",
        card: "p-6 bg-gradient-to-tr from-card-from to-card-to border border-cyber-border rounded-lg backdrop-blur-xl",
        inline: "space-y-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface FormProps
  extends React.FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof formVariants> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <form
        className={cn(formVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Form.displayName = "Form"

// Form Field
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  required?: boolean
  description?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, description, children, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        {label && (
          <label className="block text-sm font-medium text-white">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}
        {children}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

// Form Group (for grouping related fields)
export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div className={cn("space-y-4", className)} ref={ref} {...props}>
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-medium text-white">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-gray-400">{description}</p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }
)
FormGroup.displayName = "FormGroup"

// Form Actions (for buttons)
export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right" | "between"
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ className, align = "right", children, ...props }, ref) => {
    const alignClasses = {
      left: "justify-start",
      center: "justify-center", 
      right: "justify-end",
      between: "justify-between"
    }

    return (
      <div 
        className={cn(
          "flex gap-3 pt-4 border-t border-cyber-border/30",
          alignClasses[align],
          className
        )} 
        ref={ref} 
        {...props}
      >
        {children}
      </div>
    )
  }
)
FormActions.displayName = "FormActions"

export { Form, FormField, FormGroup, FormActions, formVariants }