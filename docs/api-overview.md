# API Genel Bakış

Base URL: `http://localhost:8000/api/v1`  
Swagger UI: `http://localhost:8000/docs` (sadece development)

---

## Kimlik Doğrulama

Korumalı endpoint'ler için Firebase ID Token gerekir:

```http
Authorization: Bearer <firebase-id-token>
```

Token alma (frontend):
```typescript
import { getAuth } from 'firebase/auth'
const token = await getAuth().currentUser?.getIdToken()
```

---

## Public Endpoint'ler

| Method | URL | Açıklama |
|---|---|---|
| `GET` | `/health` | API sağlık durumu |
| `GET` | `/health/firebase` | Firebase bağlantı durumu |
| `GET` | `/properties` | Aktif ilan listesi (filtreli, sayfalı) |
| `GET` | `/properties/{slug}` | Slug'a göre ilan detayı |
| `POST` | `/leads` | İletişim talebi oluştur |

### GET /properties — Query Parameters

| Parametre | Tip | Açıklama |
|---|---|---|
| `listingType` | `sale` \| `rent` | İlan tipi |
| `propertyType` | `apartment` \| `house` \| `villa` \| `land` \| `office` \| `commercial` | Emlak tipi |
| `city` | string | Şehir filtresi |
| `district` | string | İlçe filtresi |
| `neighborhood` | string | Mahalle filtresi |
| `priceMin` | number | Minimum fiyat |
| `priceMax` | number | Maksimum fiyat |
| `rooms` | string | Virgülle ayrılmış oda listesi: `2+1,3+1` |
| `featured` | boolean | Öne çıkanlar |
| `sortBy` | `date_desc` \| `date_asc` \| `price_asc` \| `price_desc` | Sıralama |
| `page` | number | Sayfa (varsayılan: 1) |
| `limit` | number | Sayfa boyutu (varsayılan: 12, maks: 50) |

### Örnek Response — GET /properties

```json
{
  "data": [
    {
      "id": "abc123",
      "title": "Beşiktaş 3+1 Daire",
      "slug": "besiktas-3-1-daire",
      "listingType": "sale",
      "propertyType": "apartment",
      "price": 8500000,
      "currency": "TRY",
      "city": "İstanbul",
      "district": "Beşiktaş",
      "neighborhood": "Sinanpaşa",
      "location": { "lat": 41.0438, "lng": 29.0064 },
      "rooms": "3+1",
      "bathrooms": 2,
      "grossArea": 145,
      "netArea": 120,
      "images": [{ "url": "https://...", "path": "properties/abc123/...", "sortOrder": 0 }],
      "status": "active",
      "featured": false,
      "viewCount": 42,
      "createdAt": "2026-05-10T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 47,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Kimlik Doğrulama Endpoint'leri

| Method | URL | Açıklama | Auth |
|---|---|---|---|
| `GET` | `/auth/me` | Mevcut kullanıcı bilgisi | Bearer |
| `POST` | `/auth/verify-token` | Token doğrulama | Bearer |

---

## Admin / Agent Endpoint'leri

> `require_agent_or_admin`: rol `admin` veya `agent` olmalı  
> `require_admin`: rol `admin` olmalı

| Method | URL | Açıklama | Auth |
|---|---|---|---|
| `GET` | `/admin/stats` | Dashboard istatistikleri | admin |
| `GET` | `/admin/properties` | Tüm ilanlar (status=all destekler) | agent/admin |
| `GET` | `/properties/id/{id}` | ID ile ilan detayı | agent/admin |
| `POST` | `/properties` | Yeni ilan oluştur | agent/admin |
| `PUT` | `/properties/{id}` | İlan güncelle | agent/admin |
| `PATCH` | `/properties/{id}/status` | Durum güncelle | agent/admin |
| `PATCH` | `/properties/{id}/featured` | Öne çıkan güncelle | agent/admin |
| `DELETE` | `/properties/{id}` | Soft delete (passive) | agent/admin |
| `GET` | `/leads` | Lead listesi | admin |
| `GET` | `/leads/{id}` | Lead detayı | admin |
| `PATCH` | `/leads/{id}` | Lead güncelle | admin |

### Örnek Request — POST /properties

```http
POST /api/v1/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beşiktaş 3+1 Daire",
  "description": "Deniz manzaralı, yeni bina...",
  "listingType": "sale",
  "propertyType": "apartment",
  "price": 8500000,
  "currency": "TRY",
  "city": "İstanbul",
  "district": "Beşiktaş",
  "neighborhood": "Sinanpaşa",
  "location": { "lat": 41.0438, "lng": 29.0064 },
  "rooms": "3+1",
  "bathrooms": 2,
  "grossArea": 145,
  "netArea": 120,
  "status": "active",
  "featured": false
}
```

---

## Hata Kodları

| Kod | Açıklama |
|---|---|
| `400` | Validation hatası |
| `401` | Token eksik veya geçersiz |
| `403` | Yetersiz yetki (rol kontrolü) |
| `404` | Kayıt bulunamadı |
| `422` | Pydantic validation hatası |
| `500` | Sunucu hatası |
| `503` | Firebase hazır değil |
