import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, TrendingUp, Shield, Headphones, BedDouble, Bath, Maximize2 } from 'lucide-react'
import Button from '../components/ui/Button'
import PropertyCard from '../components/property/PropertyCard'
import LoadingGrid from '../components/ui/LoadingGrid'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import { getFeaturedProperties } from '../services/api/propertyApi'
import type { PropertyListItem, ListingType } from '../types/property'
import { mockProperties } from '../utils/mockData'
import { buildSearchParamsFromFilters } from '../utils/queryParams'
import { formatPrice } from '../utils/formatPrice'

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Daire',
  house: 'Ev',
  villa: 'Villa',
  commercial: 'Ticari',
  office: 'Ofis',
  land: 'Arsa',
}

const stats = [
  { label: 'Aktif İlan', value: '12.400+' },
  { label: 'Mutlu Müşteri', value: '8.200+' },
  { label: 'Şehir', value: '81' },
  { label: 'Uzman Emlakçı', value: '340+' },
]

const features = [
  {
    icon: MapPin,
    title: 'Harita ile Keşfet',
    description: 'İstediğiniz bölgedeki ilanları harita üzerinde görün, konuma göre filtreleyin.',
  },
  {
    icon: TrendingUp,
    title: 'Piyasa Analizi',
    description: 'Güncel fiyat verileri ve bölgesel trendlerle doğru yatırım kararı alın.',
  },
  {
    icon: Shield,
    title: 'Güvenli Platform',
    description: 'Doğrulanmış ilanlar ve güvenli iletişim sistemi ile güvende kalın.',
  },
  {
    icon: Headphones,
    title: '7/24 Destek',
    description: 'Uzman ekibimiz her soru ve sorununuzda yanınızda.',
  },
]

