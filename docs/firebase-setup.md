# Firebase Console Kurulum Rehberi

Bu rehberi Adım 3 başında takip edin. Tamamlanması ~10 dakika sürer.

---

## Adım 1 — Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. **"Add project"** → Proje adı: `estateflow` veya `estateflow-dev`
3. Google Analytics: tercihe bağlı (geliştirme için kapatılabilir)
4. **"Create project"** → Tamamlanmasını bekleyin

---

## Adım 2 — Web Uygulaması Kaydet

1. Proje sayfasında `</>` (Web) ikonuna tıklayın
2. App nickname: `estateflow-web`
3. Firebase Hosting: bu adımda eklemeyin
4. **"Register app"** tıklayın
5. `firebaseConfig` değerlerini kopyalayın

Kopyaladığınız değerleri `frontend/.env` dosyasına şöyle ekleyin:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=estateflow-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=estateflow-xxxx
VITE_FIREBASE_STORAGE_BUCKET=estateflow-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> `.env` dosyası `.gitignore`'da tanımlı — commit etmeyin.

---

## Adım 3 — Authentication Aktifleştir

1. Sol menüden **Build → Authentication** gidin
2. **"Get started"** tıklayın
3. **Sign-in method** sekmesine geçin

### Email/Password:
- "Email/Password" satırına tıklayın
- "Enable" → Save

### Google:
- "Google" satırına tıklayın
- "Enable"
- Project support email seçin (Firebase Console'daki kendi e-postanız)
- Save

---

## Adım 4 — Firestore Database Oluştur

1. Sol menüden **Build → Firestore Database** gidin
2. **"Create database"** tıklayın
3. Location: `europe-west1` (Belçika) veya `eur3` — Türkiye'ye en yakın
4. Security Rules:
   - **"Start in test mode"** seçin (geliştirme için)
   - Production'da `firebase-rules.md`'deki kuralları uygulayın
5. **"Enable"** → Tamamlanmasını bekleyin

---

## Adım 5 — Cloud Storage Oluştur

1. Sol menüden **Build → Storage** gidin
2. **"Get started"** tıklayın
3. Security Rules:
   - **"Start in test mode"** seçin
4. Location: Firestore ile aynı region seçin
5. **"Done"**

---

## Adım 6 — Firestore Rules Uygula

1. **Firestore Database → Rules** sekmesine gidin
2. `docs/firebase-rules.md` içindeki Firestore rules'u yapıştırın
3. **"Publish"** tıklayın

---

## Adım 7 — Storage Rules Uygula

1. **Storage → Rules** sekmesine gidin
2. `docs/firebase-rules.md` içindeki Storage rules'u yapıştırın
3. **"Publish"** tıklayın

---

## Adım 8 — Test Kullanıcısı Oluştur

**Seçenek A — Uygulamadan kayıt:**
1. `npm run dev` ile uygulamayı başlatın
2. `/login` sayfasına gidin
3. "Kayıt Ol" sekmesiyle yeni kullanıcı oluşturun

**Seçenek B — Firebase Console:**
1. Authentication → Users → "Add user"
2. Email ve şifre girin

---

## Adım 9 — Admin Kullanıcı Ayarla (Sonraki Adımda)

Admin rolü Firebase Admin SDK custom claims ile set edilecek.
Bu adım Adım 4 (FastAPI backend) tamamlandıktan sonra yapılacak.

```bash
# Ön izleme — FastAPI endpoint ile yapılacak:
POST /api/v1/admin/set-role
Authorization: Bearer <super_admin_token>
Body: { "userId": "...", "role": "admin" }
```

---

## Kontrol Listesi

```
[ ] Firebase projesi oluşturuldu
[ ] Web app kaydedildi
[ ] .env değerleri dolduruldu
[ ] Email/Password auth aktif
[ ] Google auth aktif
[ ] Firestore veritabanı oluşturuldu
[ ] Storage oluşturuldu
[ ] Firestore rules uygulandı
[ ] Storage rules uygulandı
[ ] Test kullanıcısı oluşturuldu
[ ] Login sayfasından giriş test edildi
```
