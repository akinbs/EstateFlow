import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Info } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/admin/properties">
          <Button variant="ghost" size="sm" className="gap-1.5 text-slate-500">
            <ArrowLeft size={14} />
            Geri
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}
          </h1>
          <p className="text-xs text-slate-400">
            {isEdit ? `ID: ${id}` : 'Yeni ilan oluşturun'}
          </p>
        </div>
      </div>

      {/* Dev note */}
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3">
        <Info size={14} className="mt-0.5 shrink-0 text-blue-500" />
        <p className="text-xs text-blue-700">
          Bu form iskeleti Adım 9'da FastAPI CRUD endpoint'lerine ve Firebase Storage'a bağlanacak.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          alert('Form Adım 9\'da backend\'e bağlanacak.')
        }}
        className="space-y-5"
      >
        {/* Basic info */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="İlan Başlığı" placeholder="Örn: Beşiktaş'ta 3+1 Daire" fullWidth />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">İlan Tipi</label>
              <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="sale">Satılık</option>
                <option value="rent">Kiralık</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Emlak Tipi</label>
              <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="apartment">Daire</option>
                <option value="house">Müstakil Ev</option>
                <option value="villa">Villa</option>
                <option value="land">Arsa</option>
                <option value="office">Ofis</option>
                <option value="commercial">İş Yeri</option>
              </select>
            </div>
            <Input label="Fiyat (₺)" type="number" placeholder="0" fullWidth />
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Açıklama</label>
            <textarea
              rows={4}
              placeholder="İlan açıklamasını yazın..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        </div>

        {/* Location */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Konum</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Şehir" placeholder="İstanbul" fullWidth />
            <Input label="İlçe" placeholder="Beşiktaş" fullWidth />
            <Input label="Mahalle" placeholder="Sinanpaşa" fullWidth />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <Input label="Enlem (lat)" type="number" placeholder="41.0438" fullWidth />
            <Input label="Boylam (lng)" type="number" placeholder="29.0064" fullWidth />
          </div>
        </div>

        {/* Property details */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Emlak Detayları</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Input label="Oda Sayısı" placeholder="3+1" fullWidth />
            <Input label="Banyo" type="number" placeholder="2" fullWidth />
            <Input label="Net Alan (m²)" type="number" placeholder="120" fullWidth />
            <Input label="Brüt Alan (m²)" type="number" placeholder="145" fullWidth />
            <Input label="Bina Yaşı" type="number" placeholder="5" fullWidth />
            <Input label="Bulunduğu Kat" type="number" placeholder="3" fullWidth />
            <Input label="Toplam Kat" type="number" placeholder="8" fullWidth />
            <Input label="Isıtma" placeholder="Kombi" fullWidth />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input type="checkbox" id="furnished" className="rounded accent-orange-500" />
            <label htmlFor="furnished" className="text-sm text-slate-700">Eşyalı</label>
          </div>
        </div>

        {/* Photo upload */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Fotoğraflar</h2>
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 text-center">
            <Upload size={28} className="text-slate-300" />
            <p className="text-sm text-slate-500">Fotoğraf sürükle & bırak</p>
            <p className="text-xs text-slate-400">Firebase Storage entegrasyonu Adım 9'da eklenecek</p>
            <Button type="button" variant="outline" size="sm" disabled>
              Fotoğraf Seç
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="lg">
            {isEdit ? 'Güncelle' : 'İlanı Yayınla'}
          </Button>
          <Link to="/admin/properties">
            <Button type="button" variant="outline" size="lg">İptal</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
