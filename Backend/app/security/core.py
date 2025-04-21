from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.schemas.token import TokenData
from fastapi import HTTPException

# Contexto para hashing de contraseñas usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña plana coincide con su hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token de acceso JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[TokenData]:
    """Decodifica un token de acceso JWT y valida su contenido."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub") # Asumiendo que guardas el email en 'sub'
        if email is None:
            # Podrías lanzar una excepción personalizada aquí
            return None
        # Aquí podrías añadir más validaciones si guardas otros datos en el token
        token_data = TokenData(email=email)
        return token_data
    except JWTError:
        # El token es inválido (expirado, malformado, firma incorrecta)
        return None

def get_current_user(token: str) -> Optional[TokenData]:
    """Obtiene el usuario actual a partir del token de acceso."""
    token_data = decode_access_token(token)
    if not token_data:
        # Aquí podrías lanzar una excepción personalizada como HTTPException con un código de estado 401 (no autorizado)
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    return token_data