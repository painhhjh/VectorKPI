# backend/app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated, Any

from app.db.session import get_db
from app.schemas.token import Token
from app.crud import user as crud_user
from app.security import core as security_core
from app.api.dependencies import ActiveUser, DbSession # Usamos los alias definidos
from app.models.user import User # Necesario para el tipo de ActiveUser
from app.schemas.user import UserRead, PasswordResetRequest, UserPasswordReset # Importa los nuevos esquemas
from app.core.config import settings # Importar settings para acceder a FRONTEND_BASE_URL (si la defines)
from datetime import timedelta # Necesario para la duración del token

router = APIRouter()

@router.post("/token", response_model=Token)
def login_for_access_token(
    # Usamos Annotated para las dependencias
    db: DbSession,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Any:
    """
    Endpoint de autenticación OAuth2.
    Recibe 'username' (email) y 'password' via form data.
    Devuelve un access token JWT si las credenciales son válidas.
    """
    user = crud_user.get_user_by_email(db, email=form_data.username)
    if not user or not security_core.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    # Creamos el token usando el email como subject ('sub')
    access_token = security_core.create_access_token(
        subject=user.email
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/test-token", response_model=UserRead)
def test_token(current_user: ActiveUser):
    """
    Endpoint de prueba para verificar que el token funciona
    y la dependencia `get_current_active_user` recupera al usuario.
    """
    # Si llegamos aquí, el token es válido y el usuario está activo.
    # La dependencia ActiveUser ya nos da el objeto User.
    return current_user


@router.post("/forgot-password", response_model=dict[str, str]) # Define el tipo de respuesta
async def forgot_password(
    request: Request, # <-- Importante: Añadir Request para acceder a app.state.mail
    email_in: PasswordResetRequest, # Usa el esquema para el email
    db: Annotated[Session, Depends(get_db)]
) -> Any:
    """
    Endpoint para solicitar recuperación de contraseña.
    Recibe el email del usuario y envía un email con instrucciones.
    """
    user = crud_user.get_user_by_email(db, email=email_in.email) # Cambiado a email_in.email
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    # Generar un token de restablecimiento de contraseña
    # Usar una duración corta, por ejemplo, 15 minutos
    password_reset_token = security_core.create_access_token(
        data={"sub": user.email, "type": "password_reset"},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES) # Reutiliza el tiempo de expiración del token de acceso
    )

    # Construir el enlace de restablecimiento (usando la URL del frontend hosteado)
    # Asegúrate de que settings.FRONTEND_BASE_URL esté definido en tu config.py y .env
    frontend_reset_url = f"{settings.FRONTEND_BASE_URL}/auth/reset-password?token={password_reset_token}"

    # Llamar a la función de envío de correo en security_core.py
    # Pasamos la instancia de FastMail y la URL del frontend
    await security_core.send_password_reset_email(
        mail_instance=request.app.state.mail, # Pasamos la instancia de FastMail
        email=user.email,
        reset_link=frontend_reset_url,
        user_name=user.full_name or user.email # Pasa el nombre del usuario si está disponible
    )
    return {"message": "Password reset email sent"}


@router.post("/reset-password", response_model=dict[str, str]) # Define el tipo de respuesta
async def reset_password(
    user_password_reset: UserPasswordReset, # Usa el nuevo esquema
    db: Annotated[Session, Depends(get_db)]
) -> Any:
    """
    Endpoint para cambiar la contraseña.
    Recibe un token de recuperación y la nueva contraseña.
    """
    email = security_core.verify_password_reset_token(user_password_reset.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )
    user = crud_user.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user.",
        )
    
    # Asegúrate de que esta función exista en crud_user.py
    # crud_user.update_password(db, user, user_password_reset.new_password)
    # Implementación directa si no tienes update_password en crud_user:
    hashed_password = security_core.get_password_hash(user_password_reset.new_password)
    user.hashed_password = hashed_password
    db.add(user)
    db.commit()
    db.refresh(user) # Refresca el objeto usuario para asegurar que los cambios se reflejen

    return {"message": "Password updated successfully"}