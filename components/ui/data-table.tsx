import * as React from "react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { Button } from "./button"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

// Column Definition
export interface ColumnDef<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
}

// Data Table Props
export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  pagination?: {
    pageSize: number
    showSizeSelector?: boolean
  }
  sorting?: {
    enabled: boolean
    defaultSort?: {
      column: string
      direction: "asc" | "desc"
    }
  }
  filtering?: {
    enabled: boolean
    filters?: Array<{
      column: string
      label: string
      options: Array<{ label: string; value: string }>
    }>
  }
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  pagination = { pageSize: 10, showSizeSelector: true },
  sorting = { enabled: true },
  filtering = { enabled: false },
  onRowClick,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  // State
  const [searchTerm, setSearchTerm] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(pagination.pageSize)
  const [sortConfig, setSortConfig] = React.useState<{
    column: string
    direction: "asc" | "desc"
  } | null>(sorting.defaultSort || null)
  const [filters, setFilters] = React.useState<Record<string, string>>({})

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchable && searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          if (column.accessorKey) {
            const value = row[column.accessorKey]
            return String(value).toLowerCase().includes(searchTerm.toLowerCase())
          }
          return false
        })
      )
    }

    // Apply column filters
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = columns.find(col => col.id === columnId)
        if (column?.accessorKey) {
          filtered = filtered.filter(row => 
            String(row[column.accessorKey]).toLowerCase() === filterValue.toLowerCase()
          )
        }
      }
    })

    return filtered
  }, [data, searchTerm, filters, columns, searchable])

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig || !sorting.enabled) return filteredData

    const column = columns.find(col => col.id === sortConfig.column)
    if (!column?.accessorKey) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[column.accessorKey!]
      const bValue = b[column.accessorKey!]

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig, columns, sorting.enabled])

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, sortedData.length)

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (!sorting.enabled) return

    setSortConfig(prev => {
      if (prev?.column === columnId) {
        return {
          column: columnId,
          direction: prev.direction === "asc" ? "desc" : "asc"
        }
      }
      return { column: columnId, direction: "asc" }
    })
  }

  // Handle filter change
  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Reset current page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {searchable && (
          <div className="w-full sm:max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {filtering.enabled && filtering.filters && (
          <div className="flex gap-2 flex-wrap">
            {filtering.filters.map(filter => (
              <Select
                key={filter.column}
                value={filters[filter.column] || ""}
                onValueChange={(value) => handleFilterChange(filter.column, value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All {filter.label}</SelectItem>
                  {filter.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border border-cyber-border bg-cyber-surface/20 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead 
                  key={column.id}
                  className={cn(
                    column.sortable && sorting.enabled && "cursor-pointer hover:bg-cyber-surface/30",
                    column.width && `w-${column.width}`
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.header}</span>
                    {column.sortable && sorting.enabled && (
                      <SortIcon 
                        direction={
                          sortConfig?.column === column.id 
                            ? sortConfig.direction 
                            : null
                        } 
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map(column => (
                    <TableCell key={column.id}>
                      <div className="h-4 bg-cyber-surface/50 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <div className="text-gray-400">
                    {emptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              paginatedData.map((row, index) => (
                <TableRow 
                  key={index}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-cyber-surface/30"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(column => (
                    <TableCell key={column.id}>
                      {column.cell 
                        ? column.cell(row)
                        : column.accessorKey 
                          ? String(row[column.accessorKey])
                          : ""
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            Showing {startItem} to {endItem} of {sortedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            {pagination.showSizeSelector && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Rows per page:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map(size => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-400 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Sort Icon Component
const SortIcon: React.FC<{ direction: "asc" | "desc" | null }> = ({ direction }) => {
  return (
    <div className="flex flex-col">
      <svg 
        className={cn(
          "h-3 w-3 -mb-1",
          direction === "asc" ? "text-cyber-cyan" : "text-gray-400"
        )} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <polyline points="18,15 12,9 6,15" />
      </svg>
      <svg 
        className={cn(
          "h-3 w-3",
          direction === "desc" ? "text-cyber-cyan" : "text-gray-400"
        )} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <polyline points="6,9 12,15 18,9" />
      </svg>
    </div>
  )
}