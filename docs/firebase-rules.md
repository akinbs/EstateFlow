# Firebase Security Rules — Taslak

> ⚠️ Bu kurallar başlangıç taslağıdır. Adım 10'da (güvenlik ve deployment) production'a alınmadan önce sıkılaştırılacaktır.

---

## Firestore Security Rules

Firebase Console → Firestore Database → Rules sekmesine yapıştırın.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Kullanıcı kimliği doğrulanmış mı?
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper: İsteği yapan kullanıcı belgenin sahibi mi?
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Helper: Admin custom claim kontrolü
    // TODO (Step 10): Firebase Admin SDK ile custom claim set edildikten
    // sonra bu kontrol gerçek anlamda çalışacak.
    function isAdmin() {
      return isAuthenticated() &&
             request.auth.token.role == 'admin';
    }

    // -------------------------
    // properties koleksiyonu
    // -------------------------
    // Public read: Frontend liste/detay için FastAPI'yi kullanacak.
    // Ancak doğrudan Firestore erişimi de açık bırakılabilir (okuma için).
    // Write: Sadece backend (Firebase Admin SDK) yapacak.
    match /properties/{propertyId} {
      allow read: if true;   // Public okuma

      // Client-side write tamamen kapalı.
      // Tüm create/update/delete işlemleri FastAPI → Admin SDK üzerinden yapılacak.
      allow create, update, delete: if false;
    }

    // -------------------------
    // users koleksiyonu
    // -------------------------
    // Kullanıcı sadece kendi dokümanını okuyup yazabilir.
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // -------------------------
    // favorites koleksiyonu (subcollection)
    // -------------------------
    // Kullanıcı sadece kendi favorilerini yönetebilir.
    match /favorites/{userId}/items/{itemId} {
      allow read, write: if isOwner(userId);
    }

    // -------------------------
    // leads koleksiyonu
    // -------------------------
    // create: Giriş yapmış veya misafir kullanıcı talep gönderebilir.
    // read/update/delete: Sadece admin (backend tarafından yapılacak).
    match /leads/{leadId} {
      allow create: if true;  // Misafir de form gönderebilir
      allow read, update, delete: if isAdmin();
    }

    // -------------------------
    // savedSearches koleksiyonu (subcollection)
    // -------------------------
    match /savedSearches/{userId}/searches/{searchId} {
      allow read, write: if isOwner(userId);
    }

    // Diğer tüm koleksiyonlara erişimi kapat (varsayılan olarak deny)
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Cloud Storage Security Rules

Firebase Console → Storage → Rules sekmesine yapıştırın.

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // -------------------------
    // Emlak fotoğrafları
    // -------------------------
    match /properties/{propertyId}/{allImages=**} {
      // Okuma herkese açık (public CDN gibi davranır)
      allow read: if true;

      // Yazma: Sadece giriş yapmış kullanıcılar (şimdilik)
      // TODO (Step 10): Sadece admin custom claim'e sahip kullanıcılara izin ver:
      //   && request.auth.token.role == 'admin'
      // TODO (Step 10): Dosya boyutu ve content type kontrolü ekle:
      //   && request.resource.size < 10 * 1024 * 1024   // max 10MB
      //   && request.resource.contentType.matches('image/.*')
      allow write: if request.auth != null;
    }

    // -------------------------
    // Kullanıcı profil fotoğrafları
    // -------------------------
    match /users/{userId}/{allFiles=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Diğer her şey kapalı
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Önemli Notlar

| Konu | Açıklama |
|---|---|
| **Admin SDK** | Backend'deki Firebase Admin SDK güvenlik kurallarını bypass eder — backend güvenli olduğu sürece bu normaldir |
| **Custom Claims** | `role: 'admin'` gibi claim'ler Firebase Admin SDK ile set edilir, Adım 4'te yapılacak |
| **Property CRUD** | Client-side write tamamen kapalı; tüm yazma işlemleri FastAPI üzerinden Admin SDK ile yapılır |
| **Production** | Adım 10'da rules gözden geçirilecek ve sıkılaştırılacak |
