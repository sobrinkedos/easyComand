import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-2 text-sm font-medium",
  {
    variants: {
      variant: {
        available: "text-secondary-700",
        occupied: "text-accent-700",
        reserved: "text-primary-700",
        maintenance: "text-neutral-600",
        pending: "text-primary-700",
        preparing: "text-accent-700",
        ready: "text-secondary-700",
        delivered: "text-neutral-600",
        open: "text-secondary-700",
        closed: "text-neutral-600",
        paid: "text-primary-700",
      },
    },
    defaultVariants: {
      variant: "available",
    },
  }
)

const statusDotVariants = cva(
  "h-2.5 w-2.5 rounded-full",
  {
    variants: {
      variant: {
        available: "bg-secondary-500 animate-pulse",
        occupied: "bg-accent-500",
        reserved: "bg-primary-500",
        maintenance: "bg-neutral-500",
        pending: "bg-primary-500 animate-pulse",
        preparing: "bg-accent-500",
        ready: "bg-secondary-500 animate-pulse",
        delivered: "bg-neutral-500",
        open: "bg-secondary-500 animate-pulse",
        closed: "bg-neutral-500",
        paid: "bg-primary-500",
      },
    },
    defaultVariants: {
      variant: "available",
    },
  }
)

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  label?: string
  showDot?: boolean
}

function StatusIndicator({ 
  className, 
  variant, 
  label,
  showDot = true,
  children,
  ...props 
}: StatusIndicatorProps) {
  return (
    <div className={cn(statusIndicatorVariants({ variant }), className)} {...props}>
      {showDot && <span className={cn(statusDotVariants({ variant }))} />}
      {label || children}
    </div>
  )
}

export { StatusIndicator, statusIndicatorVariants }
