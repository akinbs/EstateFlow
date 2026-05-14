# Güvenlik Notları

## Genel Yaklaşım

EstateFlow'un güvenlik modeli üç katmanda çalışır:

1. **Firebase Auth** — Kimlik doğrulama ve ID token üretimi
2. **FastAPI + Admin SDK** — Token doğrulama ve role-based erişim kontrolü
3. **Firestore Security Rules** — Client-side erişim kısıtlamaları (son savunma hattı)

---

## Auth Akışı

```
Kullanıcı → Firebase Auth (email/Google) → ID Token
ID Token → FastAPI Authorization header (Bearer) → Admin SDK verify_id_token()
→ Custom claims'ten rol okuma → require_admin / require_agent_or_admin dependency
```

---

## Role Guard

### Frontend (UI güvenliği)
`ProtectedRoute` bileşeni Zustand store'daki `role` değerini kontrol eder.  
Bu **UI kolaylığıdır**, gerçek güvenlik değildir.

### Backend (gerçek güvenlik)
```python
# Sadece admin
AdminDep = Annotated[CurrentUser, Depends(require_admin)]

# Admin veya agent
AgentOrAdminDep = Annotated[CurrentUser, Depends(require_agent_or_admin)]
```

Token yoksa: `401 Unauthorized`  
Yetersiz rol: `403 Forbidden`

---

## Veri Akışı Güvenliği

```
✅ Property CRUD: React → FastAPI → Firestore (Admin SDK)
✅ Lead okuma: React → FastAPI → Firestore (Admin SDK)
✅ Image upload: React → Firebase Storage (client SDK, auth required)
✅ Image metadata: React → FastAPI → Firestore (Admin SDK)
❌ Firestore'a doğrudan client-side property yazma: KAPALI
```

---

## Bilinen Riskler ve Öneriler

### Lead Form Spam
- **Risk:** Herkes `POST /leads` endpoint'ine spam gönderebilir.
- **Mevcut durum:** Pydantic validation (min_length, EmailStr) ile temel koruma var.
- **Öneri:** Production için rate limiting, CAPTCHA veya Turnstile eklenmelidir.

### Brute Force Login
- **Risk:** Email/password ile çok sayıda login denemesi.
- **Mevcut durum:** Firebase Auth kendi brute force korumasına sahiptir.
- **Öneri:** Firebase Authentication'da advanced security features aktifleştirin.

### Public Property Endpoint Abuse
- **Risk:** `GET /properties` endpoint'ine aşırı istek.
- **Mevcut durum:** Korumasız.
- **Öneri:** Slowapi veya nginx rate limiting eklenmelidir.

### Image Upload Abuse
- **Risk:** Authenticated kullanıcı Storage'a büyük dosyalar yükleyebilir.
- **Mevcut durum:** Client SDK 5 MB limiti var, Storage rules content-type kontrolü yapıyor.
- **Öneri:** Storage rules'da role claim kontrolü eklenmeli.

### Token Expiry
- **Risk:** Token süresi dolunca 401 alınır.
- **Mevcut durum:** axiosClient 401 → `/login` redirect yapıyor. Token her istekten önce refresh ediliyor.
- **Öneri:** Proactive token refresh (Firebase `onIdTokenChanged`) eklenebilir.

### CORS
- **Mevcut durum:** FRONTEND_URL env değerinden alınan origin(ler)e kısıtlı, virgülle ayırarak birden fazla eklenebilir.
- **Öneri:** Production'da exact origin belirleyin, wildcard kullanmayın.

### Swagger Docs
- **Mevcut durum:** `APP_ENV=production` olduğunda `/docs` ve `/redoc` devre dışıdır.
- **Öneri:** Production'da Swagger kesinlikle kapalı olmalı.

### Stack Trace Exposure
- **Mevcut durum:** `global_exception_handler` production'da stack trace gizliyor.
- **Mevcut durum:** Token hata mesajları production'da generic dönüyor.
- **Öneri:** Structured logging ile merkezi hata takibi yapın (Sentry vb.).

---

## Environment Variables

Hiçbir zaman commit edilmemesi gereken dosyalar:
- `frontend/.env`
- `backend/.env`
- `backend/serviceAccountKey.json`
- `backend/firebase-adminsdk*.json`

Bunlar `.gitignore`'da tanımlıdır.

---

## Production Checklist

```
[ ] APP_ENV=production olarak ayarlandı
[ ] Swagger docs kapalı (otomatik)
[ ] FRONTEND_URL production domain'i
[ ] Firebase custom claims set edildi (admin/agent kullanıcılar)
[ ] Firestore rules sıkılaştırıldı (firebase-rules.md)
[ ] Storage rules sıkılaştırıldı (role claim kontrolü)
[ ] Rate limiting eklendi
[ ] Error monitoring (Sentry vb.) entegre edildi
[ ] Backend HTTPS arkasında (Render/Railway otomatik sağlar)
[ ] Frontend HTTPS (Vercel/Firebase Hosting otomatik sağlar)
```
