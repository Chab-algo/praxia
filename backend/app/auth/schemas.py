from pydantic import BaseModel


class ClerkUserPayload(BaseModel):
    sub: str  # clerk_user_id
    email: str | None = None
    org_id: str | None = None
    org_role: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
