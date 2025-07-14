# backend/app/security/core.py
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError, EmailStr
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi import HTTPException # Importar HTTPException para errores de API

from app.core.config import settings
from app.schemas.token import TokenData

# Contexto para hashing de contraseñas usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
PASSWORD_RESET_TOKEN_EXPIRE_HOURS = 1

# --- Configuración de Email para Brevo ---
# Se inicializa fuera de una función para que sea accesible globalmente una vez
fm: Optional[FastMail] = None

# Solo inicializa FastMail si EMAILS_ENABLED es True
if settings.EMAILS_ENABLED:
    try:
        email_conf = ConnectionConfig(
            MAIL_USERNAME = settings.MAIL_USERNAME,
            MAIL_PASSWORD = settings.MAIL_PASSWORD,
            MAIL_FROM = settings.MAIL_FROM, # settings.MAIL_FROM ya es un EmailStr
            MAIL_PORT = settings.MAIL_PORT,
            MAIL_SERVER = settings.MAIL_SERVER,
            MAIL_STARTTLS = settings.MAIL_STARTTLS,
            MAIL_SSL_TLS = settings.MAIL_SSL_TLS,
            USE_CREDENTIALS = settings.USE_CREDENTIALS,
            VALIDATE_CERTS = settings.VALIDATE_CERTS
        )
        fm = FastMail(email_conf)
        print("[Security Core] FastMail configurado exitosamente para Brevo.")
    except Exception as e:
        print(f"[Security Core] ERROR al configurar FastMail con Brevo: {e}. El envío de emails estará deshabilitado.")
        fm = None # Asegúrate de que fm sea None si la configuración falla


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
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
    # Añade el tipo 'access' para diferenciarlo de otros tokens
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_password_reset_token(email: str) -> str:
    """Crea un token específico para el reseteo de contraseña."""
    expire = datetime.now(timezone.utc) + timedelta(hours=PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
    # Añade el tipo 'reset' para identificar este token
    to_encode = {"exp": expire, "sub": email, "type": "reset"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verifica un token de reseteo de contraseña.
    Devuelve el email si es válido y del tipo correcto, None si no.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Verifica que el tipo sea 'reset'
        if payload.get("type") != "reset":
            print("[Security Core] Token type is not 'reset'") # Log para depuración
            return None
        # Usamos model_validate para Pydantic V2
        # Asumiendo que TokenData tiene un campo 'email'
        token_data = TokenData.model_validate({"email": payload.get("sub")})
        if token_data.email is None:
            print("[Security Core] Token subject (email) is missing") # Log para depuración
            return None
        return token_data.email
    except (JWTError, ValidationError) as e:
        print(f"[Security Core] Error verifying reset token: {e}") # Log para depuración
        return None


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
        # Verifica que el tipo sea 'access'. Si no tiene tipo, asumimos que es un token antiguo de acceso.
        token_type = payload.get("type")
        if token_type is not None and token_type != "access":
            print(f"[Security Core] Token type is not 'access', found '{token_type}'") # Log para depuración
            return None

        # Usamos model_validate para Pydantic V2
        # Asumiendo que TokenData tiene un campo 'email'
        token_data = TokenData.model_validate({"email": payload.get("sub")})
        if token_data.email is None:
            print("[Security Core] Access token subject (email) is missing") # Log para depuración
            return None
        return token_data
    except (JWTError, ValidationError) as e:
        # Error si el token es inválido, expirado, malformado, o no cumple el schema TokenData
        print(f"[Security Core] Error decoding access token: {e}") # Log para depuración
        return None

async def send_password_reset_email(email: str):
    """
    Genera un token de reseteo y envía un email al usuario.
    """
    password_reset_token = create_password_reset_token(email)
    # Construye la URL de reseteo que apuntará a tu frontend de React Native
    # AJUSTA ESTA URL A LA URL REAL DE TU FRONTEND DE EXPO/REACT NATIVE
    # Ejemplo para Expo Go: exp://TU_IP_LOCAL:PUERTO/--/resetPassword?token={password_reset_token}
    # Puedes encontrar tu IP local y puerto al ejecutar 'npx expo start'
    reset_url = f"exp://localhost:8081/--/resetPassword?token={password_reset_token}" # Ajusta 'localhost:8081' a tu IP y puerto de Expo Go

    subject = f"{settings.PROJECT_NAME} - Restablecimiento de Contraseña"
    body = f"""
    <p>Hola,</p>
    <p>Recibiste este correo porque solicitaste restablecer tu contraseña para {settings.PROJECT_NAME}.</p>
    <p>Por favor, haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
    <p><a href="{reset_url}">{reset_url}</a></p>
    <p>Si no solicitaste esto, por favor ignora este correo.</p>
    <p>El enlace expirará en {PASSWORD_RESET_TOKEN_EXPIRE_HOURS} hora(s).</p>
    <p>Gracias,</p>
    <p>El equipo de {settings.PROJECT_NAME}</p>
    """

    # Lógica de Envío de Email con FastMail (Brevo)
    if settings.EMAILS_ENABLED and fm: # Asegúrate de que fm se inicializó correctamente
        message = MessageSchema(
            subject=subject,
            recipients=[email],
            body=body,
            subtype="html"
        )
        try:
            await fm.send_message(message)
            print(f"[Security Core] Email de reseteo enviado a {email} usando Brevo.")
        except Exception as e:
            print(f"[Security Core] ERROR al enviar email de reseteo a {email} con Brevo: {e}")
            # Considera si quieres lanzar una excepción HTTP aquí o solo loggear el error
            raise HTTPException(status_code=500, detail="No se pudo enviar el email de reseteo. Inténtalo de nuevo más tarde.")
    else:
        # Esto se ejecutará si EMAILS_ENABLED es False o si FastMail no se pudo inicializar
        print("-" * 80)
        print(f"[Security Core] SIMULANDO envío de email de reseteo a: {email}")
        print(f"Asunto: {subject}")
        print(f"URL de Reseteo (copiar y pegar en navegador): {reset_url}")
        print(f"Token: {password_reset_token}")
        print("NOTA: El envío de emails está deshabilitado o la configuración de FastMail falló.")
        print("-" * 80)

