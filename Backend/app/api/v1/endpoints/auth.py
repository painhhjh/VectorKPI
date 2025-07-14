# backend/app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
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
    request: PasswordResetRequest, # Usa el esquema para el email
    db: Annotated[Session, Depends(get_db)]
) -> Any:
    """
    Endpoint para solicitar recuperación de contraseña.
    Recibe el email del usuario y envía un email con instrucciones.
    """
    user = crud_user.get_user_by_email(db, email=request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    await security_core.send_password_reset_email(email=user.email)
    return {"message": "Password reset email sent"} # Cambiado a 'message' para consistencia con frontend


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

    return {"message": "Password updated successfully"} # Cambiado a 'message'
