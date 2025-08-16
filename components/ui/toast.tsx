import * as React from "react"
import { createPortal } from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Toast Context
interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "warning" | "error"
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Toast Provider
export interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Toast Container
const ToastContainer: React.FC = () => {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  )
}

// Toast Component
const toastVariants = cva(
  "relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all duration-300 backdrop-blur-xl",
  {
    variants: {
      variant: {
        default: "bg-cyber-surface/90 border-cyber-border text-white",
        success: "bg-green-900/90 border-green-500/50 text-green-100",
        warning: "bg-yellow-900/90 border-yellow-500/50 text-yellow-100",
        error: "bg-red-900/90 border-red-500/50 text-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastComponentProps {
  toast: Toast
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast }) => {
  const { removeToast } = useToast()
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => removeToast(toast.id), 300)
  }

  return (
    <div
      className={cn(
        toastVariants({ variant: toast.variant }),
        "transform transition-all duration-300",
        isVisible 
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0"
      )}
    >
      <div className="flex items-start space-x-3 flex-1">
        <ToastIcon variant={toast.variant} />
        <div className="flex-1 space-y-1">
          {toast.title && (
            <div className="text-sm font-medium">
              {toast.title}
            </div>
          )}
          {toast.description && (
            <div className="text-sm opacity-90">
              {toast.description}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={handleClose}
          className="opacity-70 hover:opacity-100 transition-opacity"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Icon
const ToastIcon: React.FC<{ variant?: Toast['variant'] }> = ({ variant }) => {
  switch (variant) {
    case 'success':
      return <CheckCircleIcon className="h-5 w-5 text-green-400" />
    case 'warning':
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
    case 'error':
      return <XCircleIcon className="h-5 w-5 text-red-400" />
    default:
      return <InformationCircleIcon className="h-5 w-5 text-blue-400" />
  }
}

// Icons
const CheckCircleIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ExclamationTriangleIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const XCircleIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const InformationCircleIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export { ToastProvider, useToast, toastVariants }