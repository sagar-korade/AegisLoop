"""Mitigations API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.mitigations import ApplyMitigationRequest, MitigationResponse
from app.services.run_service import RunService

router = APIRouter(tags=["mitigations"])


@router.post(
    "/runs/{run_id}/mitigations",
    response_model=MitigationResponse,
    summary="Apply an approved mitigation to a run",
)
def apply_mitigation(
    run_id: str,
    request: ApplyMitigationRequest,
    session: Session = Depends(get_db),
) -> MitigationResponse:
    """Validate and apply an allowlisted mitigation, returning educational diff and explanation."""
    return RunService.apply_mitigation(
        session=session,
        run_id=run_id,
        mitigation_id=request.mitigation_id,
    )
