# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import datetime

# --- Esquemas de Perfil (Necesarios para UserRead anidado) ---
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None # Para el campo JSONB

class ProfileCreate(ProfileBase):
    pass # Hereda de ProfileBase, podría añadir campos específicos de creación si los hubiera

class ProfileUpdate(ProfileBase):
    pass # Hereda de ProfileBase

class ProfileRead(ProfileBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    class Config:
        # Pydantic V2:
        from_attributes = True

# --- Esquemas de Usuario ---
class UserBase(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, example="SecurePassword123")
    # Podrías recibir datos del perfil aquí también si se crean juntos
    profile: Optional[ProfileCreate] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, example="new_email@example.com")
    password: Optional[str] = Field(None, min_length=8, example="NewSecurePassword123")
    is_active: Optional[bool] = None
    # Podrías permitir actualizar el perfil aquí
    profile: Optional[ProfileUpdate] = None

class UserRead(UserBase):
    """Schema para leer datos de usuario (sin contraseña)."""
    id: int
    is_active: bool
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    profile: Optional[ProfileRead] = None # Incluye el perfil asociado

    class Config:
        # Pydantic V2:
        from_attributes = True

class UserInDB(UserRead):
    """Schema que incluye la contraseña hasheada (para uso interno)."""
    hashed_password: str

# --- NUEVOS Esquemas para Restablecimiento de Contraseña ---
class PasswordResetRequest(BaseModel):
    """Esquema para la solicitud de recuperación de contraseña (solo email)."""
    email: EmailStr = Field(..., example="user@example.com")

class UserPasswordReset(BaseModel):
    """Esquema para el restablecimiento de contraseña (token y nueva contraseña)."""
    token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    new_password: str = Field(..., min_length=8, example="VerySecureNewPassword123")
