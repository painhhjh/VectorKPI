# app/crud/transaction.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc # Para ordenar por timestamp
from typing import Optional, List

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionType
from app.models.product import Product # Necesario para actualizar stock

def get_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()

def get_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    product_id: Optional[int] = None,
    user_id: Optional[int] = None,
) -> List[Transaction]:
    query = db.query(Transaction).options(
        joinedload(Transaction.product).joinedload(Product.category), # Carga producto y su categoría
        joinedload(Transaction.user) # Carga usuario
    )
    if product_id:
        query = query.filter(Transaction.product_id == product_id)
    if user_id:
        query = query.filter(Transaction.user_id == user_id)

    return query.order_by(desc(Transaction.timestamp)).offset(skip).limit(limit).all()

def create_transaction(db: Session, *, transaction_in: TransactionCreate, user_id: int) -> Transaction:
    """
    Crea una nueva transacción y actualiza el stock del producto asociado.
    """
    # 1. Obtener el producto
    product = db.query(Product).filter(Product.id == transaction_in.product_id).first()
    if not product:
        raise ValueError(f"Producto con id {transaction_in.product_id} no encontrado.") # O usar una excepción HTTP si se llama desde API

    # 2. Crear la transacción
    db_transaction = Transaction(
        **transaction_in.model_dump(),
        user_id=user_id,
        timestamp=func.now() # Asegura timestamp de DB
    )

    # 3. Actualizar el stock del producto
    if transaction_in.type == TransactionType.IN:
        product.stock += transaction_in.quantity
    elif transaction_in.type == TransactionType.OUT:
        if product.stock < transaction_in.quantity:
            raise ValueError(f"Stock insuficiente para el producto {product.id} ({product.name}). Stock: {product.stock}, Requerido: {transaction_in.quantity}")
        product.stock -= transaction_in.quantity
    elif transaction_in.type == TransactionType.ADJUSTMENT:
        # Ajuste podría ser positivo o negativo, pero 'quantity' debe ser > 0 en schema.
        # La lógica aquí podría depender de si 'quantity' representa el *nuevo* stock
        # o el *cambio* en stock. Asumiremos que es el cambio.
        # Podrías necesitar un campo adicional o lógica en 'reason'.
        # Aquí, simplemente lo añadimos/restamos basado en el signo implícito o 'reason'.
        # Por simplicidad, no haremos nada aquí, asumiendo que el ajuste ya se reflejó
        # o se requiere lógica más compleja (ej. quantity podría ser negativa para ajuste).
        # Considera validar esto según tu lógica de negocio.
        # product.stock += transaction_in.quantity # Ejemplo si quantity puede ser negativa
        pass # Ajuste manual, no modifica stock aquí automáticamente

    db.add(db_transaction)
    db.add(product) # Añadir producto modificado a la sesión
    db.commit()
    db.refresh(db_transaction)
    db.refresh(product) # Refrescar ambos
    return db_transaction

# No se suelen implementar update/delete para transacciones por motivos de auditoría.
# Si necesitas corregir, se crea una transacción de ajuste.