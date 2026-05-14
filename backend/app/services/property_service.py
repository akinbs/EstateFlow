"""
Property service — tüm Firestore 'properties' koleksiyon işlemleri burada.
Endpoint'ler bu servis fonksiyonlarını çağırır; Firestore'a doğrudan erişmez.
"""
import logging
from typing import Any

from fastapi import HTTPException, status

from app.core.firebase import get_firestore_client
from app.schemas.property import (
    PropertyCreate,
    PropertyListItem,
    PropertyOut,
    PropertyQueryParams,
    PropertyUpdate,
)
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.utils.slugify import slugify, ensure_unique_slug
from app.utils.firestore import now_utc, doc_to_dict, calculate_pagination, clean_none_values

logger = logging.getLogger(__name__)

COLLECTION = "properties"


def _to_list_item(data: dict[str, Any]) -> PropertyListItem:
    return PropertyListItem(
        id=data.get("id", ""),
        title=data.get("title", ""),
        slug=data.get("slug", ""),
        listingType=data.get("listingType", "sale"),
        propertyType=data.get("propertyType", "apartment"),
        price=float(data.get("price", 0)),
        currency=data.get("currency", "TRY"),
        city=data.get("city", ""),
        district=data.get("district", ""),
        neighborhood=data.get("neighborhood", ""),
        location=data.get("location", {"lat": 0.0, "lng": 0.0}),
        rooms=data.get("rooms", ""),
        bathrooms=data.get("bathrooms", 0),
        grossArea=data.get("grossArea", 0),
        netArea=data.get("netArea", 0),
        images=data.get("images", []),
        status=data.get("status", "active"),
        featured=data.get("featured", False),
        viewCount=data.get("viewCount", 0),
        createdAt=data.get("createdAt"),
    )


def _to_property_out(data: dict[str, Any]) -> PropertyOut:
    return PropertyOut(
        id=data.get("id", ""),
        title=data.get("title", ""),
        slug=data.get("slug", ""),
        description=data.get("description", ""),
        listingType=data.get("listingType", "sale"),
        propertyType=data.get("propertyType", "apartment"),
        price=float(data.get("price", 0)),
        currency=data.get("currency", "TRY"),
        city=data.get("city", ""),
        district=data.get("district", ""),
        neighborhood=data.get("neighborhood", ""),
        addressText=data.get("addressText"),
        location=data.get("location", {"lat": 0.0, "lng": 0.0}),
        rooms=data.get("rooms", ""),
        bathrooms=data.get("bathrooms", 0),
        grossArea=data.get("grossArea", 0),
        netArea=data.get("netArea", 0),
        buildingAge=data.get("buildingAge", 0),
        floor=data.get("floor", 0),
        totalFloors=data.get("totalFloors", 1),
        heating=data.get("heating", ""),
        furnished=data.get("furnished", False),
        features=data.get("features", []),
        images=data.get("images", []),
        status=data.get("status", "active"),
        featured=data.get("featured", False),
        viewCount=data.get("viewCount", 0),
        ownerId=data.get("ownerId"),
        createdAt=data.get("createdAt"),
        updatedAt=data.get("updatedAt"),
    )


async def list_properties(
    params: PropertyQueryParams,
    include_non_active: bool = False,
) -> PaginatedResponse[PropertyListItem]:
    """
    Filtrelenmiş ve sayfalanmış ilan listesi döndürür.

    include_non_active=True olduğunda (admin mode):
    - params.status yoksa tüm statüsler gösterilir
    - params.status varsa o statüse göre filtrelenir ("all" ise hepsi)
    """
    db = get_firestore_client()

    # Tüm filtreleme Python tarafında — Firestore compound query / composite
    # index sorunundan tamamen kaçınmak için salt koleksiyon okuma kullanılır.
    _FETCH_LIMIT = 500
    raw = db.collection(COLLECTION).limit(_FETCH_LIMIT).stream()
    all_docs = [doc_to_dict(d) for d in raw]

    # Status filtresi
    if not include_non_active:
        target_status = params.status if params.status else "active"
        all_docs = [d for d in all_docs if d.get("status") == target_status]
    else:
        if params.status and params.status != "all":
            all_docs = [d for d in all_docs if d.get("status") == params.status]

    if params.listingType:
        all_docs = [d for d in all_docs if d.get("listingType") == params.listingType]

    if params.featured is not None:
        all_docs = [d for d in all_docs if d.get("featured") == params.featured]

    if params.city:
        all_docs = [d for d in all_docs if d.get("city", "").lower() == params.city.lower()]

    if params.district:
        all_docs = [d for d in all_docs if d.get("district", "").lower() == params.district.lower()]

    if params.neighborhood:
        all_docs = [d for d in all_docs if d.get("neighborhood", "").lower() == params.neighborhood.lower()]

    if params.propertyType:
        all_docs = [d for d in all_docs if d.get("propertyType") == params.propertyType]

    if params.priceMin is not None:
        all_docs = [d for d in all_docs if float(d.get("price", 0)) >= params.priceMin]

    if params.priceMax is not None:
        all_docs = [d for d in all_docs if float(d.get("price", 0)) <= params.priceMax]

    if params.rooms:
        all_docs = [d for d in all_docs if d.get("rooms") in params.rooms]

    # Python-side sorting
    if params.sortBy == "price_asc":
        all_docs.sort(key=lambda d: float(d.get("price", 0)))
    elif params.sortBy == "price_desc":
        all_docs.sort(key=lambda d: float(d.get("price", 0)), reverse=True)
    elif params.sortBy == "date_asc":
        all_docs.sort(key=lambda d: str(d.get("createdAt", "")))
    else:
        all_docs.sort(key=lambda d: str(d.get("createdAt", "")), reverse=True)

    total = len(all_docs)
    start = (params.page - 1) * params.limit
    page_docs = all_docs[start : start + params.limit]

    pagination = calculate_pagination(total, params.page, params.limit)

    return PaginatedResponse[PropertyListItem](
        data=[_to_list_item(d) for d in page_docs],
        meta=PaginationMeta(**pagination),
    )


