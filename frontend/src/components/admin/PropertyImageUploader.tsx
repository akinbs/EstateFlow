import { useEffect, useRef, useState } from 'react'
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react'
import { validateImageFile } from '../../services/firebase/storageService'
import type { PropertyImage } from '../../types/property'
import Button from '../ui/Button'

interface PropertyImageUploaderProps {
  images: PropertyImage[]
  onImagesChange: (images: PropertyImage[]) => void
  pendingFiles: File[]
  onPendingFilesChange: (files: File[]) => void
  disabled?: boolean
}

export default function PropertyImageUploader({
  images,
  onImagesChange,
  pendingFiles,
  onPendingFilesChange,
  disabled = false,
}: PropertyImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = pendingFiles.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [pendingFiles])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const errors: string[] = []
    const valid: File[] = []
    for (const file of files) {
      const err = validateImageFile(file)
      if (err) errors.push(err)
      else valid.push(file)
    }

    setValidationErrors(errors)
    if (valid.length > 0) {
      onPendingFilesChange([...pendingFiles, ...valid])
    }
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (disabled) return
    const files = Array.from(e.dataTransfer.files)
    const errors: string[] = []
    const valid: File[] = []
    for (const file of files) {
      const err = validateImageFile(file)
      if (err) errors.push(err)
      else valid.push(file)
    }
    setValidationErrors(errors)
    if (valid.length > 0) {
      onPendingFilesChange([...pendingFiles, ...valid])
    }
  }

  function removePending(index: number) {
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index))
  }

  function removeExisting(index: number) {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  const hasAny = images.length > 0 || pendingFiles.length > 0

  return (
    <div className="space-y-3">
      {validationErrors.length > 0 && (
        <div className="flex flex-col gap-1 rounded-xl bg-red-50 p-3">
          {validationErrors.map((err, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-red-600">
              <AlertCircle size={12} className="shrink-0" />
              {err}
            </div>
          ))}
        </div>
      )}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center cursor-pointer hover:border-orange-300 transition-colors"
      >
        <Upload size={24} className="text-slate-300" />
        <div>
          <p className="text-sm text-slate-500">Fotoğraf seçin veya sürükleyip bırakın</p>
          <p className="mt-0.5 text-xs text-slate-400">JPEG, PNG, WebP · Maks. 5 MB / dosya</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={disabled} tabIndex={-1}>
          Fotoğraf Seç
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={handleFileSelect}
        />
      </div>

      {hasAny && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((img, i) => (
            <div key={`ex-${i}`} className="group relative aspect-square">
              <img
                src={img.url}
                alt={img.alt ?? `Fotoğraf ${i + 1}`}
                className="h-full w-full rounded-xl object-cover"
              />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] leading-none text-white">
                  Kapak
                </span>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeExisting(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Kaldır"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}

          {pendingFiles.map((file, i) => (
            <div key={`pend-${i}`} className="group relative aspect-square">
              <img
                src={previews[i] ?? ''}
                alt={file.name}
                className="h-full w-full rounded-xl object-cover opacity-70 ring-2 ring-orange-400"
              />
              <span className="absolute bottom-1 left-1 rounded-md bg-orange-500/80 px-1.5 py-0.5 text-[10px] leading-none text-white">
                Yüklenecek
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Kaldır"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!hasAny && (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-400">
          <ImageIcon size={14} />
          Henüz fotoğraf eklenmedi
        </div>
      )}
    </div>
  )
}
