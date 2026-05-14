# Sistem Mimarisi

## Genel Bakış

EstateFlow, React frontend ile FastAPI backend'in Firebase servisleriyle entegre olduğu bir full-stack uygulamadır.

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (React/Vite)                    │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Public UI   │   │  Admin Panel │   │  Firebase SDK  │  │
│  │  (listings,  │   │  (CRUD, mgmt)│   │  (Auth, Stor.) │  │
│  │   map, etc.) │   │              │   │                │  │
│  └──────┬───────┘   └──────┬───────┘   └───────┬────────┘  │
└─────────┼──────────────────┼───────────────────┼───────────┘
          │ HTTP/REST         │ HTTP/REST          │ Firebase SDK
          │ (Axios)           │ (Axios + Bearer)   │ (Auth/Storage)
          ▼                   ▼                   ▼
┌─────────────────────┐              ┌──────────────────────┐
│   FastAPI Backend   │              │   Firebase Services   │
│   (Uvicorn)         │              │                      │
│                     │              │  ┌────────────────┐  │
│  ┌───────────────┐  │              │  │  Firebase Auth │  │
│  │  Auth/Token   │◄─┼──────────────│──│  (verify token)│  │
│  │  Verification │  │              │  └────────────────┘  │
│  └───────────────┘  │              │                      │
│  ┌───────────────┐  │              │  ┌────────────────┐  │
│  │  Property     │  │              │  │   Firestore    │  │
│  │  Service      │◄─┼──────────────┼──│   Database     │  │
│  └───────────────┘  │   Admin SDK  │  └────────────────┘  │
│  ┌───────────────┐  │              │                      │
│  │  Lead         │  │              │  ┌────────────────┐  │
│  │  Service      │◄─┼──────────────┼──│ Cloud Storage  │  │
│  └───────────────┘  │              │  │ (image files)  │  │
└─────────────────────┘              │  └────────────────┘  │
                                     └──────────────────────┘
```

---

## Veri Akışı

### Public İlan Listesi
```
Browser → GET /api/v1/properties?... → FastAPI → Firestore query → JSON response
```

### Admin İlan Oluşturma (Fotoğraflı)
```
1. PropertyForm → POST /api/v1/properties (images:[]) → Firestore doc created → property.id
2. PropertyForm → Firebase Storage SDK → upload files → get download URLs
3. PropertyForm → PUT /api/v1/properties/{id} → { images: [...] } → Firestore update
```

### Auth Akışı
```
1. Firebase Auth (email/Google) → ID Token (JWT)
2. ID Token → axiosClient interceptor → Authorization: Bearer header
3. FastAPI → Admin SDK verify_id_token() → custom claims → CurrentUser
4. require_admin / require_agent_or_admin dependency → 403 if unauthorized
```

---

## Kritik Mimari Kararlar

| Karar | Gerekçe |
|---|---|
| Frontend → Firestore doğrudan erişim yok | Güvenlik ve iş mantığı kontrolü backend'de olmalı |
| Image dosyası Storage'a client'tan upload | Binary transfer backend'den geçirilmiyor, performans |
| Image metadata FastAPI üzerinden Firestore'a | Backend kontrolü, validation, authorization |
| Firestore Admin SDK (server-side) | Security rules bypass — backend güvenli kabul edilir |
| Token her istekte refresh | Firebase token 1 saat geçerli; getIdToken() cache'den döner |
| Role custom claims'ten | Firebase Admin SDK ile set edilir, token'da taşınır |

---

## Klasör Yapısı

```
EstateFlow/
├── frontend/                    # React + TypeScript + Vite
│   └── src/
│       ├── components/
│       │   ├── admin/           # Admin-only components
│       │   ├── filter/          # FilterPanel, ActiveFilterChips
│       │   ├── layout/          # Header, Footer, Sidebar
│       │   ├── map/             # MapView, PropertyMarker, etc.
│       │   ├── property/        # PropertyCard, ImageGallery, etc.
│       │   └── ui/              # Button, Input, Badge, etc.
│       ├── features/
│       │   ├── auth/            # AuthInitializer, ProtectedRoute, authStore
│       │   ├── compare/         # compareStore
│       │   └── favorites/       # favoriteStore
│       ├── hooks/               # useAuth, useProperties
│       ├── layouts/             # MainLayout, AdminLayout
│       ├── pages/
│       │   ├── admin/           # Dashboard, PropertyList, PropertyForm, Leads
│       │   └── *.tsx            # Home, Properties, PropertyDetail, etc.
│       ├── routes/              # createBrowserRouter
│       ├── services/
│       │   ├── api/             # axiosClient, propertyApi, adminApi, leadApi
│       │   └── firebase/        # firebaseConfig, authService, storageService
│       ├── types/               # property.ts, lead.ts, common.ts, user.ts
│       └── utils/               # formatPrice, queryParams, slugify, etc.
│
├── backend/                     # FastAPI + Python 3.11+
│   └── app/
│       ├── api/v1/              # health, auth, properties, leads, admin routers
│       ├── core/                # config, firebase, security
│       ├── middleware/          # error_handler
│       ├── models/              # Firestore data models (reference)
│       ├── schemas/             # Pydantic schemas (property, lead, auth, common)
│       ├── services/            # property_service, lead_service (Firestore logic)
│       └── utils/               # slugify, firestore helpers
│
└── docs/                        # Proje dokümantasyonu
```
