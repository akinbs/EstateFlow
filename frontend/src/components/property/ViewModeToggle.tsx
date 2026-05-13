import { LayoutGrid, List, Map } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { ViewMode } from '../../types/common'

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

const MODES: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
  { mode: 'list', icon: List, label: 'Liste' },
  { mode: 'map', icon: Map, label: 'Harita' },
]

export default function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
      {MODES.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          title={label}
          onClick={() => onChange(mode)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
            value === mode
              ? 'bg-orange-500 text-white'
              : 'text-slate-500 hover:bg-slate-50',
          )}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
