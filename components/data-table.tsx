'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Plus } from 'lucide-react'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onAddNew?: () => void
  title: string
  emptyState?: string
  isLoading?: boolean
}

export function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onAddNew,
  title,
  emptyState = 'No data available',
  isLoading = false,
}: DataTableProps) {
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIdx = (page - 1) * itemsPerPage
  const displayData = data.slice(startIdx, startIdx + itemsPerPage)

  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="p-6 border-b border-border/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {onAddNew && (
          <Button
            onClick={onAddNew}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Plus size={16} />
            Add New
          </Button>
        )}
      </div>
      
      {isLoading ? (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border/50 bg-background/50">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-6 py-3 text-center text-sm font-semibold"
            >
              <div className="h-4 w-20 mx-auto bg-gray-300 rounded animate-pulse"></div>
            </th>
          ))}
          {(onEdit || onDelete) && (
            <th className="px-6 py-3">
              <div className="h-4 w-20 mx-auto bg-gray-300 rounded animate-pulse"></div>
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {[...Array(6)].map((_, row) => (
          <tr key={row} className="border-b border-border/50">
            {columns.map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              </td>
            ))}

            {(onEdit || onDelete) && (
              <td className="px-6 py-4 flex justify-center gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
               
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) :
        displayData.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">{emptyState}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full ">
                <thead>
                  <tr className="border-b border-border/50 bg-background/50 ">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-6 py-3 text-center text-sm font-semibold text-foreground "
                      >
                        {col.label}
                      </th>
                    ))}
                    {(onEdit || onDelete) && (
                      <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="border-b border-border/50 hover:bg-background/30 transition-colors duration-150"
                    >
                      {columns.map((col) => {
                        const color = col.key === "color" ? item.color : null;

                        return (
                          <td
                            key={col.key}
                            className={`px-6 py-4 text-sm text-center ${color ? "font-bold" : "text-foreground"}`}
                            style={color ? { color } : {}}
                          >
                            {col.render ? col.render(item[col.key], item) : item[col.key]}
                          </td>
                        );
                      })}
                      {(onEdit || onDelete) && (
                        <td className="px-6 py-4 text-sm space-x-2 flex gap-2 justify-center">
                          {onEdit && (
                            <Button
                              onClick={() => onEdit(item)}
                              variant="outline"
                              size="sm"
                              className="bg-background hover:bg-primary hover:text-primary-foreground text-foreground border-border/50 gap-1"
                            >
                              <Edit2 size={14} />
                              Edit
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              onClick={() => onDelete(item)}
                              variant="outline"
                              size="sm"
                              className="bg-background hover:bg-destructive hover:text-destructive-foreground text-destructive border-border/50 gap-1"
                            >
                              <Trash2 size={14} />
                              Delete
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-border/50 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="border-border/50 bg-background hover:bg-secondary text-foreground"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                    className="border-border/50 bg-background hover:bg-secondary text-foreground"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
    </Card>
  )
}
