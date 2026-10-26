"""Health check response schema."""
from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    """Liveness and system mode status."""

    status: str = "ok"
    mode: str = "simulation"
    version: str = "0.1.0"

    model_config = ConfigDict(extra="forbid")
