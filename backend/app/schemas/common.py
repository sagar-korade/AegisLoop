"""Common schemas, including standard error envelopes."""
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict


class ErrorDetail(BaseModel):
    """Structured error object inside the contract envelope."""

    code: str
    message: str
    details: Optional[Any] = None
    request_id: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class ErrorResponse(BaseModel):
    """Standard API error response wrapper per docs/API_CONTRACT.md."""

    error: ErrorDetail

    model_config = ConfigDict(extra="forbid")
