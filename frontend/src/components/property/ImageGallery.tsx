import { useState } from 'react'
import { Maximize2, ZoomIn } from 'lucide-react'
import type { PropertyImage } from '../../types/property'
import ImageLightbox from './ImageLightbox'

interface ImageGalleryProps {
  images: PropertyImage[]
  title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handlePrev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length)
  const handleNext = () => setActiveIndex((i) => (i + 1) % images.length)

  if (!images.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-100 text-slate-300 sm:h-[420px]">
        <div className="flex flex-col items-center gap-2">
          <Maximize2 size={40} />
          <span className="text-sm">Fotoğraf yok</span>
        </div>
      </div>
    )
  }

  const mainImage = images[activeIndex]
  const THUMB_MAX = 6

  return (
    <>
      {/* Main image */}
      <div
        className="relative overflow-hidden rounded-2xl bg-slate-100 cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={mainImage.url}
          alt={mainImage.alt ?? title}
          className="h-72 w-full object-cover sm:h-[420px]"
        />

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          <ZoomIn size={13} />
          Büyüt
        </div>

        {/* Image count badge */}
        {images.length > 1 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.slice(0, THUMB_MAX).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 overflow-hidden rounded-xl transition-all ${
                i === activeIndex
                  ? 'ring-2 ring-orange-500 ring-offset-1'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={img.alt ?? `${title} ${i + 1}`}
                className="h-16 w-24 object-cover"
                loading="lazy"
              />
              {/* "+N more" overlay on last thumb */}
              {i === THUMB_MAX - 1 && images.length > THUMB_MAX && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">
                  +{images.length - THUMB_MAX}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          index={activeIndex}
          title={title}
          onClose={() => setLightboxOpen(false)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </>
  )
}
