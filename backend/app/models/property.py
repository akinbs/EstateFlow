"""
Firestore 'properties' koleksiyonu doküman yapısını temsil eden TypedDict'ler.
Bunlar Pydantic model değil — Firestore'dan okunan ham dict'leri type-safe
şekilde işlemek için kullanılır.
"""
from typing import TypedDict, Literal, NotRequired


class PropertyLocationDoc(TypedDict):
    lat: float
    lng: float


class PropertyImageDoc(TypedDict):
    url: str
    path: NotRequired[str | None]
    alt: NotRequired[str | None]
    sortOrder: NotRequired[int]


class PropertyDoc(TypedDict):
    id: str
    title: str
    slug: str
    description: str
    listingType: Literal["sale", "rent"]
    propertyType: Literal["apartment", "house", "villa", "land", "office", "commercial"]
    price: float
    currency: Literal["TRY", "USD", "EUR"]
    city: str
    district: str
    neighborhood: str
    addressText: NotRequired[str | None]
    location: PropertyLocationDoc
    rooms: str
    bathrooms: int
    grossArea: int
    netArea: int
    buildingAge: int
    floor: int
    totalFloors: int
    heating: str
    furnished: bool
    features: list[str]
    images: list[PropertyImageDoc]
    status: Literal["draft", "active", "passive", "sold", "rented"]
    featured: bool
    viewCount: int
    ownerId: NotRequired[str | None]
    createdAt: NotRequired[str | None]
    updatedAt: NotRequired[str | None]
