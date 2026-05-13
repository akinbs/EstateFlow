import { Building2, Eye, MessageSquare, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { mockProperties } from '../../utils/mockData'

const stats = [
  { label: 'Toplam İlan', value: '124', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Aktif İlan', value: '98', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Toplam Görüntülenme', value: '4.820', icon: Eye, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Bekleyen Talep', value: '17', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-500">EstateFlow Admin Paneli</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 pt-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent properties */}
        <Card>
          <CardHeader>
            <CardTitle>Son İlanlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockProperties.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img
                    src={p.images[0]?.url}
                    alt={p.title}
                    className="h-10 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{p.title}</p>
                    <p className="text-xs text-slate-400">{p.city} · {p.listingType === 'sale' ? 'Satılık' : 'Kiralık'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.status === 'active' ? 'Aktif' : p.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent leads placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Son Talepler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Ahmet Yılmaz', property: 'Boğaz Manzaralı Lüks Daire', time: '2 saat önce', status: 'new' },
                { name: 'Fatma Kaya', property: 'Çeşme\'de Denize Sıfır Villa', time: '5 saat önce', status: 'contacted' },
                { name: 'Mehmet Demir', property: 'Ankara Çankaya\'da 2+1', time: '1 gün önce', status: 'new' },
              ].map(({ name, property, time, status }) => (
                <div key={name} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{name}</p>
                    <p className="truncate text-xs text-slate-400">{property}</p>
                    <p className="text-xs text-slate-300">{time}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    status === 'new'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {status === 'new' ? 'Yeni' : 'İletişime Geçildi'}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Gerçek veriler Adım 9'da FastAPI'den gelecek
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
