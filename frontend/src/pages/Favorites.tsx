import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import PropertyCard from '../components/property/PropertyCard'
import Button from '../components/ui/Button'
import { useFavoriteStore } from '../features/favorites/favoriteStore'

export default function Favorites() {
  const { favorites, clearFavorites } = useFavoriteStore()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart size={22} className="text-orange-500" fill="currentColor" />
          <h1 className="text-2xl font-bold text-slate-900">Favorilerim</h1>
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-600">
            {favorites.length}
          </span>
        </div>
        {favorites.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFavorites}>
            Tümünü Temizle
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Heart size={28} className="text-slate-300" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700">Henüz favori eklenmedi</h2>
          <p className="mt-2 text-sm text-slate-400">
            İlan kartlarındaki kalp ikonuna tıklayarak favorilere ekleyin.
          </p>
          <Link to="/properties" className="mt-5">
            <Button variant="primary">İlanları Keşfet</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
