from typing import Literal
from pydantic import BaseModel, EmailStr, Field, field_validator

LeadStatus = Literal["new", "contacted", "closed"]


class LeadCreate(BaseModel):
    propertyId: str
    propertyTitle: str | None = None
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=20)
    message: str = Field(min_length=10, max_length=2000)

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("İsim boş olamaz.")
        return v.strip()

    @field_validator("message")
    @classmethod
    def message_strip(cls, v: str) -> str:
        return v.strip()


class LeadUpdate(BaseModel):
    status: LeadStatus | None = None
    notes: str | None = None


class LeadOut(BaseModel):
    id: str
    propertyId: str
    propertyTitle: str | None = None
    name: str
    email: str
    phone: str | None = None
    message: str
    status: LeadStatus = "new"
    userId: str | None = None
    notes: str | None = None
    createdAt: str | None = None
    updatedAt: str | None = None
