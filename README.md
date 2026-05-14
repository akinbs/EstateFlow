# EstateFlow

Modern full-stack real estate platform built with React, TypeScript, FastAPI and Firebase.

> **Portfolio Project** — end-to-end implementation covering frontend, backend, auth, cloud storage, map integration, admin panel and role-based access control.

---

## Features

### Public
- Property listing with advanced filters (type, location, price range, rooms)
- Sortable, paginated results
- Grid / List / Map view toggle
- Interactive map with price marker popups (Leaflet + OpenStreetMap)
- Property detail page with full-screen image gallery
- Contact / lead form
- Favorites (localStorage)
- Side-by-side property comparison (up to 3)

### Admin Panel
- Dashboard with live stats (total/active/featured listings, new leads)
- Full property CRUD with Firebase Storage image upload
- Status management (active, passive, draft, sold, rented)
- Featured toggle
- Lead management with status workflow (new → contacted → closed)
- Role-based route protection (admin / agent)

### Technical
- Firebase Auth (email + Google Sign-In)
- Firebase ID Token → FastAPI verification via Admin SDK
- Firestore as primary database (via Admin SDK, no client-side writes)
- Firebase Storage for image uploads (client SDK)
- Role-based access: frontend ProtectedRoute + backend dependency guards

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| HTTP | Axios (with interceptors) |
| Map | Leaflet + react-leaflet |
| Auth | Firebase Auth |
| Backend | FastAPI (Python 3.11+) + Uvicorn |
| Database | Firestore (Firebase Admin SDK) |
| Storage | Firebase Cloud Storage |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Architecture

```
React (Vite)           FastAPI (Uvicorn)        Firebase
     │                       │                     │
     │── GET /properties ───►│                     │
     │                       │── Firestore ────────►
     │◄── JSON ──────────────│◄── data ────────────│
     │                       │                     │
     │── Bearer token ───────►                     │
     │                       │── verify_id_token──►│
     │◄── 200 / 401/403 ─────│◄── decoded ─────────│
     │                       │                     │
     │── upload image ─────────────────────────────►│ (Storage)
     │── PUT /properties/{id} (images metadata) ───►│ (Firestore via API)
```

**Key constraint:** Frontend never writes directly to Firestore. All property/lead CRUD goes through FastAPI → Admin SDK.

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Firebase project ([setup guide](docs/firebase-setup.md))

### Frontend

```bash
cd frontend
cp .env.example .env        # fill in Firebase web app config
npm install
npm run dev                 # http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate

cp .env.example .env        # fill in Firebase Admin SDK credentials
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Get these from Firebase Console → Project Settings → Your apps → Web app config.

### Backend (`backend/.env`)

```env
APP_ENV=development
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=
```

Get Admin SDK credentials from Firebase Console → Project Settings → Service Accounts → Generate new private key.

---

## Firebase Setup

Full guide: [docs/firebase-setup.md](docs/firebase-setup.md)

Quick summary:
1. Create Firebase project
2. Enable Authentication (Email/Password + Google)
3. Create Firestore database
4. Create Storage bucket
5. Register web app → copy config to `frontend/.env`
6. Generate service account key → copy to `backend/.env`

---

## API Overview

| Method | Endpoint | Auth |
|---|---|---|
| `GET` | `/api/v1/health` | — |
| `GET` | `/api/v1/properties` | — |
| `GET` | `/api/v1/properties/{slug}` | — |
| `POST` | `/api/v1/leads` | — |
| `GET` | `/api/v1/auth/me` | Bearer |
| `GET` | `/api/v1/admin/stats` | Bearer (admin) |
| `GET` | `/api/v1/admin/properties` | Bearer (agent/admin) |
| `POST` | `/api/v1/properties` | Bearer (agent/admin) |
| `PUT` | `/api/v1/properties/{id}` | Bearer (agent/admin) |
| `PATCH` | `/api/v1/properties/{id}/status` | Bearer (agent/admin) |
| `PATCH` | `/api/v1/properties/{id}/featured` | Bearer (agent/admin) |
| `DELETE` | `/api/v1/properties/{id}` | Bearer (agent/admin) |
| `GET` | `/api/v1/leads` | Bearer (admin) |
| `PATCH` | `/api/v1/leads/{id}` | Bearer (admin) |

Full reference: [docs/api-overview.md](docs/api-overview.md)  
Interactive docs (dev only): `http://localhost:8000/docs`

---

## Deployment

See [docs/deployment.md](docs/deployment.md) for step-by-step instructions.

**Recommended stack:**
- Frontend → Vercel (auto HTTPS, CDN, GitHub integration)
- Backend → Render (auto HTTPS, Python runtime)

---

## Security

See [docs/security.md](docs/security.md) for full details.

Highlights:
- No direct Firestore writes from the frontend
- Bearer token verified by Firebase Admin SDK on every protected request
- Role extracted from Firebase custom claims (`role: admin | agent | user`)
- Swagger UI disabled in production
- Error details sanitized in production responses
- `.env` files and service account keys in `.gitignore`

---

## Known Limitations

- Favorites and compare are localStorage-based; future version can sync with Firestore per user
- Map draw-to-search not implemented
- No realtime notifications or chat
- No payment / subscription system
- Large Firestore datasets (500+ docs) require composite indexes and cursor-based pagination — see [docs/firestore-indexes.md](docs/firestore-indexes.md)
- Production rate limiting (slowapi / nginx) not yet configured
- Storage Security Rules role-claim enforcement pending custom claims setup

---

## Docs

| Document | Description |
|---|---|
| [architecture.md](docs/architecture.md) | System design, data flow diagrams |
| [api-overview.md](docs/api-overview.md) | All endpoints, request/response examples |
| [firebase-setup.md](docs/firebase-setup.md) | Firebase Console setup guide |
| [firebase-rules.md](docs/firebase-rules.md) | Firestore + Storage Security Rules |
| [firestore-indexes.md](docs/firestore-indexes.md) | Required composite indexes |
| [deployment.md](docs/deployment.md) | Frontend + backend deployment guides |
| [security.md](docs/security.md) | Security model, risks, recommendations |
| [testing.md](docs/testing.md) | Manual test checklist, responsive matrix |

---

## Roadmap

- [ ] Firebase custom claims management UI (set admin/agent roles)
- [ ] Realtime lead notifications (Firestore onSnapshot)
- [ ] Saved searches with email alerts
- [ ] Advanced map filters (draw polygon)
- [ ] Rate limiting (slowapi)
- [ ] E2E tests (Playwright)
- [ ] Firestore composite index migration (cursor pagination)
- [ ] i18n support (Turkish / English)

---

## Author

**akinbs** — Full Stack Developer  
Built as a portfolio project to demonstrate production-grade React + FastAPI + Firebase integration.
