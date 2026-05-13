import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
        <SearchX size={36} className="text-orange-400" />
      </div>
      <h1 className="text-7xl font-extrabold text-slate-200">404</h1>
      <h2 className="mt-2 text-xl font-bold text-slate-900">Sayfa Bulunamadı</h2>
      <p className="mt-3 max-w-sm text-slate-500">
        Aradığınız sayfa mevcut değil ya da taşınmış olabilir.
      </p>
      <Link to="/" className="mt-6">
        <Button variant="primary" size="lg" className="gap-2">
          <Home size={16} />
          Ana Sayfaya Dön
        </Button>
      </Link>
    </div>
  )
}
