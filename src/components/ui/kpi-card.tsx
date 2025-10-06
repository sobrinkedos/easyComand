import * as React from "react"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"

export interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  subtitle?: string
  loading?: boolean
}

export function KPICard({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  trend,
  subtitle,
  loading = false,
  className,
  ...props
}: KPICardProps) {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow duration-200", className)} {...props}>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 w-10 bg-slate-200 rounded-lg" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded" />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Icon */}
            <div className={cn("inline-flex p-2.5 rounded-lg", iconBgColor)}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>

            {/* Title */}
            <p className="text-sm font-medium text-slate-600">{title}</p>

            {/* Value and Trend */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                {subtitle && (
                  <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                )}
              </div>

              {trend && (
                <div className="flex flex-col items-end">
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-semibold",
                      trend.isPositive ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(trend.value)}%</span>
                  </div>
                  {trend.label && (
                    <p className="text-xs text-slate-500 mt-0.5">{trend.label}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
