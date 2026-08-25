'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  className,
}: TablePaginationProps) {
  if (totalItems === 0) return null

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems)
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }

      if (currentPage < totalPages - 2) pages.push('ellipsis')
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }

    return pages
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-100 text-xs text-gray-500 font-semibold select-none',
        className
      )}
    >
      {/* Left: Info & Per-Page Selector */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span>
          Menampilkan <strong className="text-primary-blue font-bold">{startItem}-{endItem}</strong> dari{' '}
          <strong className="text-primary-blue font-bold">{totalItems}</strong> data
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
            <span className="text-[11px] text-gray-400">Baris:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                if (val) {
                  onPageSizeChange(Number(val))
                  onPageChange(1)
                }
              }}
            >
              <SelectTrigger className="h-7 w-16 bg-[#F8F6F2] border-none rounded-lg text-xs font-bold text-primary-blue px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-primary-blue hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
            title="Halaman Pertama"
          >
            <ChevronsLeft size={15} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-primary-blue hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={15} />
          </Button>

          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((p, idx) => {
              if (p === 'ellipsis') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-300">
                    …
                  </span>
                )
              }
              const active = p === currentPage
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={cn(
                    'h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer',
                    active
                      ? 'bg-primary-green text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-primary-blue'
                  )}
                >
                  {p}
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-primary-blue hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
            title="Halaman Berikutnya"
          >
            <ChevronRight size={15} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-primary-blue hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
            title="Halaman Terakhir"
          >
            <ChevronsRight size={15} />
          </Button>
        </div>
      )}
    </div>
  )
}

export interface TableSearchFilterProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export function TableSearchFilter({
  value,
  onChange,
  placeholder = 'Cari data...',
  className,
}: TableSearchFilterProps) {
  return (
    <div className={cn('relative flex items-center min-w-[220px]', className)}>
      <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8.5 pr-8 bg-[#F8F6F2] border-transparent hover:border-gray-200 focus:border-primary-green/50 rounded-xl text-xs font-semibold h-9 w-full transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 cursor-pointer"
          title="Hapus pencarian"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
