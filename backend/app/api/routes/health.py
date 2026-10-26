"""Health check endpoint."""
from fastapi import APIRouter, Depends
from app.api.deps import get_app_settings
from app.core.config import Settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Service health check")
def health_check(settings: Settings = Depends(get_app_settings)) -> HealthResponse:
    """Return application operational status, active mode, and version."""
    return HealthResponse(
        status="ok",
        mode=settings.mode,
        version=settings.version,
    )
