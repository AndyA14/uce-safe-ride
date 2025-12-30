from pydantic import BaseModel

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserClaims(BaseModel):
    sub: str
    role: str
