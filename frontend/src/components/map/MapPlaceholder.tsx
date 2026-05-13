import { Map } from 'lucide-react'

interface MapPlaceholderProps {
  className?: string
  message?: string
}

export default function MapPlaceholder({
  className = '',
  message = 'Harita görünümü Adım 7\'de Leaflet + OpenStreetMap ile entegre edilecek.',
}: MapPlaceholderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Map size={32} className="text-slate-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500">Harita Yükleniyor</p>
        <p className="mt-1 max-w-xs text-xs text-slate-400">{message}</p>
      </div>
    </div>
  )
}
