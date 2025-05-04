"""Inicial

Revision ID: 949c3f57c56d
Revises: 
Create Date: 2025-05-03 22:40:19.089264

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '949c3f57c56d'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Define ENUMs
    kpi_trend_enum = postgresql.ENUM('up', 'down', 'stable', name='kpi_trend_enum', create_type=True)
    kpi_category_enum = postgresql.ENUM('perforacion', 'produccion', 'logistica', 'seguridad', 'financiero', 'otro', name='kpi_category_enum', create_type=True)
    transaction_type_enum = postgresql.ENUM('IN', 'OUT', 'ADJUSTMENT', name='transaction_type_enum', create_type=True)


    # Create tables
    op.create_table('categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_name'), 'categories', ['name'], unique=True)
    

    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    
    
    op.create_table('ai_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('feature_area', sa.String(), nullable=False, comment='Ej: InventoryRestock, KpiAnalysis, UserProfiling'),
        sa.Column('input_data', sa.Text(), nullable=True),
        sa.Column('output_data', sa.Text(), nullable=True),
        sa.Column('decision_reason', sa.Text(), nullable=True),
        sa.Column('metrics', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_logs_feature_area'), 'ai_logs', ['feature_area'], unique=False)
    op.create_index(op.f('ix_ai_logs_id'), 'ai_logs', ['id'], unique=False)
    op.create_index(op.f('ix_ai_logs_timestamp'), 'ai_logs', ['timestamp'], unique=False)
    op.create_index(op.f('ix_ai_logs_user_id'), 'ai_logs', ['user_id'], unique=False)
    
    
    op.create_table('kpis',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('value', sa.Numeric(precision=15, scale=5), nullable=False),
        sa.Column('target', sa.Numeric(precision=15, scale=5), nullable=True),
        sa.Column('unit', sa.String(), nullable=False),
        # SQLAlchemy asociará esto con la definición de kpi_trend_enum y lo creará si no existe
        sa.Column('trend', kpi_trend_enum, nullable=True),
        # SQLAlchemy asociará esto con la definición de kpi_category_enum y lo creará si no existe
        sa.Column('category', kpi_category_enum, nullable=False),
        sa.Column('last_updated', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kpis_category'), 'kpis', ['category'], unique=False)
    op.create_index(op.f('ix_kpis_id'), 'kpis', ['id'], unique=False)
    op.create_index(op.f('ix_kpis_last_updated'), 'kpis', ['last_updated'], unique=False)
    op.create_index(op.f('ix_kpis_name'), 'kpis', ['name'], unique=False)
    op.create_index(op.f('ix_kpis_owner_id'), 'kpis', ['owner_id'], unique=False)
    
    
    op.create_table('products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('stock', sa.Integer(), nullable=False),
        sa.Column('sku', sa.String(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_category_id'), 'products', ['category_id'], unique=False)
    op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)
    op.create_index(op.f('ix_products_name'), 'products', ['name'], unique=False)
    op.create_index(op.f('ix_products_sku'), 'products', ['sku'], unique=True)
    
    
    op.create_table('profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_profiles_full_name'), 'profiles', ['full_name'], unique=False)
    op.create_index(op.f('ix_profiles_id'), 'profiles', ['id'], unique=False)
    op.create_index(op.f('ix_profiles_user_id'), 'profiles', ['user_id'], unique=True)
    
    
    op.create_table('transactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        # SQLAlchemy asociará esto con la definición de transaction_type_enum y lo creará si no existe
        sa.Column('type', transaction_type_enum, nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'], unique=False)
    op.create_index(op.f('ix_transactions_product_id'), 'transactions', ['product_id'], unique=False)
    op.create_index(op.f('ix_transactions_timestamp'), 'transactions', ['timestamp'], unique=False)
    op.create_index(op.f('ix_transactions_user_id'), 'transactions', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_transactions_user_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_timestamp'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_product_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
    op.drop_table('transactions')
    op.drop_index(op.f('ix_profiles_user_id'), table_name='profiles')
    op.drop_index(op.f('ix_profiles_id'), table_name='profiles')
    op.drop_index(op.f('ix_profiles_full_name'), table_name='profiles')
    op.drop_table('profiles')
    op.drop_index(op.f('ix_products_sku'), table_name='products')
    op.drop_index(op.f('ix_products_name'), table_name='products')
    op.drop_index(op.f('ix_products_id'), table_name='products')
    op.drop_index(op.f('ix_products_category_id'), table_name='products')
    op.drop_table('products')
    op.drop_index(op.f('ix_kpis_owner_id'), table_name='kpis')
    op.drop_index(op.f('ix_kpis_name'), table_name='kpis')
    op.drop_index(op.f('ix_kpis_last_updated'), table_name='kpis')
    op.drop_index(op.f('ix_kpis_id'), table_name='kpis')
    op.drop_index(op.f('ix_kpis_category'), table_name='kpis')
    op.drop_table('kpis')
    op.drop_index(op.f('ix_ai_logs_user_id'), table_name='ai_logs')
    op.drop_index(op.f('ix_ai_logs_timestamp'), table_name='ai_logs')
    op.drop_index(op.f('ix_ai_logs_id'), table_name='ai_logs')
    op.drop_index(op.f('ix_ai_logs_feature_area'), table_name='ai_logs')
    op.drop_table('ai_logs')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_categories_name'), table_name='categories')
    op.drop_index(op.f('ix_categories_id'), table_name='categories')
    op.drop_table('categories')
    # ### end Alembic commands ###

    # Eliminar los ENUMs
    kpi_trend_enum = postgresql.ENUM(name='kpi_trend_enum')
    kpi_category_enum = postgresql.ENUM(name='kpi_category_enum')
    transaction_type_enum = postgresql.ENUM(name='transaction_type_enum') # Usa postgresql.ENUM si lo definiste así en upgrade

    kpi_trend_enum.drop(op.get_bind(), checkfirst=True)
    kpi_category_enum.drop(op.get_bind(), checkfirst=True)
    transaction_type_enum.drop(op.get_bind(), checkfirst=True)
