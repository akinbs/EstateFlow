from fastapi import APIRouter, Query, status

from app.core.security import AdminDep, CurrentUserDep
from app.schemas.common import PaginatedResponse
from app.schemas.lead import LeadCreate, LeadOut, LeadUpdate
from app.services import lead_service

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.post("", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
async def create_lead(body: LeadCreate) -> LeadOut:
    """
    Müşteri iletişim talebi oluşturur.
    Herkese açık endpoint — Firebase token zorunlu değil.
    """
    return await lead_service.create_lead(body)


@router.get("", response_model=PaginatedResponse[LeadOut])
async def list_leads(
    current_user: AdminDep,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    status: str | None = Query(default=None),
    propertyId: str | None = Query(default=None),
) -> PaginatedResponse[LeadOut]:
    """Admin için lead listesi. Admin yetkisi gerekir."""
    return await lead_service.list_leads(
        page=page,
        limit=limit,
        status_filter=status,
        property_id=propertyId,
    )


@router.get("/{lead_id}", response_model=LeadOut)
async def get_lead(lead_id: str, current_user: AdminDep) -> LeadOut:
    """Tek lead detayı. Admin yetkisi gerekir."""
    return await lead_service.get_lead_by_id(lead_id)


@router.patch("/{lead_id}", response_model=LeadOut)
async def update_lead(
    lead_id: str,
    body: LeadUpdate,
    current_user: AdminDep,
) -> LeadOut:
    """Lead status ve notlarını günceller. Admin yetkisi gerekir."""
    return await lead_service.update_lead(lead_id, body)
