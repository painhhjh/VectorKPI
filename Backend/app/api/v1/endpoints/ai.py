# app/api/v1/endpoints/ai.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, Any

from app.db.session import get_db
from app.api.dependencies import ActiveUser, DbSession
from app.models.user import User
from app.schemas.ai import AIContextInput, AISuggestion # Importar schemas AI
from app.services import external_ai_service # Importar el servicio

router = APIRouter()

@router.post("/advice", response_model=AISuggestion)
async def get_ai_advice(
    *,
    db: DbSession,
    input_data: AIContextInput, # Recibe el contexto del request body
    feature: str = "GeneralAdvice", # Podría ser un query param para indicar el área
    current_user: ActiveUser, # Requiere autenticación
):
    """
    Endpoint genérico para obtener consejo o sugerencia de la IA.
    El cuerpo de la petición debe contener el `context`.
    Se puede especificar el `feature` como query parameter.
    """
    try:
        suggestion = await external_ai_service.get_ai_suggestion(
            db=db,
            feature=feature,
            context=input_data.context,
            user_prompt=input_data.user_prompt,
            user_id=current_user.id
        )
        # Si el servicio devolvió una respuesta de error encapsulada
        if isinstance(suggestion.suggestion, dict) and suggestion.suggestion.get("error"):
             raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"AI Service Error: {suggestion.suggestion['error']}")

        return suggestion
    except HTTPException as e:
         raise e # Re-lanzar excepciones HTTP
    except Exception as e:
        # Loggear el error
        # logger.error(f"Error en endpoint /advice: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error processing AI request")

# Podrías añadir endpoints más específicos si lo prefieres:
# @router.post("/advice/inventory_restock", ...)
# async def get_inventory_advice(...)