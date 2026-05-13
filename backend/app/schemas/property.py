"""
Property Pydantic schema'ları.

Tasarım kararı: Firestore'daki dokümanlar ve API response'lar camelCase
alanlar kullanır. Bu, frontend TypeScript tipleriyle birebir uyum sağlar
ve dönüşüm maliyetini ortadan kaldırır.
"""
from typing import Literal
from pydantic import BaseModel, Field

ListingType = Literal["sale", "rent"]
PropertyType = Literal["apartment", "house", "villa", "land", "office", "commercial"]
PropertyStatus = Literal["draft", "active", "passive", "sold", "rented"]
Currency = Literal["TRY", "USD", "EUR"]
SortBy = Literal["date_desc", "date_asc", "price_asc", "price_desc"]


# ── Alt schema'lar ─────────────────────────────────────────────────────────

class LocationSchema(BaseModel):
    lat: float
    lng: float


class PropertyImageSchema(BaseModel):
    url: str
    path: str | None = None
    alt: str | None = None
    sortOrder: int = 0


# ── Base ────────────────────────────────────────────────────────────────────

class PropertyBase(BaseModel):
    title: str
    description: str = ""
    listingType: ListingType
    propertyType: PropertyType
    price: float = Field(gt=0)
    currency: Currency = "TRY"
    city: str
    district: str
    neighborhood: str = ""
    addressText: str | None = None
    location: LocationSchema
    rooms: str
    bathrooms: int = Field(default=1, ge=0)
    grossArea: int = Field(ge=0)
    netArea: int = Field(ge=0)
    buildingAge: int = Field(default=0, ge=0)
    floor: int = 0
    totalFloors: int = Field(default=1, ge=1)
    heating: str = ""
    furnished: bool = False
    features: list[str] = Field(default_factory=list)
    images: list[PropertyImageSchema] = Field(default_factory=list)
    status: PropertyStatus = "draft"
    featured: bool = False


# ── Create ──────────────────────────────────────────────────────────────────

class PropertyCreate(PropertyBase):
    slug: str | None = None  # Boş bırakılırsa title'dan otomatik üretilir
    ownerId: str | None = None


# ── Update — tüm alanlar optional ──────────────────────────────────────────

class PropertyUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    listingType: ListingType | None = None
    propertyType: PropertyType | None = None
    price: float | None = Field(default=None, gt=0)
    currency: Currency | None = None
    city: str | None = None
    district: str | None = None
    neighborhood: str | None = None
    addressText: str | None = None
    location: LocationSchema | None = None
    rooms: str | None = None
    bathrooms: int | None = Field(default=None, ge=0)
    grossArea: int | None = Field(default=None, ge=0)
    netArea: int | None = Field(default=None, ge=0)
    buildingAge: int | None = Field(default=None, ge=0)
    floor: int | None = None
    totalFloors: int | None = Field(default=None, ge=1)
    heating: str | None = None
    furnished: bool | None = None
    features: list[str] | None = None
    images: list[PropertyImageSchema] | None = None
    status: PropertyStatus | None = None
    featured: bool | None = None


# ── Read responses ──────────────────────────────────────────────────────────

class PropertyOut(PropertyBase):
    """Tam ilan detay response modeli."""
    id: str
    slug: str
    viewCount: int = 0
    ownerId: str | None = None
    createdAt: str | None = None
    updatedAt: str | None = None


class PropertyListItem(BaseModel):
    """Listeleme için hafif response modeli — gereksiz alanlar yok."""
    id: str
    title: str
    slug: str
    listingType: ListingType
    propertyType: PropertyType
    price: float
    currency: Currency
    city: str
    district: str
    neighborhood: str
    location: LocationSchema
    rooms: str
    bathrooms: int
    grossArea: int
    netArea: int
    images: list[PropertyImageSchema]
    status: PropertyStatus
    featured: bool
    viewCount: int = 0
    createdAt: str | None = None


# ── Query params dependency ─────────────────────────────────────────────────

class PropertyQueryParams:
    """
    /properties endpoint query parametrelerini temsil eder.
    FastAPI Depends() ile kullanılır.
    """
    def __init__(
        self,
        listingType: str | None = None,
        propertyType: str | None = None,
        city: str | None = None,
        district: str | None = None,
        neighborhood: str | None = None,
        priceMin: float | None = None,
        priceMax: float | None = None,
        rooms: str | None = None,
        featured: bool | None = None,
        status: str | None = None,
        sortBy: str = "date_desc",
        page: int = 1,
        limit: int = 12,
    ) -> None:
        self.listingType = listingType
        self.propertyType = propertyType
        self.city = city
        self.district = district
        self.neighborhood = neighborhood
        self.priceMin = priceMin
        self.priceMax = priceMax
        # Virgülle ayrılmış oda listesi: "2+1,3+1" → ["2+1", "3+1"]
        self.rooms: list[str] | None = [r.strip() for r in rooms.split(",")] if rooms else None
        self.featured = featured
        self.status = status
        self.sortBy = sortBy if sortBy in ("date_desc", "date_asc", "price_asc", "price_desc") else "date_desc"
        self.page = max(1, page)
        self.limit = max(1, min(50, limit))
