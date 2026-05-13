import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-sm',
  secondary:
    'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 shadow-sm',
  outline:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400',
  ghost:
    'text-slate-700 hover:bg-slate-100 active:bg-slate-200',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium',
          'transition-all duration-150 cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button
