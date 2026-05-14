from typing import Any
from fastapi import APIRouter, Depends

from app.core.security import AdminDep, AgentOrAdminDep
from app.schemas.common import PaginatedResponse
from app.schemas.property import PropertyListItem, PropertyQueryParams
from app.services import property_service, lead_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def get_admin_stats(current_user: AdminDep) -> dict[str, Any]:
    """Admin dashboard istatistikleri."""
    stats = await property_service.get_stats()
    return {"requestedBy": current_user.uid, **stats}


@router.get("/properties", response_model=PaginatedResponse[PropertyListItem])
async def list_admin_properties(
    current_user: AgentOrAdminDep,
    params: PropertyQueryParams = Depends(),
) -> PaginatedResponse[PropertyListItem]:
    """
    Admin için tüm ilanları listeler.
    include_non_active=True ile çağrılır; status="all" veya boş bırakılırsa
    tüm statüslerdeki ilanlar döner.
    """
    return await property_service.list_properties(params, include_non_active=True)
