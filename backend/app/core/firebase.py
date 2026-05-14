import logging
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from google.cloud.firestore import Client as FirestoreClient
from firebase_admin import App

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _patch_google_api_core_list_response() -> None:
    """
    google-api-core bazı Firestore REST hata yanıtlarını (liste formatı) parse
    edemez ve AttributeError fırlatır.  Bu patch listeyi dict'e dönüştürür ve
    gerçek Firestore hata mesajını loglar.
    """
    import google.api_core.exceptions as _gae

    if getattr(_gae, "_estateflow_patched", False):
        return

    _orig = _gae.from_http_response

    def _patched(response):
        try:
            payload = response.json()
            if isinstance(payload, list) and payload:
                inner = payload[0] if isinstance(payload[0], dict) else {}
                err = inner.get("error", {})
                if isinstance(err, dict):
                    logger.error(
                        "[Firestore] HTTP %s error: code=%s status=%s message=%s",
                        getattr(response, "status_code", "?"),
                        err.get("code"), err.get("status"), err.get("message"),
                    )
                # Rebuild a minimal fake response with dict body so _orig works
                import json as _json

                class _Wrap:
                    status_code = getattr(response, "status_code", 400)
                    headers = getattr(response, "headers", {})
                    content = _json.dumps(inner).encode()

                    def json(self_):
                        return inner

                return _orig(_Wrap())
        except Exception:
            pass
        return _orig(response)

    _gae.from_http_response = _patched
    _gae._estateflow_patched = True
    logger.info("[EstateFlow] google-api-core list-response patch uygulandı.")

_firebase_app: App | None = None
_fs_client: FirestoreClient | None = None


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
    """Firestore client — REST transport (Windows SSL uyumluluğu, gRPC yok)."""
    _patch_google_api_core_list_response()
    global _fs_client
    if _fs_client is not None:
        return _fs_client

    from google.cloud import firestore as gc_firestore
    from google.cloud.firestore_v1.services.firestore import FirestoreClient as _GapicClient
    from google.cloud.firestore_v1.services.firestore.transports.rest import (
        FirestoreRestTransport,
    )

    app = _firebase_app or firebase_admin.get_app()
    settings = get_settings()
    google_cred = app.credential.get_credential()

    rest_transport = FirestoreRestTransport(
        credentials=google_cred,
        host="firestore.googleapis.com",
    )
    _fs_client = gc_firestore.Client(
        project=settings.firebase_project_id,
        credentials=google_cred,
    )
    _fs_client._firestore_api_internal = _GapicClient(transport=rest_transport)

    logger.info("[EstateFlow] Firestore REST transport aktif.")
    return _fs_client


def get_auth_client() -> auth.Client:
    """Firebase Auth client döndür."""
    app = _firebase_app or firebase_admin.get_app()
    return auth.Client(app)


def get_storage_bucket():
    """Firebase Storage bucket döndür. Upload client SDK üzerinden yapılır."""
    app = _firebase_app or firebase_admin.get_app()
    return storage.bucket(app=app)


def is_firebase_ready() -> bool:
    """Firebase'in kullanılabilir olup olmadığını kontrol et."""
    try:
        firebase_admin.get_app()
        return True
    except ValueError:
        return False
