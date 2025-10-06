import * as React from "react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "Nenhum dado disponível",
  onRowClick,
  className,
  ...props
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("w-full overflow-hidden rounded-lg border border-slate-200 bg-white", className)} {...props}>
        <div className="animate-pulse">
          <div className="h-12 bg-slate-100 border-b border-slate-200" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-slate-100 bg-white" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn("w-full overflow-hidden rounded-lg border border-slate-200 bg-white", className)} {...props}>
        <div className="p-12 text-center">
          <p className="text-slate-500">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-slate-200 bg-white", className)} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-slate-50"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-6 py-4 text-sm text-slate-900",
                      column.className
                    )}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
