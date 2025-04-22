# app/api/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Annotated # Usar Annotated para tipado moderno de Depends

from app.db.session import get_db
from app.security import core as security_core
from app.crud import user as crud_user
from app.models.user import User
from app.schemas.token import TokenData
from app.core.config import settings

# Define el esquema OAuth2 apuntando al endpoint de login
# La URL es relativa al prefijo de la API v1
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")

# Alias de tipo para inyección de dependencias de sesión de DB
DbSession = Annotated[Session, Depends(get_db)]
# Alias de tipo para inyección de dependencias de token
TokenDep = Annotated[str, Depends(oauth2_scheme)]


def get_current_user(
    db: DbSession, token: TokenDep
) -> User | None:
    """
    Dependencia para obtener el usuario asociado con el token JWT actual.
    Devuelve el objeto User o None si no se encuentra o hay error.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = security_core.decode_access_token(token)
    if not token_data or not token_data.email:
        # No lanzamos excepción aquí, permitimos que el endpoint decida
        # si el usuario es opcional o requerido.
        return None
    user = crud_user.get_user_by_email(db, email=token_data.email)
    if user is None:
         # El email en el token no corresponde a un usuario existente
        return None
    return user

def get_current_active_user(
    current_user: Annotated[User | None, Depends(get_current_user)]
) -> User:
    """
    Dependencia para obtener el usuario activo actual.
    Lanza HTTPException si el usuario no está autenticado o está inactivo.
    """
    if current_user is None:
         raise HTTPException(
             status_code=status.HTTP_401_UNAUTHORIZED,
             detail="Not authenticated",
             headers={"WWW-Authenticate": "Bearer"},
         )
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

# Dependencia para obtener el usuario actual (puede ser None si el token es inválido/ausente)
CurrentUser = Annotated[User | None, Depends(get_current_user)]
# Dependencia para obtener el usuario activo actual (lanza error si no es válido o activo)
ActiveUser = Annotated[User, Depends(get_current_active_user)]

# --- Podrías añadir dependencias para roles/permisos aquí si fuera necesario ---
# def get_current_admin_user(...) -> User: ...