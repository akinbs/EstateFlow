"""Firestore yardımcı fonksiyonlar."""
from datetime import datetime, timezone
from typing import Any


def now_utc() -> str:
    """UTC şimdiki zamanı ISO 8601 string olarak döndürür."""
    return datetime.now(timezone.utc).isoformat()


def firestore_timestamp_to_str(value: Any) -> str | None:
    """
    Firestore DatetimeWithNanoseconds, datetime veya string değerini
    ISO 8601 string'e dönüştürür. None gelirse None döner.
    """
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    # Firestore'un DatetimeWithNanoseconds tipi datetime'dan türer,
    # yukarıdaki isinstance kontrolü onu da yakalar.
    return str(value)


def doc_to_dict(doc: Any) -> dict[str, Any]:
    """
    Firestore DocumentSnapshot'ı düz dict'e çevirir.
    - id alanını ekler
    - Timestamp alanlarını ISO string'e çevirir
    """
    if doc is None or not doc.exists:
        return {}

    data: dict[str, Any] = doc.to_dict() or {}
    data["id"] = doc.id

    # Timestamp değerlerini string'e çevir
    for key, value in data.items():
        if hasattr(value, "isoformat"):  # datetime-like
            data[key] = value.isoformat()

    return data


def clean_none_values(data: dict[str, Any]) -> dict[str, Any]:
    """None olan alanları dict'ten çıkarır (Firestore update için)."""
    return {k: v for k, v in data.items() if v is not None}


def calculate_pagination(total: int, page: int, limit: int) -> dict[str, Any]:
    """Sayfalama meta bilgisini hesaplar."""
    total_pages = max(1, -(-total // limit))  # ceiling division
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": total_pages,
        "hasNext": page < total_pages,
        "hasPrev": page > 1,
    }