async def get_property_by_slug(slug: str) -> PropertyOut:
    """Slug'a göre ilan döndürür. Bulunamazsa 404."""
    db = get_firestore_client()
    # Tek equality filter — composite index gerektirmez.
    docs = (
        db.collection(COLLECTION)
        .where("slug", "==", slug)
        .limit(1)
        .stream()
    )
    results = list(docs)
    if not results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with slug '{slug}' not found.",
        )
    return _to_property_out(doc_to_dict(results[0]))


async def get_property_by_id(property_id: str) -> PropertyOut:
    """ID'ye göre ilan döndürür (admin/internal). Bulunamazsa 404."""
    db = get_firestore_client()
    doc = db.collection(COLLECTION).document(property_id).get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property '{property_id}' not found.",
        )
    return _to_property_out(doc_to_dict(doc))


async def create_property(data: PropertyCreate, owner_id: str | None = None) -> PropertyOut:
    """Yeni ilan oluşturur. Slug otomatik üretilir ya da verileni kullanır."""
    db = get_firestore_client()

    base_slug = slugify(data.slug or data.title)
    existing = {
        d.get("slug", "")
        for d in [doc_to_dict(doc) for doc in db.collection(COLLECTION).stream()]
        if d.get("slug")
    }
    unique_slug = ensure_unique_slug(base_slug, existing)

    ts = now_utc()
    doc_data: dict[str, Any] = {
        **data.model_dump(exclude={"slug", "ownerId"}),
        "slug": unique_slug,
        "ownerId": owner_id or data.ownerId,
        "viewCount": 0,
        "createdAt": ts,
        "updatedAt": ts,
    }

    ref = db.collection(COLLECTION).document()
    ref.set(doc_data)

    return _to_property_out({**doc_data, "id": ref.id})


async def update_property(property_id: str, data: PropertyUpdate) -> PropertyOut:
    """Kısmi güncelleme yapar. Sadece gönderilen alanları değiştirir."""
    db = get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(property_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property '{property_id}' not found.",
        )

    update_data = clean_none_values(data.model_dump(exclude_none=True))
    update_data["updatedAt"] = now_utc()
    doc_ref.update(update_data)

    return await get_property_by_id(property_id)


async def update_property_status(property_id: str, new_status: str) -> PropertyOut:
    """Sadece status alanını günceller."""
    db = get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(property_id)
    if not doc_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property '{property_id}' not found.",
        )
    doc_ref.update({"status": new_status, "updatedAt": now_utc()})
    return await get_property_by_id(property_id)


async def update_property_featured(property_id: str, featured: bool) -> PropertyOut:
    """Sadece featured alanını günceller."""
    db = get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(property_id)
    if not doc_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property '{property_id}' not found.",
        )
    doc_ref.update({"featured": featured, "updatedAt": now_utc()})
    return await get_property_by_id(property_id)


async def delete_property(property_id: str) -> dict[str, str]:
    """Soft delete — status='passive' yapar."""
    db = get_firestore_client()
    doc_ref = db.collection(COLLECTION).document(property_id)
    if not doc_ref.get().exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property '{property_id}' not found.",
        )
    doc_ref.update({"status": "passive", "updatedAt": now_utc()})
    return {"message": f"Property '{property_id}' deactivated successfully."}


async def get_stats() -> dict[str, Any]:
    """Admin dashboard için Firestore koleksiyon sayımları."""
    db = get_firestore_client()
    all_props = list(db.collection(COLLECTION).stream())
    all_leads = list(db.collection("leads").stream())

    active = sum(1 for d in all_props if (d.to_dict() or {}).get("status") == "active")
    passive = sum(1 for d in all_props if (d.to_dict() or {}).get("status") == "passive")
    featured = sum(1 for d in all_props if (d.to_dict() or {}).get("featured") is True)
    new_leads = sum(1 for d in all_leads if (d.to_dict() or {}).get("status") == "new")

    return {
        "totalProperties": len(all_props),
        "activeProperties": active,
        "passiveProperties": passive,
        "featuredProperties": featured,
        "totalLeads": len(all_leads),
        "newLeads": new_leads,
    }
