import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-500 text-white hover:bg-primary-600",
        secondary:
          "border-transparent bg-secondary-500 text-white hover:bg-secondary-600",
        accent:
          "border-transparent bg-accent-500 text-white hover:bg-accent-600",
        destructive:
          "border-transparent bg-status-error text-white hover:bg-red-600",
        outline: "text-foreground border-neutral-300",
        success:
          "border-transparent bg-status-success text-white hover:bg-green-600",
        warning:
          "border-transparent bg-status-warning text-white hover:bg-orange-600",
        info:
          "border-transparent bg-status-info text-white hover:bg-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
