import logging
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from google.cloud.firestore import Client as FirestoreClient
from firebase_admin import App

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_firebase_app: App | None = None


def initialize_firebase() -> App | None:
    """
    Firebase Admin SDK'yı başlat.
    Zaten initialize edildiyse mevcut app'i döndür.
    Eksik env varsa development modda uyarı verip None döndür.
    """
    global _firebase_app

    if _firebase_app is not None:
        return _firebase_app

    # Zaten bir default app initialize edilmişse onu kullan
    try:
        _firebase_app = firebase_admin.get_app()
        return _firebase_app
    except ValueError:
        pass  # Henüz initialize edilmemiş, devam et

    settings = get_settings()

    if not settings.firebase_configured:
        logger.warning(
            "[EstateFlow] Firebase env değişkenleri eksik. "
            "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ve FIREBASE_PRIVATE_KEY "
            "backend/.env dosyasına ekleyin. "
            "Firebase özellikleri devre dışı çalışacak."
        )
        return None

    try:
        service_account = {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "client_email": settings.firebase_client_email,
            "private_key": settings.firebase_private_key_normalized,
            "token_uri": "https://oauth2.googleapis.com/token",
        }

        cred = credentials.Certificate(service_account)
        _firebase_app = firebase_admin.initialize_app(
            cred,
            {"storageBucket": settings.firebase_storage_bucket or f"{settings.firebase_project_id}.appspot.com"},
        )
        logger.info("[EstateFlow] Firebase Admin SDK başarıyla initialize edildi.")
        return _firebase_app

    except Exception as exc:
        logger.error("[EstateFlow] Firebase initialize hatası: %s", exc)
        return None


def get_firestore_client() -> FirestoreClient:
    """Firestore client döndür. Uygulama initialize olmadıysa RuntimeError fırlatır."""
    app = _firebase_app or firebase_admin.get_app()
    return firestore.client(app)


def get_auth_client() -> auth.Client:
    """Firebase Auth client döndür."""
    app = _firebase_app or firebase_admin.get_app()
    return auth.Client(app)


def get_storage_bucket():
    """
    Firebase Storage bucket döndür.
    Gerçek upload işlemi Adım 9'da implement edilecek.
    """
    # TODO (Step 9): Implement image upload via Firebase Storage
    app = _firebase_app or firebase_admin.get_app()
    return storage.bucket(app=app)


def is_firebase_ready() -> bool:
    """Firebase'in kullanılabilir olup olmadığını kontrol et."""
    try:
        firebase_admin.get_app()
        return True
    except ValueError:
        return False
