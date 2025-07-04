# app/api/v1/endpoints/inventory.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Annotated, Any, List, Optional

from app.db.session import get_db
from app.api.dependencies import ActiveUser, DbSession
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

# Endpoint para crear una nueva categoría
@category_router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category_endpoint(
    *,
    db: DbSession,
    category_in: CategoryCreate,
    # current_user: ActiveUser, # Proteger endpoint
):
    """Crea una nueva categoría."""
    # Verificar si ya existe una categoría con el mismo nombre
    existing_category = crud_category.get_category_by_name(db, name=category_in.name)
    if existing_category:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    return crud_category.create_category(db=db, category_in=category_in)

# Endpoint para obtener una lista de categorías
@category_router.get("/", response_model=List[CategoryRead])
def read_categories_endpoint(
    db: DbSession,
    current_user: ActiveUser,  # Proteger endpoint
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
):
    """Obtiene una lista de categorías."""
    return crud_category.get_categories(db, skip=skip, limit=limit)

# Endpoint para obtener una categoría por ID
@category_router.get("/{category_id}", response_model=CategoryRead)
def read_category_endpoint(
    category_id: int,
    db: DbSession,
    current_user: ActiveUser,  # Proteger endpoint
):
    """Obtiene una categoría por ID."""
    db_category = crud_category.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

# Endpoint para actualizar una categoría
@category_router.put("/{category_id}", response_model=CategoryRead)
def update_category_endpoint(
    *,
    db: DbSession,
    category_id: int,
    category_in: CategoryUpdate,
    current_user: ActiveUser,  # Proteger endpoint
):
    """Actualiza una categoría."""
    db_category = crud_category.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    # Verificar si el nuevo nombre ya existe en otra categoría
    if category_in.name:
        existing_category = crud_category.get_category_by_name(db, name=category_in.name)
        if existing_category and existing_category.id != category_id:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
    return crud_category.update_category(db=db, db_category=db_category, category_in=category_in)

# Endpoint para eliminar una categoría
@category_router.delete("/{category_id}", response_model=CategoryRead)
def delete_category_endpoint(
    *,
    db: DbSession,
    category_id: int,
    current_user: ActiveUser,  # Proteger endpoint
):
    """Elimina una categoría."""
    deleted_category = crud_category.delete_category(db=db, category_id=category_id)
    if not deleted_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return deleted_category

# --- Productos ---
product_router = APIRouter()

# Endpoint para crear un nuevo producto
@product_router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product_endpoint(
    *,
    db: DbSession,
    product_in: ProductCreate, # El cliente envía ProductCreate
    current_user: ActiveUser,  # El usuario autenticado
):
    """Crea un nuevo producto."""
    # Validar que la categoría existe
    category = crud_category.get_category(db, category_id=product_in.category_id)
    if not category:
        raise HTTPException(status_code=404, detail=f"Category with id {product_in.category_id} not found")
    # Validar si el SKU es único si se proporciona
    if product_in.sku:
        existing_product = crud_product.get_product_by_sku(db, sku=product_in.sku)
        if existing_product:
            raise HTTPException(status_code=400, detail=f"Product with SKU {product_in.sku} already exists")

    # Sobrescribir el owner_id con el ID del usuario autenticado para seguridad
    # Esto asegura que el producto siempre pertenezca al usuario que lo crea,
    # independientemente de lo que el cliente pueda haber enviado en product_in.
    product_data_for_crud = product_in.model_dump() # Convierte el modelo Pydantic a un diccionario
    product_data_for_crud['owner_id'] = current_user.id # Asigna el ID del usuario autenticado

    # Crea una nueva instancia de ProductCreate con el owner_id actualizado
    product_to_create = ProductCreate(**product_data_for_crud)

    # Llama a la función CRUD, que ahora espera que owner_id esté dentro de product_in
    return crud_product.create_product(db=db, product_in=product_to_create)

