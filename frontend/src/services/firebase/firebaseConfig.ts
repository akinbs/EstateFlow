import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missing = requiredEnvVars.filter(
  (key) => !import.meta.env[key],
)

if (missing.length > 0) {
  console.error(
    '[EstateFlow] Firebase config eksik env değişkenleri:',
    missing.join(', '),
    '\nfrontend/.env dosyanıza Firebase Console\'dan aldığınız değerleri ekleyin.',
  )
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app: FirebaseApp         = initializeApp(firebaseConfig)
const auth: Auth               = getAuth(app)
const db: Firestore            = getFirestore(app)
const storage: FirebaseStorage = getStorage(app)
const googleProvider            = new GoogleAuthProvider()

googleProvider.setCustomParameters({ prompt: 'select_account' })

export { app, auth, db, storage, googleProvider }
