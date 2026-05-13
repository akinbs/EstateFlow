"""Firestore 'users' koleksiyonu doküman yapısı."""
from typing import TypedDict, Literal, NotRequired


class UserDoc(TypedDict):
    id: str
    email: str
    displayName: NotRequired[str | None]
    photoURL: NotRequired[str | None]
    role: Literal["user", "agent", "admin"]
    phone: NotRequired[str | None]
    createdAt: NotRequired[str | None]
    updatedAt: NotRequired[str | None]
