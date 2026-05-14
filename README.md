# EstateFlow 🏠

A modern full-stack real estate platform built with **React**, **TypeScript**, **FastAPI**, and **Firebase**.

EstateFlow allows users to discover properties, filter listings, explore locations on a map, view detailed property pages, send contact requests, save favorites, compare properties, and manage listings through an admin dashboard.

> This project is designed as a portfolio-level full-stack application that demonstrates frontend architecture, backend API design, authentication, role-based access, cloud storage, Firestore integration, and responsive UI/UX.

---

## Preview

> Screenshots will be added soon.

| Home | Property Listing | Map View |
|---|---|---|
| `docs/screenshots/home.png` | `docs/screenshots/properties.png` | `docs/screenshots/map-view.png` |

| Property Detail | Admin Dashboard | Property Form |
|---|---|---|
| `docs/screenshots/property-detail.png` | `docs/screenshots/admin-dashboard.png` | `docs/screenshots/property-form.png` |

---

## Features

### Public User Features

- Modern home page with property search
- Property listing page
- Advanced filtering by:
  - Listing type
  - Property type
  - City
  - District
  - Price range
  - Room count
  - Sorting options
- Grid, list, and map-based property views
- Interactive map with property markers
- Property detail page
- Image gallery and lightbox
- Contact / lead form
- Favorites with localStorage persistence
- Property comparison with localStorage persistence
- Responsive design for mobile, tablet, and desktop

### Admin Features

- Protected admin dashboard
- Admin statistics
- Property list management
- Create property
- Edit property
- Soft delete / deactivate property
- Update property status
- Toggle featured properties
- Firebase Storage image upload
- Lead management
- Lead status update
- Role-based protected routes

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- Axios
- Lucide React
- Leaflet
- React Leaflet
- Firebase Client SDK

### Backend

- FastAPI
- Python
- Uvicorn
- Pydantic
- Pydantic Settings
- Firebase Admin SDK
- Firestore
- Firebase Authentication token verification

### Cloud & Services

- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Storage
- OpenStreetMap tiles via Leaflet

---

## Architecture

EstateFlow follows a clean full-stack architecture where the frontend does not directly read or write property data from Firestore.

```txt
React + TypeScript Frontend
        |
        | Axios API Requests
        v
FastAPI Backend
        |
        | Firebase Admin SDK
        v
Cloud Firestore
```

Authentication flow:

```txt
Firebase Auth
      |
      | ID Token
      v
React Frontend
      |
      | Authorization: Bearer <firebase_id_token>
      v
FastAPI Backend
      |
      | verify_id_token()
      v
Role-based API access
```

Image upload flow:

```txt
Admin Frontend
      |
      | Upload image files
      v
Firebase Storage
      |
      | Download URL + image metadata
      v
FastAPI Backend
      |
      | Save metadata
      v
Firestore property document
```

---

## Folder Structure

