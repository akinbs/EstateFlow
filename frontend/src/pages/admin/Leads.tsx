import { MessageSquare, Mail, Phone, Calendar } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import type { BadgeVariant } from '../../components/ui/Badge'

const mockLeads = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '0532 111 22 33',
    propertyTitle: 'Boğaz Manzaralı Lüks Daire',
    message: 'Merhaba, bu ilan hakkında bilgi almak istiyorum. Müsait olduğunuzda arayın.',
    status: 'new',
    createdAt: '2026-05-12T10:30:00Z',
  },
  {
    id: '2',
    name: 'Fatma Kaya',
    email: 'fatma@example.com',
    phone: '0555 444 55 66',
    propertyTitle: "Çeşme'de Denize Sıfır Villa",
    message: 'Villa için randevu almak istiyorum.',
    status: 'contacted',
    createdAt: '2026-05-11T14:00:00Z',
  },
  {
    id: '3',
    name: 'Mehmet Demir',
    email: 'mehmet@example.com',
    phone: '0543 777 88 99',
    propertyTitle: "Ankara Çankaya'da 2+1",
    message: 'Daire için daha fazla fotoğraf paylaşabilir misiniz?',
    status: 'closed',
    createdAt: '2026-05-10T09:00:00Z',
  },
]

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  new:        { label: 'Yeni',               variant: 'warning' },
  contacted:  { label: 'İletişime Geçildi',  variant: 'info' },
  closed:     { label: 'Kapatıldı',          variant: 'default' },
}

export default function Leads() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <MessageSquare size={20} className="text-orange-500" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Müşteri Talepleri</h1>
          <p className="text-xs text-slate-400">{mockLeads.length} talep · Veriler Adım 9'da FastAPI'den gelecek</p>
        </div>
      </div>

      <div className="space-y-3">
        {mockLeads.map((lead) => {
          const { label, variant } = statusConfig[lead.status]
          return (
            <div key={lead.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    {lead.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-400">{lead.propertyTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={variant}>{label}</Badge>
                  <select
                    defaultValue={lead.status}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="new">Yeni</option>
                    <option value="contacted">İletişime Geçildi</option>
                    <option value="closed">Kapatıldı</option>
                  </select>
                </div>
              </div>

              <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm italic text-slate-600">
                "{lead.message}"
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail size={12} /> {lead.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {lead.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
