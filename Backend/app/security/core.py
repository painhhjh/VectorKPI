# app/security/core.py
from datetime import datetime, timedelta, timezone
from typing import Any, Union

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.token import TokenData  # Asegúrate que este schema existe

# Contexto para hashing de contraseñas usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Crea un token de acceso JWT.
    :param subject: El sujeto del token (generalmente user ID o email).
    :param expires_delta: Tiempo de vida del token. Si es None, usa el default.
    :return: El token JWT codificado.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña plana coincide con su hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña."""
    return pwd_context.hash(password)

def decode_access_token(token: str) -> TokenData | None:
    """
    Decodifica un token de acceso JWT y valida su contenido.
    :param token: El token JWT a decodificar.
    :return: El objeto TokenData si el token es válido, None si no lo es.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Usamos model_validate para Pydantic V2
        token_data = TokenData.model_validate({"email": payload.get("sub")})
        if token_data.email is None:
            return None
        return token_data
    except (JWTError, ValidationError):
        # Error si el token es inválido, expirado, malformado, o no cumple el schema TokenData
        return None