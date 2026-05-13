from typing import Literal
from pydantic import BaseModel


class CurrentUser(BaseModel):
    uid: str
    email: str | None = None
    name: str | None = None
    picture: str | None = None
    role: Literal["user", "agent", "admin"] = "user"


class TokenVerifyResponse(BaseModel):
    authenticated: bool
    user: CurrentUser
