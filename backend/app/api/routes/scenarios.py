"""Scenarios API endpoints."""
from fastapi import APIRouter
from app.schemas.scenarios import ScenarioListResponse
from app.services.scenario_service import ScenarioService

router = APIRouter(tags=["scenarios"])


@router.get(
    "/scenarios",
    response_model=ScenarioListResponse,
    summary="List available security scenarios",
)
def list_scenarios() -> ScenarioListResponse:
    """Return all allowlisted, deterministic purple-team security scenarios."""
    items = ScenarioService.list_scenarios()
    return ScenarioListResponse(items=items)
