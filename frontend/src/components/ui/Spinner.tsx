import { cn } from '../../utils/cn'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-11 w-11 border-3',
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Yükleniyor"
      className={cn(
        'inline-block animate-spin rounded-full border-orange-500 border-t-transparent',
        sizeClasses[size],
        className,
      )}
    />
  )
}
