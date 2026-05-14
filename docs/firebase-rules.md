# Firebase Security Rules — Final Taslak

> **Önemli:** Bu kurallar Firebase Emulator ile test edilmeden production'a uygulanmamalıdır.  
> Backend (FastAPI + Admin SDK) Firestore security rules'u bypass eder; bu beklenen bir davranıştır.

---

## Firestore Rules

Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Custom claim kontrolü — Admin SDK ile set edilmeli
    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }

    // ── properties ──────────────────────────────────────────────────────────
    // Public read: herkes aktif ilanları okuyabilir
    // Write: tamamen kapalı — tüm CRUD FastAPI Admin SDK üzerinden
    match /properties/{propertyId} {
      allow read: if resource.data.status == "active";
      allow create, update, delete: if false;
    }

    // ── leads ────────────────────────────────────────────────────────────────
    // Create: herkes lead oluşturabilir (contact form)
    // Read/Update/Delete: client'tan kapalı — backend üzerinden
    match /leads/{leadId} {
      allow create: if request.resource.data.keys().hasAll(['propertyId', 'name', 'email', 'message'])
                    && request.resource.data.name is string
                    && request.resource.data.name.size() >= 2
                    && request.resource.data.message.size() >= 10;
      allow read, update, delete: if false;
    }

    // ── users ────────────────────────────────────────────────────────────────
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // ── favorites (gelecek: Firestore'a taşınırsa) ───────────────────────────
    match /favorites/{userId}/{propertyId} {
      allow read, write: if isOwner(userId);
    }

    // ── savedSearches (gelecek) ───────────────────────────────────────────────
    match /savedSearches/{userId}/{searchId} {
      allow read, write: if isOwner(userId);
    }

    // Varsayılan: tüm erişimi kapat
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Storage Rules

Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    match /properties/{propertyId}/{fileName} {
      // Public read
      allow read: if true;

      // Write: authenticated kullanıcılar; production'da role claim ekle
      // allow write: if request.auth != null
      //              && (request.auth.token.role == 'admin'
      //                  || request.auth.token.role == 'agent')
      //              && request.resource.contentType.matches('image/(jpeg|png|webp)')
      //              && request.resource.size <= 5 * 1024 * 1024;
      allow write: if request.auth != null
                   && request.resource.contentType.matches('image/(jpeg|png|webp)')
                   && request.resource.size <= 5 * 1024 * 1024;

      // Delete: authenticated (production'da role claim ile kısıtla)
      allow delete: if request.auth != null;
    }

    match /users/{userId}/{allFiles=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Varsayılan: kapat
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Production İçin Custom Claims Kurulumu

Role-based write kısıtlaması için Admin SDK ile custom claim set edin:

```python
# FastAPI endpoint örneği
from firebase_admin import auth
auth.set_custom_user_claims(uid, {"role": "admin"})  # veya "agent"
```

Frontend'de token refresh:
```typescript
await user.getIdToken(true)  // force refresh — claim'ler anında yansır
```

---

## Notlar

| Konu | Açıklama |
|---|---|
| Admin SDK | Backend kuralları bypass eder — backend güvenli olduğu sürece doğrudur |
| Client write | properties koleksiyonuna client-side write kapalıdır |
| Lead create | Güvenlik açığını azaltmak için field validation kuralda yapılmaktadır |
| Storage size | 5 MB limiti Storage rules'da enforce edilmektedir |
| Test | Firebase Emulator Suite ile kuralları üretim öncesinde test edin |
