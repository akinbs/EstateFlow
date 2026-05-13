import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Bir hata oluştu',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
        <AlertCircle size={24} className="text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="outline" size="md" className="mt-6 gap-2" onClick={onRetry}>
          <RefreshCw size={14} />
          Tekrar Dene
        </Button>
      )}
    </div>
  )
}
