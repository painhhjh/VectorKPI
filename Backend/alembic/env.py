import os
import sys
from logging.config import fileConfig

from sqlalchemy import create_engine
from sqlalchemy import pool

from alembic import context

# Añadimos la carpeta 'backend' al path para importar módulos de la app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.core.config import settings  # Importa la configuración
from app.db.base import Base         # Importa la base de modelos
from app.models import user, profile # Importa todos los modelos
# from app.models import product, category, transaction # esto es para después

DATABASE_URL = settings.DATABASE_URL # Obtiene la URL de la base de datos

# Configuración para la generación automática de migraciones. target_metadata debe apuntar a los metadatos de tu Base declarativa de SQLAlchemy.  Esto le permite a Alembic comparar el estado actual de la base de datos con tus modelos y generar las migraciones necesarias.
target_metadata = Base.metadata

# Otros parámetros de configuración que Alembic necesita. No es necesario modificarlos a menos que tengas requerimientos específicos.
config = context.config

# Configura el logging de Alembic.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

def run_migrations_offline() -> None:
    """
    Ejecuta las migraciones en modo 'offline'.

    Este modo es útil para generar los scripts de migración sin necesidad de
    una conexión activa a la base de datos.  Sin embargo, no se recomienda
    para aplicar las migraciones en producción.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Ejecuta las migraciones en modo 'online'.

    Este modo requiere una conexión activa a la base de datos.  Es el modo
    normal para aplicar las migraciones en un entorno de desarrollo o producción.
    """
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()