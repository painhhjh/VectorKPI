# app/crud/category.py
from sqlalchemy.orm import Session
from typing import Optional, List

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

def get_category(db: Session, category_id: int) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()

def get_category_by_name(db: Session, name: str) -> Optional[Category]:
    return db.query(Category).filter(Category.name == name).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    return db.query(Category).offset(skip).limit(limit).all()

def create_category(db: Session, category_in: CategoryCreate) -> Category:
    db_category = Category(**category_in.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, *, db_category: Category, category_in: CategoryUpdate) -> Category:
    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_category, field):
            setattr(db_category, field, value)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, *, category_id: int) -> Optional[Category]:
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category:
        # Considerar qué pasa con los productos de esta categoría.
        # Por defecto, cascade="all, delete-orphan" los borraría.
        # Podrías querer ponerlos en NULL o reasignarlos antes de borrar.
        db.delete(db_category)
        db.commit()
    return db_category