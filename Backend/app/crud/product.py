# app/crud/product.py
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

def get_product(db: Session, product_id: int) -> Optional[Product]:
    # Usar joinedload para cargar la categoría eficientemente si se lee a menudo
    return db.query(Product).options(joinedload(Product.category)).filter(Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str) -> Optional[Product]:
     return db.query(Product).options(joinedload(Product.category)).filter(Product.sku == sku).first()

def get_products(
    db: Session, skip: int = 0, limit: int = 100, category_id: Optional[int] = None
) -> List[Product]:
    query = db.query(Product).options(joinedload(Product.category))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.offset(skip).limit(limit).all()

def create_product(db: Session, product_in: ProductCreate) -> Product:
    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, *, db_product: Product, product_in: ProductUpdate) -> Product:
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_product, field):
            setattr(db_product, field, value)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, *, product_id: int) -> Optional[Product]:
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        # Cascade borrará las transacciones asociadas
        db.delete(db_product)
        db.commit()
    return db_product