# Endpoint para obtener una lista de productos
@product_router.get("/", response_model=List[ProductRead])
def read_products_endpoint(
    db: DbSession,
    current_user: ActiveUser,  # Proteger endpoint
    category_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Obtiene una lista de productos, opcionalmente filtrados por categoría y por el usuario actual."""
    # Filtrar productos por el ID del usuario autenticado para mostrar solo sus productos
    return crud_product.get_products(db, skip=skip, limit=limit, category_id=category_id, owner_id=current_user.id)

# Endpoint para obtener un producto por ID
@product_router.get("/{product_id}", response_model=ProductRead)
def read_product_endpoint(
    product_id: int,
    db: DbSession,
    current_user: ActiveUser,  # Proteger endpoint
):
    """Obtiene un producto por ID."""
    # Usar el owner_id para asegurar que el usuario solo pueda ver sus propios productos
    db_product = crud_product.get_product(db, product_id=product_id, owner_id=current_user.id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found or you don't have permission to view it.")
    return db_product

# Endpoint para actualizar un producto
@product_router.put("/{product_id}", response_model=ProductRead)
def update_product_endpoint(
    *,
    db: DbSession,
    product_id: int,
    product_in: ProductUpdate,
    current_user: ActiveUser,  # Proteger endpoint
):
    """Actualiza un producto."""
    # Asegurar que el usuario solo puede actualizar su propio producto
    db_product = crud_product.get_product(db, product_id=product_id, owner_id=current_user.id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found or you don't have permission to edit it.")
    
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
    
    # Llama a la función CRUD para actualizar el producto.
    # El owner_id se pasa como argumento para asegurar que la lógica de negocio del CRUD
    # pueda usarlo si es necesario (aunque ya se filtró en get_product arriba).
    return crud_product.update_product(db=db, db_product=db_product, product_in=product_in, owner_id=current_user.id)

# Endpoint para eliminar un producto
@product_router.delete("/{product_id}", response_model=ProductRead)
def delete_product_endpoint(
    *,
    db: DbSession,
    product_id: int,
    current_user: ActiveUser,  # Proteger endpoint
):
    """Elimina un producto."""
    # Intentar eliminar el producto, pasando el owner_id para la verificación de permisos en el CRUD
    # Primero, verifica si el producto existe y pertenece al usuario actual
    db_product = crud_product.get_product(db, product_id=product_id, owner_id=current_user.id)
    if not db_product:
        # Si no se encontró o el usuario no tiene permiso para eliminarlo
        raise HTTPException(status_code=404, detail="Product not found or you don't have permission to delete it.")
        
    # Si el producto existe y pertenece al usuario, procede con la eliminación
    deleted_product = crud_product.delete_product(db=db, product_id=product_id, owner_id=current_user.id)
    # Aunque ya verificamos arriba, esta línea asegura que el retorno sea el objeto eliminado
    # si el CRUD devuelve None por alguna razón inesperada (ej. otra eliminación concurrente)
    if not deleted_product:
        raise HTTPException(status_code=500, detail="Failed to delete product after verification.")
    return deleted_product

# --- Transacciones ---
transaction_router = APIRouter()

# Endpoint para crear una nueva transacción
@transaction_router.post("/", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def create_transaction_endpoint(
    *,
    db: DbSession,
    transaction_in: TransactionCreate,
    current_user: ActiveUser,  # El usuario que realiza la acción
):
    """Crea una nueva transacción de inventario."""
    try:
        # La función CRUD maneja la actualización de stock y validaciones
        transaction = crud_transaction.create_transaction(
            db=db, transaction_in=transaction_in, user_id=current_user.id
        )
        return transaction
    except ValueError as e:  # Captura errores de lógica de negocio (ej. stock insuficiente)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:  # Captura otros errores inesperados
        # Loggear el error real
        # logger.error(f"Error creating transaction: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error during transaction creation")

# Endpoint para obtener una lista de transacciones
@transaction_router.get("/", response_model=List[TransactionRead])
def read_transactions_endpoint(
    db: DbSession,
    current_user: ActiveUser,  # Proteger endpoint
    product_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    """Obtiene una lista de transacciones, opcionalmente filtradas por producto."""
    return crud_transaction.get_transactions(
        db, skip=skip, limit=limit, product_id=product_id, user_id=None  # Podría filtrarse por user_id también
    )

# Endpoint para obtener una transacción por ID
@transaction_router.get("/{transaction_id}", response_model=TransactionRead)
def read_transaction_endpoint(
    transaction_id: int,
    db: DbSession,
    current_user: ActiveUser,  # Proteger endpoint
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