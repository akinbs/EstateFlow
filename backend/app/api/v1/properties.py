from fastapi import APIRouter, Depends, status

from app.core.security import AgentOrAdminDep, CurrentUserDep
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.property import (
    PropertyCreate,
    PropertyListItem,
    PropertyOut,
    PropertyQueryParams,
    PropertyUpdate,
)
from app.services import property_service

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.get("", response_model=PaginatedResponse[PropertyListItem])
async def list_properties(
    params: PropertyQueryParams = Depends(),
) -> PaginatedResponse[PropertyListItem]:
    """Filtrelenmiş ve sayfalanmış ilan listesi."""
    return await property_service.list_properties(params)


@router.get("/{slug}", response_model=PropertyOut)
async def get_property(slug: str) -> PropertyOut:
    """Slug'a göre aktif ilan detayı."""
    return await property_service.get_property_by_slug(slug)


@router.post("", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
async def create_property(
    body: PropertyCreate,
    current_user: AgentOrAdminDep,
) -> PropertyOut:
    """Yeni ilan oluşturur. Agent veya Admin yetkisi gerekir."""
    return await property_service.create_property(body, owner_id=current_user.uid)


@router.put("/{property_id}", response_model=PropertyOut)
async def update_property(
    property_id: str,
    body: PropertyUpdate,
    current_user: AgentOrAdminDep,
) -> PropertyOut:
    """İlan günceller. Agent veya Admin yetkisi gerekir."""
    return await property_service.update_property(property_id, body)


@router.delete("/{property_id}", response_model=MessageResponse)
async def delete_property(
    property_id: str,
    current_user: AgentOrAdminDep,
) -> MessageResponse:
    """İlanı pasife çeker (soft delete). Agent veya Admin yetkisi gerekir."""
    result = await property_service.delete_property(property_id)
    return MessageResponse(message=result["message"])


@router.get("/id/{property_id}", response_model=PropertyOut)
async def get_property_by_id(
    property_id: str,
    current_user: AgentOrAdminDep,
) -> PropertyOut:
    """ID'ye göre ilan detayı (admin/internal kullanım)."""
    return await property_service.get_property_by_id(property_id)
