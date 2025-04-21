from pydantic import BaseModel

class Token(BaseModel):
    """Schema para la respuesta del token JWT."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema para los datos contenidos dentro del token JWT."""
    email: str | None = None