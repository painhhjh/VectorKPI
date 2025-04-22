# app/api/v1/endpoints/inventory.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Annotated, Any, List, Optional

from app.db.session import get_db
from app.api.dependencies import ActiveUser, DbSession # Importamos dependencias
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.transaction import Transaction

from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.schemas.transaction import TransactionCreate, TransactionRead

from app.crud import category as crud_category
from app.crud import product as crud_product
from app.crud import transaction as crud_transaction

# Router principal para inventario
router = APIRouter()

# --- Categorías ---
category_router = APIRouter()

@category_router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category_endpoint(
    *,
    db: DbSession,
    category_in: CategoryCreate,
    # current_user: ActiveUser, # Proteger endpoint
):
    """Crea una nueva categoría."""
    existing_category = crud_category.get_category_by_name(db, name=category_in.name)
    if existing_category:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    return crud_category.create_category(db=db, category_in=category_in)

@category_router.get("/", response_model=List[CategoryRead])
def read_categories_endpoint(
    db: DbSession,
    current_user: ActiveUser, # Proteger endpoint
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
):
    """Obtiene una lista de categorías."""
    return crud_category.get_categories(db, skip=skip, limit=limit)

@category_router.get("/{category_id}", response_model=CategoryRead)
def read_category_endpoint(
    category_id: int,
    db: DbSession,
    current_user: ActiveUser, # Proteger endpoint
):
    """Obtiene una categoría por ID."""
    db_category = crud_category.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@category_router.put("/{category_id}", response_model=CategoryRead)
def update_category_endpoint(
    *,
    db: DbSession,
    category_id: int,
    category_in: CategoryUpdate,
    current_user: ActiveUser, # Proteger endpoint
):
    """Actualiza una categoría."""
    db_category = crud_category.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    # Verificar si el nuevo nombre ya existe en OTRA categoría
    if category_in.name:
        existing_category = crud_category.get_category_by_name(db, name=category_in.name)
        if existing_category and existing_category.id != category_id:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
    return crud_category.update_category(db=db, db_category=db_category, category_in=category_in)

@category_router.delete("/{category_id}", response_model=CategoryRead)
def delete_category_endpoint(
    *,
    db: DbSession,
    category_id: int,
    current_user: ActiveUser, # Proteger endpoint
):
    """Elimina una categoría."""
    deleted_category = crud_category.delete_category(db=db, category_id=category_id)
    if not deleted_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return deleted_category

# --- Productos ---
product_router = APIRouter()

@product_router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product_endpoint(
    *,
    db: DbSession,
    product_in: ProductCreate,
    current_user: ActiveUser, # Proteger endpoint
):
    """Crea un nuevo producto."""
    # Validar que la categoría existe
    category = crud_category.get_category(db, category_id=product_in.category_id)
    if not category:
         raise HTTPException(status_code=404, detail=f"Category with id {product_in.category_id} not found")
    # Validar si SKU es único si se proporciona
    if product_in.sku:
        existing_product = crud_product.get_product_by_sku(db, sku=product_in.sku)
        if existing_product:
            raise HTTPException(status_code=400, detail=f"Product with SKU {product_in.sku} already exists")
    return crud_product.create_product(db=db, product_in=product_in)

@product_router.get("/", response_model=List[ProductRead])
def read_products_endpoint(
    db: DbSession,
    current_user: ActiveUser, # Proteger endpoint
    category_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Obtiene una lista de productos, opcionalmente filtrados por categoría."""
    return crud_product.get_products(db, skip=skip, limit=limit, category_id=category_id)

@product_router.get("/{product_id}", response_model=ProductRead)
def read_product_endpoint(
    product_id: int,
    db: DbSession,
    current_user: ActiveUser, # Proteger endpoint
):
    """Obtiene un producto por ID."""
    db_product = crud_product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@product_router.put("/{product_id}", response_model=ProductRead)
def update_product_endpoint(
    *,
    db: DbSession,
    product_id: int,
    product_in: ProductUpdate,
    current_user: ActiveUser, # Proteger endpoint
):
    """Actualiza un producto."""
    db_product = crud_product.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    # Validar categoría si se cambia
    if product_in.category_id is not None and product_in.category_id != db_product.category_id:
         category = crud_category.get_category(db, category_id=product_in.category_id)
         if not category:
              raise HTTPException(status_code=404, detail=f"Category with id {product_in.category_id} not found")
    # Validar SKU único si se cambia
    if product_in.sku and product_in.sku != db_product.sku:
        existing_product = crud_product.get_product_by_sku(db, sku=product_in.sku)
        if existing_product and existing_product.id != product_id:
             raise HTTPException(status_code=400, detail=f"Product with SKU {product_in.sku} already exists")

    return crud_product.update_product(db=db, db_product=db_product, product_in=product_in)

@product_router.delete("/{product_id}", response_model=ProductRead)
def delete_product_endpoint(
    *,
    db: DbSession,
    product_id: int,
    current_user: ActiveUser, # Proteger endpoint
):
    """Elimina un producto."""
    deleted_product = crud_product.delete_product(db=db, product_id=product_id)
    if not deleted_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return deleted_product

# --- Transacciones ---
transaction_router = APIRouter()

@transaction_router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction_endpoint(
    *,
    db: DbSession,
    transaction_in: TransactionCreate,
    current_user: ActiveUser, # El usuario que realiza la acción
):
    """Crea una nueva transacción de inventario."""
    try:
        # La función CRUD maneja la actualización de stock y validaciones
        transaction = crud_transaction.create_transaction(
            db=db, transaction_in=transaction_in, user_id=current_user.id
        )
        return transaction
    except ValueError as e: # Captura errores de lógica de negocio (ej. stock insuficiente)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e: # Captura otros errores inesperados
        # Loggear el error real
        # logger.error(f"Error creating transaction: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error during transaction creation")


@transaction_router.get("/", response_model=List[TransactionRead])
def read_transactions_endpoint(
    db: DbSession,
    current_user: ActiveUser, # Proteger endpoint
    product_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Obtiene una lista de transacciones, opcionalmente filtradas por producto."""
    return crud_transaction.get_transactions(
        db, skip=skip, limit=limit, product_id=product_id, user_id=None # Podría filtrarse por user_id también
    )

@transaction_router.get("/{transaction_id}", response_model=TransactionRead)
def read_transaction_endpoint(
    transaction_id: int,
    db: DbSession,
    current_user: ActiveUser, # Proteger endpoint
):
    """Obtiene una transacción por ID."""
    db_transaction = crud_transaction.get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    # Podrías añadir lógica de permisos si solo el usuario que la creó puede verla
    return db_transaction


# --- Incluir sub-routers en el router principal de inventario ---
router.include_router(category_router, prefix="/categories", tags=["Inventory - Categories"])
router.include_router(product_router, prefix="/products", tags=["Inventory - Products"])
router.include_router(transaction_router, prefix="/transactions", tags=["Inventory - Transactions"])