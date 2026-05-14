import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import PropertyImageUploader from '../../components/admin/PropertyImageUploader'
import {
  getAdminPropertyById,
  createProperty,
  updateProperty,
} from '../../services/api/adminApi'
import { uploadMultiplePropertyImages } from '../../services/firebase/storageService'
import type {
  PropertyFormValues,
  PropertyImage,
  PropertyCreatePayload,
} from '../../types/property'

const EMPTY_FORM: PropertyFormValues = {
  title: '',
  description: '',
  listingType: 'sale',
  propertyType: 'apartment',
  price: '',
  currency: 'TRY',
  city: '',
  district: '',
  neighborhood: '',
  addressText: '',
  lat: '',
  lng: '',
  rooms: '',
  bathrooms: '',
  grossArea: '',
  netArea: '',
  buildingAge: '',
  floor: '',
  totalFloors: '',
  heating: '',
  furnished: false,
  status: 'draft',
  featured: false,
}

function SelectField({
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {children}
      </select>
    </div>
  )
}

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState<PropertyFormValues>(EMPTY_FORM)
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')
  const [images, setImages] = useState<PropertyImage[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormValues, string>>>({})

  // Load property for edit mode
  useEffect(() => {
    if (!isEdit || !id) return
    let cancelled = false

    async function loadProperty() {
      setIsLoading(true)
      setSubmitError(null)
      try {
        const prop = await getAdminPropertyById(id!)
        if (cancelled) return
        setForm({
          title: prop.title,
          description: prop.description,
          listingType: prop.listingType,
          propertyType: prop.propertyType,
          price: String(prop.price),
          currency: prop.currency,
          city: prop.city,
          district: prop.district,
          neighborhood: prop.neighborhood,
          addressText: prop.addressText ?? '',
          lat: String(prop.location.lat),
          lng: String(prop.location.lng),
          rooms: prop.rooms,
          bathrooms: String(prop.bathrooms),
          grossArea: String(prop.grossArea),
          netArea: String(prop.netArea),
          buildingAge: String(prop.buildingAge),
          floor: String(prop.floor),
          totalFloors: String(prop.totalFloors),
          heating: prop.heating,
          furnished: prop.furnished,
          status: prop.status,
          featured: prop.featured,
        })
        setFeatures(prop.features ?? [])
        setImages(prop.images ?? [])
      } catch {
        if (!cancelled) setSubmitError('İlan bilgileri yüklenemedi.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadProperty()
    return () => { cancelled = true }
  }, [id, isEdit])

  function setField<K extends keyof PropertyFormValues>(key: K, value: PropertyFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function addFeature() {
    const trimmed = featureInput.trim()
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed])
    }
    setFeatureInput('')
  }

  function handleFeatureKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addFeature()
    }
  }

  function removeFeature(feat: string) {
    setFeatures(features.filter((f) => f !== feat))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof PropertyFormValues, string>> = {}

    if (!form.title.trim()) errs.title = 'Başlık zorunludur.'
    if (!form.description.trim()) errs.description = 'Açıklama zorunludur.'
    if (!form.price || parseFloat(form.price) <= 0) errs.price = 'Geçerli bir fiyat girin.'
    if (!form.city.trim()) errs.city = 'Şehir zorunludur.'
    if (!form.district.trim()) errs.district = 'İlçe zorunludur.'
    if (!form.neighborhood.trim()) errs.neighborhood = 'Mahalle zorunludur.'
    if (!form.rooms.trim()) errs.rooms = 'Oda sayısı zorunludur.'
    if (form.lat && isNaN(parseFloat(form.lat))) errs.lat = 'Geçerli bir enlem girin.'
    if (form.lng && isNaN(parseFloat(form.lng))) errs.lng = 'Geçerli bir boylam girin.'
    if (form.grossArea && parseFloat(form.grossArea) < 0) errs.grossArea = 'Alan 0\'dan küçük olamaz.'
    if (form.netArea && parseFloat(form.netArea) < 0) errs.netArea = 'Alan 0\'dan küçük olamaz.'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload: PropertyCreatePayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        listingType: form.listingType,
        propertyType: form.propertyType,
        price: parseFloat(form.price),
        currency: form.currency,
        city: form.city.trim(),
        district: form.district.trim(),
        neighborhood: form.neighborhood.trim(),
        addressText: form.addressText.trim() || undefined,
        location: {
          lat: parseFloat(form.lat) || 0,
          lng: parseFloat(form.lng) || 0,
        },
        rooms: form.rooms.trim(),
        bathrooms: parseInt(form.bathrooms) || 0,
        grossArea: parseInt(form.grossArea) || 0,
        netArea: parseInt(form.netArea) || 0,
        buildingAge: parseInt(form.buildingAge) || 0,
        floor: parseInt(form.floor) || 0,
        totalFloors: parseInt(form.totalFloors) || 1,
        heating: form.heating.trim(),
        furnished: form.furnished,
        features,
        status: form.status,
        featured: form.featured,
      }

      if (isEdit && id) {
        let allImages = [...images]
        if (pendingFiles.length > 0) {
          const uploaded = await uploadMultiplePropertyImages(pendingFiles, id)
          allImages = [...allImages, ...uploaded]
        }
        await updateProperty(id, { ...payload, images: allImages })
      } else {
        // Create with empty images first
        const created = await createProperty({ ...payload, images: [] })
        // Then upload and attach
        if (pendingFiles.length > 0) {
          const uploaded = await uploadMultiplePropertyImages(pendingFiles, created.id)
          await updateProperty(created.id, { images: uploaded })
        }
      }

      setSubmitSuccess(true)
      setTimeout(() => navigate('/admin/properties'), 1200)
    } catch (err) {
      setSubmitError(
        isEdit
          ? 'İlan güncellenemedi. Lütfen tekrar deneyin.'
          : 'İlan oluşturulamadı. Lütfen tekrar deneyin.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
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
          {isEdit && id && (
            <p className="text-xs text-slate-400">ID: {id}</p>
          )}
        </div>
      </div>

      {/* Error / Success banners */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 size={16} className="shrink-0" />
          {isEdit ? 'İlan güncellendi!' : 'İlan oluşturuldu!'} Yönlendiriliyorsunuz…
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* ── Temel Bilgiler ───────────────────────────────── */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="İlan Başlığı *"
                placeholder="Örn: Beşiktaş'ta Deniz Manzaralı 3+1"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                error={errors.title}
                disabled={isSubmitting}
                fullWidth
              />
            </div>

            <SelectField
              label="İlan Tipi"
              value={form.listingType}
              onChange={(v) => setField('listingType', v as PropertyFormValues['listingType'])}
              disabled={isSubmitting}
            >
              <option value="sale">Satılık</option>
              <option value="rent">Kiralık</option>
            </SelectField>

            <SelectField
              label="Emlak Tipi"
              value={form.propertyType}
              onChange={(v) => setField('propertyType', v as PropertyFormValues['propertyType'])}
              disabled={isSubmitting}
            >
              <option value="apartment">Daire</option>
              <option value="house">Müstakil Ev</option>
              <option value="villa">Villa</option>
              <option value="land">Arsa</option>
              <option value="office">Ofis</option>
              <option value="commercial">İş Yeri</option>
            </SelectField>

            <Input
              label="Fiyat *"
              type="number"
              min={1}
              placeholder="0"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              error={errors.price}
              disabled={isSubmitting}
              fullWidth
            />

            <SelectField
              label="Para Birimi"
              value={form.currency}
              onChange={(v) => setField('currency', v as PropertyFormValues['currency'])}
              disabled={isSubmitting}
            >
              <option value="TRY">TRY (₺)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </SelectField>

            <SelectField
              label="Durum"
              value={form.status}
              onChange={(v) => setField('status', v as PropertyFormValues['status'])}
              disabled={isSubmitting}
            >
              <option value="draft">Taslak</option>
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
              <option value="sold">Satıldı</option>
              <option value="rented">Kiralandı</option>
            </SelectField>

            <div className="flex flex-col justify-end gap-2 pb-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setField('featured', e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded accent-orange-500"
                />
                <span>Öne çıkan ilan olarak işaretle</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Açıklama *
            </label>
            <textarea
              rows={5}
              placeholder="İlan açıklamasını yazın..."
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              disabled={isSubmitting}
              className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 ${
                errors.description ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>
        </section>

        {/* ── Konum ────────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Konum</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Şehir *"
              placeholder="İstanbul"
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              error={errors.city}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="İlçe *"
              placeholder="Beşiktaş"
              value={form.district}
              onChange={(e) => setField('district', e.target.value)}
              error={errors.district}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="Mahalle *"
              placeholder="Sinanpaşa"
              value={form.neighborhood}
              onChange={(e) => setField('neighborhood', e.target.value)}
              error={errors.neighborhood}
              disabled={isSubmitting}
              fullWidth
            />
          </div>
          <div className="mt-4">
            <Input
              label="Adres (opsiyonel)"
              placeholder="Detaylı adres bilgisi"
              value={form.addressText}
              onChange={(e) => setField('addressText', e.target.value)}
              disabled={isSubmitting}
              fullWidth
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Input
              label="Enlem (lat)"
              type="number"
              step="any"
              placeholder="41.0438"
              value={form.lat}
              onChange={(e) => setField('lat', e.target.value)}
              error={errors.lat}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="Boylam (lng)"
              type="number"
              step="any"
              placeholder="29.0064"
              value={form.lng}
              onChange={(e) => setField('lng', e.target.value)}
              error={errors.lng}
              disabled={isSubmitting}
              fullWidth
            />
          </div>
        </section>

        {/* ── Emlak Detayları ───────────────────────────────── */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Emlak Detayları</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input
              label="Oda Sayısı *"
              placeholder="3+1"
              value={form.rooms}
              onChange={(e) => setField('rooms', e.target.value)}
              error={errors.rooms}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="Banyo"
              type="number"
              min={0}
              placeholder="2"
              value={form.bathrooms}
              onChange={(e) => setField('bathrooms', e.target.value)}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="Net Alan (m²)"
              type="number"
              min={0}
              placeholder="120"
              value={form.netArea}
              onChange={(e) => setField('netArea', e.target.value)}
              error={errors.netArea}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="Brüt Alan (m²)"
              type="number"
              min={0}
              placeholder="145"
              value={form.grossArea}
              onChange={(e) => setField('grossArea', e.target.value)}
              error={errors.grossArea}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="Bina Yaşı"
              type="number"
              min={0}
              placeholder="5"
              value={form.buildingAge}
              onChange={(e) => setField('buildingAge', e.target.value)}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="Bulunduğu Kat"
              type="number"
              placeholder="3"
              value={form.floor}
              onChange={(e) => setField('floor', e.target.value)}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="Toplam Kat"
              type="number"
              min={1}
              placeholder="8"
              value={form.totalFloors}
              onChange={(e) => setField('totalFloors', e.target.value)}
              disabled={isSubmitting}
              fullWidth
            />
            <Input
              label="Isıtma"
              placeholder="Kombi"
              value={form.heating}
              onChange={(e) => setField('heating', e.target.value)}
              disabled={isSubmitting}
              fullWidth
            />
          </div>
          <div className="mt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.furnished}
                onChange={(e) => setField('furnished', e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded accent-orange-500"
              />
              <span>Eşyalı</span>
            </label>
          </div>
        </section>

        {/* ── Özellikler ────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Özellikler</h2>
          <p className="mb-3 text-xs text-slate-400">
            Özellik yazın ve Enter veya virgülle ekleyin (örn: Otopark, Güvenlik, Havuz)
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={handleFeatureKeyDown}
              placeholder="Özellik ekle…"
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFeature}
              disabled={!featureInput.trim() || isSubmitting}
            >
              Ekle
            </Button>
          </div>

          {features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {features.map((feat) => (
                <span
                  key={feat}
                  className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                >
                  {feat}
                  <button
                    type="button"
                    onClick={() => removeFeature(feat)}
                    disabled={isSubmitting}
                    className="flex items-center text-orange-400 hover:text-orange-600 disabled:opacity-50"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Fotoğraflar ───────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Fotoğraflar</h2>
          <p className="mb-3 text-xs text-slate-400">
            {isEdit
              ? 'Yeni fotoğraflar Storage\'a yüklenir ve property\'ye eklenir.'
              : 'İlan oluşturulduktan sonra fotoğraflar Storage\'a yüklenecek.'}
          </p>
          <PropertyImageUploader
            images={images}
            onImagesChange={setImages}
            pendingFiles={pendingFiles}
            onPendingFilesChange={setPendingFiles}
            disabled={isSubmitting}
          />
        </section>

        {/* ── Submit ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting || submitSuccess}
          >
            {isEdit ? 'İlanı Güncelle' : 'İlanı Yayınla'}
          </Button>
          <Link to="/admin/properties">
            <Button type="button" variant="outline" size="lg" disabled={isSubmitting}>
              İptal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
