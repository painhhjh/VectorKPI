from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Annotated, Any, List

from app.db.session import get_db
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.crud import user as crud_user
from app.models.user import User
from app.api.dependencies import ActiveUser, DbSession, get_current_active_user # Importamos dependencias

router = APIRouter()

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_new_user(
    *,
    db: DbSession,
    user_in: UserCreate,
) -> Any:
    """
    Crea un nuevo usuario.
    Endpoint público, generalmente para registro.
    """
    existing_user = crud_user.get_user_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )
    user = crud_user.create_user(db=db, user_in=user_in)
    return user


@router.get("/me", response_model=UserRead)
def read_current_user_me(
    current_user: ActiveUser, # Usa la dependencia para obtener usuario activo
) -> Any:
    """
    Obtiene los datos del usuario autenticado actualmente.
    """
    return current_user


@router.put("/me", response_model=UserRead)
def update_current_user_me(
    *,
    db: DbSession,
    user_in: UserUpdate,
    current_user: ActiveUser, # Obtiene el usuario a actualizar
) -> Any:
    """
    Actualiza los datos del usuario autenticado actualmente.
    Permite actualizar email, contraseña y perfil.
    """
    # Verifica si el nuevo email ya está en uso por otro usuario
    if user_in.email and user_in.email != current_user.email:
        existing_user = crud_user.get_user_by_email(db, email=user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )

    updated_user = crud_user.update_user(db=db, db_user=current_user, user_in=user_in)
    return updated_user


# --- Endpoints de Administración (Ejemplo - Podrías requerir permisos específicos) ---

@router.get("/", response_model=List[UserRead])
def read_users(
    db: DbSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    # current_user: ActiveUser = Depends(get_current_active_user), # Descomentar para proteger
) -> Any:
    """
    Obtiene una lista de usuarios (requiere permisos de admin usualmente).
    """
    # Aquí podrías añadir lógica para verificar si current_user es admin
    # if not crud_user.is_superuser(current_user):
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/{user_id}", response_model=UserRead)
def read_user_by_id(
    user_id: int,
    db: DbSession,
    # current_user: ActiveUser = Depends(get_current_active_user), # Descomentar para proteger
) -> Any:
    """
    Obtiene un usuario específico por su ID (requiere permisos de admin usualmente).
    """
    # Lógica de permisos similar a read_users
    user = crud_user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_user_by_id(
    *,
    db: DbSession,
    user_id: int,
    user_in: UserUpdate,
    # current_user: ActiveUser = Depends(get_current_active_user), # Descomentar para proteger
) -> Any:
    """
    Actualiza un usuario específico por ID (requiere permisos de admin usualmente).
    """
    # Lógica de permisos
    db_user = crud_user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    # Verifica si el nuevo email ya está en uso por OTRO usuario
    if user_in.email and user_in.email != db_user.email:
        existing_user = crud_user.get_user_by_email(db, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists.",
            )

    user = crud_user.update_user(db=db, db_user=db_user, user_in=user_in)
    return user


@router.delete("/{user_id}", response_model=UserRead)
def delete_user_by_id(
    *,
    db: DbSession,
    user_id: int,
    # current_user: ActiveUser = Depends(get_current_active_user), # Descomentar para proteger
) -> Any:
    """
    Elimina un usuario por ID (requiere permisos de admin usualmente).
    """
    # Lógica de permisos
    deleted_user = crud_user.delete_user(db=db, user_id=user_id)
    if not deleted_user:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    # Podrías devolver el usuario eliminado o un mensaje de éxito
    return deleted_user