# app/crud/product.py
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

def get_product(db: Session, product_id: int, owner_id: int) -> Optional[Product]:
    """
    Obtiene un producto por su ID y el ID de su propietario.
    Esto asegura que los usuarios solo puedan acceder a sus propios productos.
    """
    return db.query(Product).options(joinedload(Product.category)).filter(
        Product.id == product_id,
        Product.owner_id == owner_id # Filtrar por owner_id
    ).first()

def get_product_by_sku(db: Session, sku: str) -> Optional[Product]:
    """
    Obtiene un producto por su SKU.
    """
    return db.query(Product).options(joinedload(Product.category)).filter(Product.sku == sku).first()

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    owner_id: Optional[int] = None # Nuevo parámetro para filtrar por propietario
) -> List[Product]:
    """
    Obtiene una lista de productos, opcionalmente filtrados por categoría y/o propietario.
    """
    query = db.query(Product).options(joinedload(Product.category))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if owner_id: # Aplicar filtro por owner_id si se proporciona
        query = query.filter(Product.owner_id == owner_id)
    return query.offset(skip).limit(limit).all()

def create_product(db: Session, *, product_in: ProductCreate) -> Product:
    """
    Crea un nuevo producto en la base de datos.
    El product_in (ProductCreate schema) ya debe contener el owner_id.
    """
    db_product_data = product_in.model_dump(exclude_unset=True)
    db_product = Product(**db_product_data)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, *, db_product: Product, product_in: ProductUpdate, owner_id: Optional[int] = None) -> Product:
    """
    Actualiza un producto existente.
    Si owner_id se proporciona, se actualiza el propietario del producto.
    """
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(db_product, field):
            setattr(db_product, field, value)
    
    # Si se proporciona un owner_id en la llamada, actualiza el propietario del producto.
    # Esto es útil si el endpoint quiere forzar un propietario específico.
    if owner_id is not None:
        db_product.owner_id = owner_id

    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, *, product_id: int, owner_id: Optional[int] = None) -> Optional[Product]:
    """
    Elimina un producto por su ID.
    Opcionalmente, puede filtrar por owner_id para asegurar permisos.
    """
    query = db.query(Product).filter(Product.id == product_id)
    if owner_id: # Filtrar por owner_id para asegurar que el usuario solo borre sus productos
        query = query.filter(Product.owner_id == owner_id)
    
    db_product = query.first()
    
    if db_product:
        # Cascade borrará las transacciones asociadas (configurado en el modelo)
        db.delete(db_product)
        db.commit()
    return db_product