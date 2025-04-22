# app/crud/user.py
from sqlalchemy.orm import Session
from typing import Optional, Any

from app.models.user import User
from app.models.profile import Profile
from app.schemas.user import UserCreate, UserUpdate, ProfileCreate, ProfileUpdate
from app.security.core import get_password_hash

# --- User CRUD ---

def get_user(db: Session, user_id: int) -> Optional[User]:
    """Obtiene un usuario por su ID."""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Obtiene un usuario por su email."""
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """Obtiene una lista de usuarios (con paginación)."""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, *, user_in: UserCreate) -> User:
    """
    Crea un nuevo usuario y su perfil si se proporciona.
    """
    hashed_password = get_password_hash(user_in.password)
    # Crea el objeto User
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        is_active=True # Por defecto activamos
    )
    db.add(db_user)
    db.flush() # Obtenemos el ID antes de crear el perfil

    # Crea el perfil si se incluyó en UserCreate
    if user_in.profile:
        db_profile = Profile(
            **user_in.profile.model_dump(),
            user_id=db_user.id
        )
        db.add(db_profile)
    else:
        # Opcional: Crear un perfil vacío por defecto si no se proporciona
        db_profile = Profile(user_id=db_user.id)
        db.add(db_profile)

    db.commit()
    db.refresh(db_user) # Refresca para cargar relaciones (como el perfil)
    return db_user

def update_user(db: Session, *, db_user: User, user_in: UserUpdate) -> User:
    """
    Actualiza un usuario existente y su perfil si se proporciona.
    """
    # model_dump con exclude_unset=True solo incluye los campos que SÍ se enviaron
    update_data = user_in.model_dump(exclude_unset=True)

    # Actualiza la contraseña si se proporcionó una nueva
    if update_data.get("password"):
        hashed_password = get_password_hash(update_data["password"])
        db_user.hashed_password = hashed_password
        del update_data["password"] # No intentar actualizar directamente

    # Actualiza los campos directos del modelo User (email, is_active)
    for field, value in update_data.items():
        if hasattr(db_user, field) and field != "profile":
            setattr(db_user, field, value)

    # Actualiza el perfil si se incluyeron datos del perfil en la entrada
    if user_in.profile:
        profile_update_data = user_in.profile.model_dump(exclude_unset=True)
        if db_user.profile: # Si el usuario ya tiene un perfil
            for field, value in profile_update_data.items():
                if hasattr(db_user.profile, field):
                    setattr(db_user.profile, field, value)
        else: # Si no tiene perfil (poco común si se crea por defecto), créalo
            new_profile = Profile(**profile_update_data, user_id=db_user.id)
            db.add(new_profile)
            # db_user.profile = new_profile # SQLAlchemy debería manejar la relación

    db.add(db_user) # Añade el usuario (modificado) a la sesión
    db.commit()
    db.refresh(db_user) # Refresca para obtener los datos actualizados
    return db_user


def delete_user(db: Session, *, user_id: int) -> Optional[User]:
    """Elimina un usuario por su ID."""
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user # Devuelve el usuario eliminado o None si no se encontró


# --- Profile CRUD (Ejemplos básicos, podrías moverlos a crud/profile.py) ---

def get_profile(db: Session, profile_id: int) -> Optional[Profile]:
    """Obtiene un perfil por su ID."""
    return db.query(Profile).filter(Profile.id == profile_id).first()

def get_profile_by_user_id(db: Session, user_id: int) -> Optional[Profile]:
    """Obtiene un perfil por el ID del usuario asociado."""
    return db.query(Profile).filter(Profile.user_id == user_id).first()

def create_user_profile(db: Session, *, profile_in: ProfileCreate, user_id: int) -> Profile:
    """Crea un perfil para un usuario existente (si no tiene uno)."""
    db_profile = Profile(**profile_in.model_dump(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_profile(db: Session, *, db_profile: Profile, profile_in: ProfileUpdate) -> Profile:
    """Actualiza un perfil existente."""
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
         if hasattr(db_profile, field):
              setattr(db_profile, field, value)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile