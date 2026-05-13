import L from 'leaflet'

/**
 * Emlak haritası için fiyat etiketi marker ikonu.
 * L.divIcon kullanır — Vite ile birlikte marker-icon URL sorununu tamamen önler.
 */
export function createPriceMarkerIcon(
  priceLabel: string,
  isSelected = false,
): L.DivIcon {
  const bg = isSelected ? '#f97316' : '#ffffff'
  const color = isSelected ? '#ffffff' : '#1e293b'
  const border = isSelected ? '#ea580c' : '#cbd5e1'
  const shadow = isSelected
    ? '0 4px 12px rgba(249,115,22,0.45)'
    : '0 2px 8px rgba(0,0,0,0.18)'
  const scale = isSelected ? 'scale(1.12)' : 'scale(1)'

  return L.divIcon({
    className: '',
    html: `<div style="
      background:${bg};
      color:${color};
      border:2px solid ${border};
      box-shadow:${shadow};
      transform:${scale};
      transform-origin:center bottom;
      padding:4px 10px;
      border-radius:999px;
      font-size:11px;
      font-weight:700;
      font-family:system-ui,sans-serif;
      white-space:nowrap;
      line-height:1.4;
      cursor:pointer;
      transition:transform 0.15s ease,box-shadow 0.15s ease;
    ">${priceLabel}</div>`,
    iconSize: undefined,
    iconAnchor: [40, 14],
    popupAnchor: [0, -18],
  })
}

/** Standart Leaflet default ikonunu tamamen devre dışı bırakır (Vite uyumluluğu). */
export function fixLeafletDefaultIcon(): void {
  // Leaflet default icon image URL'leri Vite bundler'da bozulur.
  // DivIcon kullandığımız için bu fix gerekli değil, ama güvenlik için eklenmiştir.
  const proto = L.Icon.Default.prototype as unknown as Record<string, unknown>
  delete proto['_getIconUrl']
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '',
    iconUrl: '',
    shadowUrl: '',
  })
}
