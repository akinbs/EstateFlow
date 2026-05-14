import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebaseConfig'
import type { PropertyImage } from '../../types/property'

const MAX_SIZE_BYTES = 5 * 1024 * 1024  // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase()
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}" desteklenmiyor. Sadece JPEG, PNG, WebP kabul edilir.`
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `"${file.name}" çok büyük (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimum: 5 MB.`
  }
  return null
}

export async function uploadPropertyImage(
  file: File,
  propertyId: string,
  sortOrder = 0,
): Promise<PropertyImage> {
  const error = validateImageFile(file)
  if (error) throw new Error(error)

  const timestamp = Date.now()
  const safeName = sanitizeFileName(file.name)
  const path = `properties/${propertyId}/${timestamp}_${safeName}`

  const storageRef = ref(storage, path)
  const snapshot = await uploadBytes(storageRef, file)
  const url = await getDownloadURL(snapshot.ref)

  return { url, path, alt: null, sortOrder }
}

export async function uploadMultiplePropertyImages(
  files: File[],
  propertyId: string,
): Promise<PropertyImage[]> {
  return Promise.all(files.map((file, i) => uploadPropertyImage(file, propertyId, i)))
}

export async function deletePropertyImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (err) {
    // Dosya zaten silinmiş olabilir — hata logla ama fırlat
    console.warn('[Storage] deletePropertyImage failed:', path, err)
  }
}
