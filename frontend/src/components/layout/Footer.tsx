import { Link } from 'react-router-dom'
import { Building2, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  'Keşfet': [
    { label: 'Satılık İlanlar', href: '/properties?listingType=sale' },
    { label: 'Kiralık İlanlar', href: '/properties?listingType=rent' },
    { label: 'Öne Çıkan İlanlar', href: '/properties?featured=true' },
    { label: 'Harita Görünümü', href: '/properties?view=map' },
  ],
  'Hesap': [
    { label: 'Giriş Yap', href: '/login' },
    { label: 'Favorilerim', href: '/favorites' },
    { label: 'Karşılaştır', href: '/compare' },
  ],
  'Kurumsal': [
    { label: 'Admin Panel', href: '/admin' },
    { label: 'İlan Ekle', href: '/admin/properties/new' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
                <Building2 size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold">
                Estate<span className="text-orange-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              Türkiye'nin modern emlak platformu. Satılık, kiralık ilanları
              keşfedin, harita üzerinde görüntüleyin.
            </p>
            <div className="space-y-1.5 text-sm">
              <a href="mailto:info@estateflow.com" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <Mail size={14} /> info@estateflow.com
              </a>
              <a href="tel:+902121234567" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                <Phone size={14} /> +90 212 123 45 67
              </a>
              <span className="flex items-center gap-2">
                <MapPin size={14} /> İstanbul, Türkiye
              </span>
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
                {group}
              </h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      to={href}
                      className="text-sm text-slate-500 transition-colors hover:text-orange-400"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} EstateFlow. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}
