import type { Property } from '../../types/property'

interface PropertyInfoGridProps {
  property: Property
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Daire',
  house: 'Ev',
  villa: 'Villa',
  land: 'Arsa',
  office: 'Ofis',
  commercial: 'İşyeri',
}

export default function PropertyInfoGrid({ property }: PropertyInfoGridProps) {
  const items: { label: string; value: string | number }[] = [
    { label: 'İlan Tipi', value: property.listingType === 'sale' ? 'Satılık' : 'Kiralık' },
    { label: 'Emlak Tipi', value: PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType },
    { label: 'Oda Sayısı', value: property.rooms },
    { label: 'Banyo Sayısı', value: property.bathrooms },
    { label: 'Net Alan', value: `${property.netArea} m²` },
    { label: 'Brüt Alan', value: `${property.grossArea} m²` },
    { label: 'Bina Yaşı', value: `${property.buildingAge} yıl` },
    { label: 'Bulunduğu Kat', value: property.floor },
    { label: 'Toplam Kat', value: property.totalFloors },
    { label: 'Isıtma', value: property.heating },
    { label: 'Eşyalı', value: property.furnished ? 'Evet' : 'Hayır' },
  ]

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-slate-900">İlan Detayları</h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
        {items.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-xs text-slate-400">{label}</dt>
            <dd className="text-sm font-semibold text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
