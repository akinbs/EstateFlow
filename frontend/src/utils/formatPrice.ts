export function formatPrice(
  price: number,
  currency: 'TRY' | 'USD' | 'EUR' = 'TRY',
): string {
  const localeMap: Record<string, string> = {
    TRY: 'tr-TR',
    USD: 'en-US',
    EUR: 'de-DE',
  }

  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatArea(m2: number): string {
  return `${m2.toLocaleString('tr-TR')} m²`
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}
