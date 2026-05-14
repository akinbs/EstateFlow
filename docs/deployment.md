# Deployment Rehberi

## Genel Bakış

| Katman | Önerilen Platform | Alternatif |
|---|---|---|
| Frontend | Vercel | Firebase Hosting |
| Backend | Render | Railway |
| Auth / DB | Firebase | — |

---

## Frontend Deployment

### Seçenek A: Vercel (Önerilen)

1. [vercel.com](https://vercel.com) hesabı oluşturun
2. GitHub reposunu bağlayın
3. **Framework Preset:** Vite
4. **Root Directory:** `frontend`
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. Environment Variables ekleyin (Settings → Environment Variables):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

8. Deploy → Vercel otomatik HTTPS ve CDN sağlar
9. Custom domain varsa Vercel Settings → Domains

### Seçenek B: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Public directory: dist
# Single-page app: Yes (SPA redirect)
# GitHub Actions: isteğe bağlı

cd frontend && npm run build
firebase deploy --only hosting
```

Firebase Hosting'e `firebase.json` ekleyin:
```json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

---

## Backend Deployment

### Seçenek A: Render (Önerilen)

1. [render.com](https://render.com) hesabı oluşturun
2. **New → Web Service** → GitHub reposunu bağlayın
3. Ayarlar:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables ekleyin:

```
APP_NAME=EstateFlow API
APP_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_STORAGE_BUCKET=...
```

5. Deploy → Render otomatik HTTPS sağlar

### Seçenek B: Railway

1. [railway.app](https://railway.app) → New Project → GitHub repo
2. **Root Directory:** `backend`
3. Environment Variables aynı şekilde ekleyin
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Deploy

---

## Firebase Production Ayarları

### Authorized Domains

Firebase Console → Authentication → Settings → Authorized domains:
- `your-frontend.vercel.app` ekleyin
- Varsa custom domain ekleyin

### CORS Güncelleme

Backend `.env` veya Render/Railway env variables:
```
FRONTEND_URL=https://your-frontend.vercel.app
```

Birden fazla origin için virgülle ayırın:
```
FRONTEND_URL=https://your-frontend.vercel.app,https://www.yourdomain.com
```

### Firestore Rules

`docs/firebase-rules.md` → final kuralları Firebase Console'a uygulayın.

### Storage Rules

`docs/firebase-rules.md` → Storage rules bölümünü uygulayın (role claim ile).

---

## Post-Deployment Kontrolleri

```bash
# Health check
curl https://your-backend.onrender.com/api/v1/health

# 401 testi (token olmadan)
curl https://your-backend.onrender.com/api/v1/admin/stats
# → {"detail": "Authentication credentials were not provided."}

# Public listing
curl https://your-backend.onrender.com/api/v1/properties
# → {"data": [...], "meta": {...}}
```

---

## CI/CD (İsteğe Bağlı)

Vercel ve Render, GitHub push'ta otomatik deploy eder.

Manuel deployment scripti (`scripts/deploy.sh`):
```bash
#!/bin/bash
cd frontend && npm run build && cd ..
# Vercel CLI: vercel --prod
# Firebase: firebase deploy
```
