import { cn } from '../../utils/cn'

interface LoadingGridProps {
  count?: number
  className?: string
}

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded-lg bg-slate-100" />
        <div className="flex gap-3">
          <div className="h-3 w-12 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-3 w-12 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-3 w-16 animate-pulse rounded-lg bg-slate-100" />
        </div>
        <div className="mt-2 h-5 w-1/3 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  )
}

export default function LoadingGrid({ count = 6, className }: LoadingGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
