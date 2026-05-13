import { CheckCircle2 } from 'lucide-react'

interface PropertyFeaturesProps {
  features: string[]
}

export default function PropertyFeatures({ features }: PropertyFeaturesProps) {
  if (!features.length) return null

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-slate-900">Özellikler</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
            <CheckCircle2 size={15} className="shrink-0 text-orange-500" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
