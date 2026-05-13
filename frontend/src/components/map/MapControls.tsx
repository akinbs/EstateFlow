import type { ViewMode } from '../../types/common'
import Button from '../ui/Button'

interface MapControlsProps {
  onSwitchView: (mode: ViewMode) => void
}

export default function MapControls({ onSwitchView }: MapControlsProps) {
  return (
    <div className="absolute right-4 top-4 z-[999] flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="bg-white/90 backdrop-blur-sm shadow"
        onClick={() => onSwitchView('list')}
      >
        Listeye Dön
      </Button>
    </div>
  )
}
