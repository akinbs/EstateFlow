import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PropertyImage } from '../../types/property'

interface ImageLightboxProps {
  images: PropertyImage[]
  index: number
  title: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function ImageLightbox({
  images,
  index,
  title,
  onClose,
  onPrev,
  onNext,
}: ImageLightboxProps) {
  const current = images[index]
  const hasMultiple = images.length > 1

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasMultiple) onPrev()
      if (e.key === 'ArrowRight' && hasMultiple) onNext()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext, hasMultiple])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Kapat"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
        {index + 1} / {images.length}
      </span>

      {/* Prev */}
      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Önceki"
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Image */}
      {current && (
        <img
          src={current.url}
          alt={current.alt ?? title}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] max-w-[85vw] select-none rounded-lg object-contain shadow-2xl"
        />
      )}

      {/* Next */}
      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Sonraki"
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  )
}