export default function Home() {
  const navigate = useNavigate()

  // Hero search state
  const [searchCity, setSearchCity] = useState('')
  const [searchListingType, setSearchListingType] = useState<ListingType | ''>('')

  // Featured properties state
  const [featured, setFeatured] = useState<PropertyListItem[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredError, setFeaturedError] = useState<string | null>(null)
  const [bannerProperty, setBannerProperty] = useState<PropertyListItem | null>(null)

  function loadFeatured() {
    setFeaturedLoading(true)
    setFeaturedError(null)
    getFeaturedProperties(6)
      .then((props) => {
        setFeatured(props)
        if (props.length > 0) {
          setBannerProperty(props[Math.floor(Math.random() * props.length)])
        }
      })
      .catch(() => {
        const fallback = mockProperties.slice(0, 6) as PropertyListItem[]
        setFeatured(fallback)
        setBannerProperty(fallback[0])
      })
      .finally(() => setFeaturedLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadFeatured() }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const filters = {
      listingType: searchListingType || undefined,
      city: searchCity.trim() || undefined,
    }
    const params = buildSearchParamsFromFilters(filters)
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white lg:py-28">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900/30" />
        {/* Dot grid */}
        <div className="hero-dot-grid absolute inset-0 opacity-[0.035]" />
        {/* Ambient orbs */}
        <div className="animate-hero-glow absolute -right-24 -top-24 h-[480px] w-[480px] rounded-full bg-orange-500/20 blur-3xl" />
        <div
          className="animate-hero-glow absolute bottom-0 left-1/3 h-64 w-64 translate-y-1/3 rounded-full bg-orange-600/15 blur-3xl"
          style={{ animationDelay: '2s' }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* ── Left — content ── */}
            <div className="max-w-2xl">
              <p className="hero-enter-1 mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">
                Türkiye'nin Modern Emlak Platformu
              </p>
              <h1 className="hero-enter-2 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Hayalindeki evi
                <br />
                <span className="text-orange-400">EstateFlow ile</span>
                <br />
                keşfet
              </h1>
              <p className="hero-enter-3 mt-5 text-lg text-slate-400">
                Binlerce satılık ve kiralık ilan arasından filtreleyerek mükemmel mülkünüzü keşfedin.
              </p>

              {/* Search form */}
              <form
                onSubmit={handleSearch}
                className="hero-enter-4 mt-8 flex flex-col gap-3 rounded-2xl bg-white p-3 sm:flex-row"
              >
                <select
                  value={searchListingType}
                  onChange={(e) => setSearchListingType(e.target.value as ListingType | '')}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tüm İlanlar</option>
                  <option value="sale">Satılık</option>
                  <option value="rent">Kiralık</option>
                </select>
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Şehir veya ilçe ara..."
                    className="w-full rounded-xl bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full gap-2 sm:w-auto">
                  <Search size={16} />
                  Ara
                </Button>
              </form>

              {/* Quick links */}
              <div className="hero-enter-5 mt-4 flex flex-wrap gap-2">
                {['İstanbul', 'Ankara', 'İzmir'].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      const params = buildSearchParamsFromFilters({ city })
                      navigate(`/properties?${params.toString()}`)
                    }}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Right — frame animation (desktop only) ── */}
            <div className="hidden lg:flex lg:justify-center">
              <div className="relative h-[420px] w-[340px]">
                {/* Main glassmorphism property card */}
                <Link
                  to={bannerProperty ? `/properties/${bannerProperty.slug}` : '/properties'}
                  className="animate-hero-float absolute inset-x-0 top-0 block rounded-3xl border border-white/10 bg-white/6 p-5 shadow-2xl backdrop-blur-md transition-opacity hover:opacity-90"
                >
                  {/* Image area */}
                  <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800">
                    {bannerProperty?.images?.[0]?.url ? (
                      <img
                        src={bannerProperty.images[0].url}
                        alt={bannerProperty.title}
                        className="h-full w-full object-cover opacity-75"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        {bannerProperty?.listingType === 'rent' ? 'Kiralık' : 'Satılık'}
                      </span>
                      <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                        {bannerProperty ? (PROPERTY_TYPE_LABELS[bannerProperty.propertyType] ?? bannerProperty.propertyType) : 'Villa'}
                      </span>
                    </div>
                  </div>
                  {/* Card info */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-xl font-bold text-white">
                        {bannerProperty
                          ? formatPrice(bannerProperty.price, bannerProperty.currency as 'TRY' | 'USD' | 'EUR')
                          : '₺8.500.000'}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                        <MapPin size={11} />
                        {bannerProperty ? `${bannerProperty.district}, ${bannerProperty.city}` : 'Sarıyer, İstanbul'}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-300">
                      {bannerProperty?.title ?? 'Modern Villa, Deniz Manzaralı'}
                    </p>
                    <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
                      <span className="flex items-center gap-1 rounded-lg bg-white/8 px-2.5 py-1.5 text-xs text-slate-300">
                        <BedDouble size={11} />
                        {bannerProperty?.rooms ?? '4+1'}
                      </span>
                      <span className="flex items-center gap-1 rounded-lg bg-white/8 px-2.5 py-1.5 text-xs text-slate-300">
                        <Bath size={11} />
                        {bannerProperty ? `${bannerProperty.bathrooms} Banyo` : '3 Banyo'}
                      </span>
                      <span className="flex items-center gap-1 rounded-lg bg-white/8 px-2.5 py-1.5 text-xs text-slate-300">
                        <Maximize2 size={11} />
                        {bannerProperty ? `${bannerProperty.grossArea} m²` : '280 m²'}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Floating stat — active listings */}
                <div
                  className="animate-hero-float-b absolute -left-12 top-10 rounded-2xl border border-white/10 bg-slate-800/90 px-4 py-3 shadow-xl backdrop-blur-sm"
                  style={{ animationDelay: '0.8s' }}
                >
                  <p className="text-[11px] text-slate-400">Aktif İlan</p>
                  <p className="text-2xl font-extrabold text-white">12.4K+</p>
                </div>

                {/* Floating stat — new this week */}
                <div
                  className="animate-hero-float absolute -right-10 bottom-10 rounded-2xl border border-orange-500/25 bg-orange-500/10 px-4 py-3 shadow-xl backdrop-blur-sm"
                  style={{ animationDelay: '1.6s' }}
                >
                  <p className="text-[11px] text-orange-300">Bu Hafta</p>
                  <p className="text-2xl font-extrabold text-white">+127</p>
                  <p className="text-[11px] text-orange-400">yeni ilan</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-slate-100 sm:grid-cols-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="group cursor-default py-8 text-center transition-colors hover:bg-orange-50/60">
                <p className="text-3xl font-extrabold text-slate-900 transition-colors group-hover:text-orange-600">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Properties ──────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
                Öne Çıkanlar
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Seçili İlanlar</h2>
            </div>
            <Link to="/properties">
              <Button variant="outline" size="sm">Tümünü Gör</Button>
            </Link>
          </div>

          {featuredLoading && <LoadingGrid count={6} />}

          {!featuredLoading && featuredError && (
            <ErrorState
              message={featuredError}
              onRetry={loadFeatured}
            />
          )}

          {!featuredLoading && !featuredError && featured.length === 0 && (
            <EmptyState
              title="Henüz öne çıkan ilan yok"
              description="Yakında burada seçili ilanlar görünecek."
              actionLabel="Tüm İlanları Gör"
              onAction={() => navigate('/properties')}
            />
          )}

          {!featuredLoading && !featuredError && featured.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
              Neden EstateFlow?
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Farkımız</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-orange-100 hover:bg-white hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 transition-all duration-200 group-hover:bg-orange-500 group-hover:shadow-md group-hover:shadow-orange-200">
                  <Icon size={22} className="text-orange-500 transition-colors duration-200 group-hover:text-white" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Tüm ilanları keşfetmeye hazır mısınız?
          </h2>
          <p className="mt-3 text-orange-100">
            Binlerce güncel ilan sizi bekliyor. Filtreleyerek idealinizi bulun.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/properties">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                İlanları İncele
              </Button>
            </Link>
            <Link to="/properties?listingType=sale">
              <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                Satılık İlanlar
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
