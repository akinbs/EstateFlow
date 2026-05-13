import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  onPageChange: (page: number) => void
}

export default function Pagination({
  page,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageWindow(page, totalPages)

  return (
    <nav aria-label="Sayfalama" className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        aria-label="Önceki sayfa"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all',
          hasPrev
            ? 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600'
            : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300',
        )}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, idx) =>
        p === '…' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-medium transition-all',
              p === page
                ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        aria-label="Sonraki sayfa"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all',
          hasNext
            ? 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600'
            : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300',
        )}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}

function buildPageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = [1]

  if (current > 3) pages.push('…')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('…')
  pages.push(total)

  return pages
}
