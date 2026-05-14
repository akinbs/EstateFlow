# Test Kılavuzu

## Manual Test Checklist

### Kimlik Doğrulama
- [ ] Email/password ile kayıt (register)
- [ ] Email/password ile giriş (login)
- [ ] Google ile giriş
- [ ] Çıkış (logout)
- [ ] Giriş yapılmadan `/admin` → `/login` yönlendirmesi
- [ ] Giriş sonrası başlangıç sayfasına yönlendirme

### Public Sayfalar
- [ ] Ana sayfa yükleniyor, featured ilanlar görünüyor
- [ ] Hero arama çubuğundan /properties?city=... yönlendirmesi
- [ ] İlan listesi yükleniyor
- [ ] Filtreler (listingType, propertyType, şehir, fiyat aralığı) çalışıyor
- [ ] Filtre chip'leriyle tek tek filtre kaldırma
- [ ] Sayfalama çalışıyor
- [ ] Grid/list/map görünüm değiştirme
- [ ] Harita üzerinde marker'lar görünüyor
- [ ] Harita marker popup'ı açılıyor, detay linki çalışıyor
- [ ] İlan detay sayfası açılıyor (slug ile)
- [ ] Image gallery thumbnail click → lightbox açılıyor
- [ ] Lightbox keyboard navigation (← → Escape)
- [ ] Lead/contact form gönderimi (backend çalışırken)
- [ ] Lead form validation (boş ad, geçersiz email, kısa mesaj)
- [ ] Favorilere ekleme/çıkarma (PropertyCard üzerinden)
- [ ] Favoriler sayfasında listeli görünüyor
- [ ] Favori kaldırma butonu çalışıyor
- [ ] Compare ekleme (max 3)
- [ ] Compare sayfasında tablo görünümü
- [ ] 404 sayfası (var olmayan slug ile)

### Admin Paneli (admin rolü ile)
- [ ] Dashboard istatistikleri yükleniyor
- [ ] Son ilanlar listesi
- [ ] Son talepler listesi
- [ ] İlan listesi tablo görünümü
- [ ] Status filtresi (all/active/passive/draft/sold/rented)
- [ ] Başlık/şehir arama filtresi
- [ ] Sayfalama çalışıyor
- [ ] Featured star toggle (yıldız) çalışıyor
- [ ] Status toggle (active↔passive) çalışıyor
- [ ] "Pasife al" silme (soft delete) çalışıyor
- [ ] Yeni ilan formu açılıyor (/admin/properties/new)
- [ ] Tüm form alanları dolduruluyor
- [ ] Form validation (başlık, fiyat, şehir, oda zorunlu)
- [ ] Özellik (feature) tag ekleme/kaldırma
- [ ] Fotoğraf seçme, önizleme
- [ ] Fotoğraf type/size validation (png/jpg/webp, max 5MB)
- [ ] İlan oluşturma → /admin/properties yönlendirme
- [ ] İlan düzenleme formu mevcut verileri yüklüyor
- [ ] İlan güncelleme kaydediliyor
- [ ] Yeni fotoğraf upload → Storage'a gidiyor → property'de görünüyor
- [ ] Lead listesi yükleniyor
- [ ] Lead status filtresi çalışıyor
- [ ] Lead status değiştirme (new → contacted → closed)

### Güvenlik Testleri
- [ ] Token olmadan GET /api/v1/admin/stats → 401
- [ ] Token olmadan POST /api/v1/properties → 401
- [ ] Normal user token ile GET /api/v1/admin/stats → 403
- [ ] Normal user token ile POST /api/v1/properties → 403
- [ ] Geçersiz token → 401
- [ ] Admin olmayan kullanıcı /admin → Frontend login yönlendirmesi

---

## Responsive Test Matrisi

| Sayfa | 375px (mobile) | 768px (tablet) | 1024px (laptop) | 1440px (desktop) |
|---|---|---|---|---|
| Home | [ ] | [ ] | [ ] | [ ] |
| Properties (grid) | [ ] | [ ] | [ ] | [ ] |
| Properties (list) | [ ] | [ ] | [ ] | [ ] |
| Properties (map) | [ ] | [ ] | [ ] | [ ] |
| Property Detail | [ ] | [ ] | [ ] | [ ] |
| Login | [ ] | [ ] | [ ] | [ ] |
| Favorites | [ ] | [ ] | [ ] | [ ] |
| Compare | [ ] | [ ] | [ ] | [ ] |
| Admin Dashboard | [ ] | [ ] | [ ] | [ ] |
| Admin PropertyList | [ ] | [ ] | [ ] | [ ] |
| Admin PropertyForm | [ ] | [ ] | [ ] | [ ] |
| Admin Leads | [ ] | [ ] | [ ] | [ ] |

---

## Build Test

```bash
# Frontend build
cd frontend
npm run build
# Beklenen: ✓ built in Xms (uyarılar kabul edilebilir, hatalar kabul edilemez)

# TypeScript check
npx tsc --noEmit
```

---

## Backend Test (Python kuruluysa)

```powershell
# Health
Invoke-RestMethod http://localhost:8000/api/v1/health | ConvertTo-Json

# Firebase health
Invoke-RestMethod http://localhost:8000/api/v1/health/firebase | ConvertTo-Json

# 401 testi
try {
  Invoke-RestMethod http://localhost:8000/api/v1/admin/stats
} catch {
  $_.Exception.Response.StatusCode  # 401 bekleniyor
}
```

---

## Bilinen Test Limitleri

- Backend Python kurulumu gerektirdiğinden otomatik test altyapısı kurulmamıştır
- Firebase Storage testleri gerçek Firebase projesi gerektirir (emulator ile de yapılabilir)
- E2E testler (Playwright, Cypress) production öncesi eklenebilir
- Firestore kuralları Firebase Emulator Suite ile test edilmelidir
