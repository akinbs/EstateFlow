# EstateFlow — Backend (FastAPI)

Python 3.11+ · FastAPI · Firebase Admin SDK · Uvicorn

---

## Kurulum

### 1. Python Kurulumu
Python 3.11 veya üstü gereklidir.

- İndirme: https://www.python.org/downloads/
- Kurulum sırasında **"Add Python to PATH"** kutusunu işaretleyin.

Kurulum doğrulama:
```powershell
python --version   # Python 3.11.x veya üstü
```

### 2. Virtual Environment

```powershell
cd EstateFlow\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

> PowerShell'de script çalıştırma kısıtlıysa:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 3. Bağımlılıkları Yükle

```powershell
pip install -r requirements.txt
```

### 4. Environment Değişkenleri

`.env.example` dosyasını kopyalayıp `.env` oluşturun:

```powershell
Copy-Item .env.example .env
```

Ardından `.env` içini Firebase değerleriyle doldurun:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

### 5. Firebase Service Account Bilgilerini Alma

1. [Firebase Console](https://console.firebase.google.com/) → Projenizi seçin
2. **Project Settings** (dişli ikon) → **Service Accounts** sekmesi
3. **"Generate new private key"** → JSON dosyasını indirin
4. JSON içindeki değerleri `.env` dosyasına kopyalayın:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (tırnak içinde, `\n` olarak)

> **Güvenlik:** `serviceAccountKey.json` ve `.env` dosyaları `.gitignore`'da ve hiçbir zaman commit edilmemeli.

**Alternatif:** JSON dosyasını `backend/serviceAccountKey.json` olarak kaydedip
`firebase.py` içinde `credentials.Certificate("serviceAccountKey.json")` kullanabilirsiniz
(geliştirme ortamı için pratik, production için önerilmez).

---

## Sunucu Çalıştırma

```powershell
# venv aktif olduğundan emin ol
.\venv\Scripts\Activate.ps1

# Development server (auto-reload)
uvicorn app.main:app --reload --port 8000
```

---

## Endpoint'ler

| Method | URL | Açıklama | Auth |
|--------|-----|----------|------|
| GET | `/` | Root — API durumu | — |
| GET | `/api/v1/health` | Sağlık kontrolü | — |
| GET | `/api/v1/health/firebase` | Firebase bağlantı kontrolü | — |
| GET | `/api/v1/auth/me` | Mevcut kullanıcı bilgisi | Bearer token |
| POST | `/api/v1/auth/verify-token` | Token doğrulama | Bearer token |
| GET | `/api/v1/properties` | İlan listesi (placeholder) | — |
| GET | `/api/v1/properties/{slug}` | İlan detayı (placeholder) | — |
| POST | `/api/v1/leads` | İletişim talebi (placeholder) | — |
| GET | `/api/v1/admin/stats` | Admin istatistikler | Bearer (admin) |

---

## Swagger / OpenAPI

```
http://localhost:8000/docs       ← Swagger UI (interaktif test)
http://localhost:8000/redoc      ← ReDoc
http://localhost:8000/openapi.json
```

---

## Test Komutları

```powershell
# Health check
Invoke-RestMethod http://localhost:8000/api/v1/health | ConvertTo-Json

# Firebase health
Invoke-RestMethod http://localhost:8000/api/v1/health/firebase | ConvertTo-Json

# Auth/me — token gerekli
$token = "FIREBASE_ID_TOKEN_BURAYA"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:8000/api/v1/auth/me -Headers $headers | ConvertTo-Json

# curl ile (Git Bash veya WSL)
curl http://localhost:8000/api/v1/health
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/auth/me
```

### Frontend'den Token Alma

```typescript
// Firebase Auth ile giriş yaptıktan sonra:
import { getAuth } from 'firebase/auth'
const token = await getAuth().currentUser?.getIdToken()
console.log(token)  // Bu token'ı Authorization header olarak gönderin
```

---

## Proje Yapısı

```
backend/
  app/
    main.py              # FastAPI app, CORS, lifespan
    api/v1/
      router.py          # Tüm v1 route'larını toplar
      health.py          # GET /health, GET /health/firebase
      auth.py            # GET /auth/me, POST /auth/verify-token
      properties.py      # Property endpoint'leri (placeholder)
      leads.py           # Lead endpoint'leri (placeholder)
      admin.py           # Admin endpoint'leri (admin only)
    core/
      config.py          # pydantic-settings, Settings sınıfı
      firebase.py        # Firebase Admin SDK initialize
      security.py        # Token doğrulama dependency'leri
    schemas/
      auth.py            # CurrentUser, TokenVerifyResponse
      common.py          # HealthResponse, MessageResponse, ErrorResponse
    middleware/
      error_handler.py   # Global exception handler
  .env                   # Gerçek değerler (gitignore'da)
  .env.example           # Şablon
  requirements.txt       # Python bağımlılıkları
```
