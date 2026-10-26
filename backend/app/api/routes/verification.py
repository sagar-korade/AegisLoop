"""Verification retesting API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.verification import RetestRequest, RetestResponse
from app.services.run_service import RunService

router = APIRouter(tags=["verification"])


@router.post(
    "/runs/{run_id}/retest",
    response_model=RetestResponse,
    summary="Evaluate named verification assertion",
)
def retest_run(
    run_id: str,
    request: RetestRequest,
    session: Session = Depends(get_db),
) -> RetestResponse:
    """Evaluate a named assertion deterministically against the active mitigation."""
    return RunService.retest_run(
        session=session,
        run_id=run_id,
        assertion_id=request.assertion_id,
    )
