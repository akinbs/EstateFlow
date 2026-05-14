"""Lead service — Firestore 'leads' koleksiyon işlemleri."""
import logging
from typing import Any

from fastapi import HTTPException, status

from app.core.firebase import get_firestore_client
from app.schemas.lead import LeadCreate, LeadOut, LeadUpdate
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.utils.firestore import now_utc, doc_to_dict, calculate_pagination

logger = logging.getLogger(__name__)

COLLECTION = "leads"


def _to_lead_out(data: dict[str, Any]) -> LeadOut:
    return LeadOut(
        id=data.get("id", ""),
        propertyId=data.get("propertyId", ""),
        propertyTitle=data.get("propertyTitle"),
        name=data.get("name", ""),
        email=data.get("email", ""),
        phone=data.get("phone"),
        message=data.get("message", ""),
        status=data.get("status", "new"),
        userId=data.get("userId"),
        notes=data.get("notes"),
        createdAt=data.get("createdAt"),
        updatedAt=data.get("updatedAt"),
    )


async def create_lead(data: LeadCreate, user_id: str | None = None) -> LeadOut:
    """Yeni müşteri iletişim talebi oluşturur."""
    db = get_firestore_client()

    ts = now_utc()
    doc_data: dict[str, Any] = {
        **data.model_dump(),
        "userId": user_id,
        "status": "new",
        "notes": None,
        "createdAt": ts,
        "updatedAt": ts,
    }

    ref = db.collection(COLLECTION).document()
    ref.set(doc_data)

    return _to_lead_out({**doc_data, "id": ref.id})


async def list_leads(
    page: int = 1,
    limit: int = 20,
    status_filter: str | None = None,
    property_id: str | None = None,
) -> PaginatedResponse[LeadOut]:
    """Admin için lead listesi — isteğe bağlı filtreler ile."""
    db = get_firestore_client()
    ref = db.collection(COLLECTION)

    if status_filter:
        ref = ref.where("status", "==", status_filter)

    if property_id:
        ref = ref.where("propertyId", "==", property_id)

    ref = ref.order_by("createdAt", direction="DESCENDING")

    _FETCH_LIMIT = 500
    docs = ref.limit(_FETCH_LIMIT).stream()
    all_docs = [doc_to_dict(d) for d in docs]

    total = len(all_docs)
    start = (page - 1) * limit
    page_docs = all_docs[start : start + limit]

    pagination = calculate_pagination(total, page, limit)

    return PaginatedResponse[LeadOut](
        data=[_to_lead_out(d) for d in page_docs],
        meta=PaginationMeta(**pagination),
    )


async def get_lead_by_id(lead_id: str) -> LeadOut:
    """ID'ye göre lead döndürür. Bulunamazsa 404."""
    db = get_firestore_client()
    doc = db.collection(COLLECTION).document(lead_id).get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead '{lead_id}' not found.",
        )
    return _to_lead_out(doc_to_dict(doc))


async def get_recent_leads(limit: int = 5) -> list[dict[str, Any]]:
    """Dashboard için son lead'lerin hafif listesi."""
    db = get_firestore_client()
    docs = (
        db.collection(COLLECTION)
        .order_by("createdAt", direction="DESCENDING")
        .limit(limit)
        .stream()
    )
    return [doc_to_dict(d) for d in docs]


async def update_lead(lead_id: str, data: LeadUpdate) -> LeadOut:
    """Lead status ve/veya notları günceller."""
    db = get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(lead_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead '{lead_id}' not found.",
        )

    update_data: dict[str, Any] = {
        k: v for k, v in data.model_dump(exclude_none=True).items()
    }
    update_data["updatedAt"] = now_utc()
    doc_ref.update(update_data)

    return await get_lead_by_id(lead_id)
