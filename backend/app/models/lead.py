"""Firestore 'leads' koleksiyonu doküman yapısı."""
from typing import TypedDict, Literal, NotRequired


class LeadDoc(TypedDict):
    id: str
    propertyId: str
    propertyTitle: NotRequired[str | None]
    name: str
    email: str
    phone: NotRequired[str | None]
    message: str
    status: Literal["new", "contacted", "closed"]
    userId: NotRequired[str | None]
    createdAt: NotRequired[str | None]
    updatedAt: NotRequired[str | None]
