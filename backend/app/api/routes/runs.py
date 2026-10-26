"""Runs API endpoints."""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_app_settings, get_db
from app.core.config import Settings
from app.schemas.runs import (
    ClearHistoryResponse,
    CreateRunRequest,
    RunListResponse,
    RunResponse,
)
from app.services.run_service import RunService

router = APIRouter(tags=["runs"])


@router.get(
    "/runs",
    response_model=RunListResponse,
    summary="List persisted workflow runs",
)
def list_runs(
    limit: int = Query(
        default=30,
        ge=1,
        le=100,
        description="Maximum number of runs to return (1-100)",
    ),
    session: Session = Depends(get_db),
) -> RunListResponse:
    """Retrieve persisted workflow runs in newest-first order."""
    return RunService.list_runs(session=session, limit=limit)


@router.delete(
    "/runs",
    response_model=ClearHistoryResponse,
    summary="Clear all persisted run history",
)
def clear_history(
    session: Session = Depends(get_db),
) -> ClearHistoryResponse:
    """Delete all persisted workflow run records and associated events from SQLite."""
    return RunService.clear_history(session=session)



@router.post(
    "/runs",
    response_model=RunResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new workflow run",
)
def create_run(
    request: CreateRunRequest,
    session: Session = Depends(get_db),
    settings: Settings = Depends(get_app_settings),
) -> RunResponse:
    """Initiate a deterministic security workflow run for an allowlisted scenario."""
    return RunService.create_run(
        session=session,
        scenario_id=request.scenario_id,
        mode=request.mode,
        enable_local_lab=settings.enable_local_lab,
    )


@router.get(
    "/runs/{run_id}",
    response_model=RunResponse,
    summary="Retrieve an existing workflow run",
)
def get_run(
    run_id: str,
    session: Session = Depends(get_db),
) -> RunResponse:
    """Retrieve the current persisted state, ordered events, and finding for a run."""
    return RunService.get_run(session=session, run_id=run_id)


@router.post(
    "/runs/{run_id}/reset",
    response_model=RunResponse,
    summary="Reset an existing workflow run",
)
def reset_run(
    run_id: str,
    session: Session = Depends(get_db),
) -> RunResponse:
    """Reset a run: mark original run as reset and spawn an active replacement run."""
    return RunService.reset_run(session=session, run_id=run_id)