```txt
estateflow/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── filter/
│   │   │   ├── layout/
│   │   │   ├── map/
│   │   │   ├── property/
│   │   │   └── ui/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── compare/
│   │   │   ├── favorites/
│   │   │   └── properties/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── api/
│   │   │   └── firebase/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── .env.example
│   └── requirements.txt
│
├── docs/
│   ├── architecture.md
│   ├── api-overview.md
│   ├── data-model.md
│   ├── deployment.md
│   ├── firebase-rules.md
│   ├── firebase-setup.md
│   ├── security.md
│   └── testing.md
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Python 3.11+
- Firebase project
- Git

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL:

```txt
http://localhost:5173
```

Build frontend:

```bash
npm run build
```

---

## Backend Setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Default backend URL:

```txt
http://localhost:8000
```

Swagger documentation:

```txt
http://localhost:8000/docs
```

Health endpoint:

```txt
http://localhost:8000/api/v1/health
```

---

## Environment Variables

### Frontend

Create a `.env` file inside the `frontend/` directory.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Backend

Create a `.env` file inside the `backend/` directory.

```env
APP_NAME=EstateFlow API
APP_ENV=development
API_V1_PREFIX=/api/v1
FRONTEND_URL=http://localhost:5173

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=
```

> Never commit real `.env` files or Firebase service account files to GitHub.

---

## Firebase Setup

EstateFlow uses Firebase for:

- Authentication
- Firestore database
- Cloud Storage
- Firebase Admin SDK token verification

Firebase Console checklist:

```txt
[ ] Create Firebase project
[ ] Register web app
[ ] Copy Firebase config into frontend/.env
[ ] Enable Email/Password Authentication
[ ] Enable Google Authentication
[ ] Create Firestore Database
[ ] Create Cloud Storage bucket
[ ] Configure Firestore Security Rules
[ ] Configure Storage Security Rules
[ ] Create Firebase service account for backend
[ ] Add service account values to backend/.env
```

More details can be documented in:

```txt
docs/firebase-setup.md
```

---

## API Overview

Base URL:

```txt
http://localhost:8000/api/v1
```

### Public Endpoints

```txt
GET    /properties
GET    /properties/{slug}
POST   /leads
GET    /health
```

### Auth Endpoints

```txt
GET    /auth/me
POST   /auth/verify-token
```

### Admin / Agent Endpoints

```txt
POST   /properties
PUT    /properties/{id}
DELETE /properties/{id}
PATCH  /properties/{id}/status
PATCH  /properties/{id}/featured
GET    /leads
PATCH  /leads/{id}
GET    /admin/stats
```

Protected API requests use Firebase ID token:

```txt
Authorization: Bearer <firebase_id_token>
```

---

## Firestore Data Model

Main collections:

```txt
users
properties
leads
favorites
savedSearches
```

### Property Document Example

```json
{
  "id": "property_id",
  "title": "Modern Apartment in Istanbul",
  "slug": "modern-apartment-in-istanbul",
  "description": "A bright and modern apartment close to public transportation.",
  "listingType": "sale",
  "propertyType": "apartment",
  "price": 4250000,
  "currency": "TRY",
  "city": "Istanbul",
  "district": "Kadikoy",
  "neighborhood": "Moda",
  "location": {
    "lat": 40.987,
    "lng": 29.027
  },
  "rooms": "3+1",
  "bathrooms": 2,
  "grossArea": 145,
  "netArea": 120,
  "buildingAge": 5,
  "floor": 4,
  "totalFloors": 8,
  "heating": "Natural Gas",
  "furnished": false,
  "features": ["Balcony", "Elevator", "Parking"],
  "images": [],
  "status": "active",
  "featured": true,
  "viewCount": 0,
  "ownerId": "user_id",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Security Notes

- Property data is managed through FastAPI, not directly from the frontend.
- Firebase Auth handles user authentication.
- FastAPI verifies Firebase ID tokens using Firebase Admin SDK.
- Admin and agent actions are protected by backend role guards.
- Property write operations should not be exposed directly through Firestore client SDK.
- Firebase Storage uploads are validated by file type and size.
- Firestore and Storage rules should be tested before production deployment.
- `.env` files and Firebase service account credentials must never be committed.

---

## Deployment

### Frontend Options

Recommended:

- Firebase Hosting
- Vercel

Frontend build command:

```bash
npm run build
```

Output directory:

```txt
dist
```

### Backend Options

Recommended:

- Render
- Railway

Backend start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Production notes:

```txt
[ ] Add production frontend domain to Firebase authorized domains
[ ] Update backend CORS settings
[ ] Add production environment variables
[ ] Deploy Firestore rules
[ ] Deploy Storage rules
[ ] Test protected API endpoints
```

---

## Testing Checklist

### Frontend

```txt
[ ] Home page works
[ ] Property listing works
[ ] Filters update URL query params
[ ] Grid/list/map views work
[ ] Map markers and popups work
[ ] Property detail page works
[ ] Image gallery works
[ ] Lead form works
[ ] Favorites work
[ ] Compare works
[ ] Login works
[ ] Logout works
[ ] Protected routes redirect correctly
[ ] Admin dashboard works
[ ] Property create works
[ ] Property edit works
[ ] Image upload works
[ ] Lead management works
[ ] Responsive layout works
```

### Backend

```txt
[ ] /api/v1/health works
[ ] Swagger docs open
[ ] Public property endpoints work
[ ] Lead creation works
[ ] Protected endpoints return 401 without token
[ ] Unauthorized users receive 403
[ ] Admin users can manage properties
[ ] Admin users can manage leads
[ ] Firebase Admin SDK initializes correctly
```

---

## Known Limitations

- Favorites are currently stored in localStorage.
- Compare data is currently stored in localStorage.
- Map area drawing search is not implemented yet.
- Real-time chat is not included.
- Payment or subscription system is not included.
- Production rate limiting should be added.
- Additional spam protection is recommended for lead forms.
- Large Firestore datasets may require composite indexes and optimized pagination.
- Firebase Storage rules should be fully tested with custom claims before production.

---

## Roadmap

Possible future improvements:

- User-based favorite sync with Firestore
- Saved searches
- Email notifications for new leads
- Advanced map search with polygon drawing
- Property view analytics
- Agent profiles
- Multi-language support
- Dark mode
- Unit and integration tests
- CI/CD pipeline
- Docker support
- Better image optimization
- SEO improvements

---

## Screenshots To Add

When screenshots are ready, add them here:

```txt
docs/screenshots/home.png
docs/screenshots/properties.png
docs/screenshots/map-view.png
docs/screenshots/property-detail.png
docs/screenshots/admin-dashboard.png
docs/screenshots/property-form.png
docs/screenshots/admin-leads.png
```

Then replace the preview placeholders at the top of this README with real image links:

```md
![Home](docs/screenshots/home.png)
![Property Listing](docs/screenshots/properties.png)
![Map View](docs/screenshots/map-view.png)
```

---

## Author

**Akın Baş**

- GitHub: [@akinbs](https://github.com/akinbs)
- Email: akinbas2002@gmail.com

---


