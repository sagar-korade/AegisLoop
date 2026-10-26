"""Domain exception classes and error definitions for AegisLoop."""
from typing import Any, Optional


class AppError(Exception):
    """Base domain exception with status code and error details."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Any] = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


class ScenarioNotFoundError(AppError):
    def __init__(self, scenario_id: str) -> None:
        super().__init__(
            code="SCENARIO_NOT_FOUND",
            message=f"Scenario '{scenario_id}' was not found or is not enabled.",
            status_code=404,
        )


class RunNotFoundError(AppError):
    def __init__(self, run_id: str) -> None:
        super().__init__(
            code="RUN_NOT_FOUND",
            message=f"Run '{run_id}' was not found.",
            status_code=404,
        )


class InvalidStateTransitionError(AppError):
    def __init__(self, message: str, details: Optional[Any] = None) -> None:
        super().__init__(
            code="INVALID_STATE_TRANSITION",
            message=message,
            status_code=409,
            details=details,
        )


class MitigationNotAllowedError(AppError):
    def __init__(self, message: str, details: Optional[Any] = None) -> None:
        super().__init__(
            code="MITIGATION_NOT_ALLOWED",
            message=message,
            status_code=400,
            details=details,
        )


class AssertionNotAllowedError(AppError):
    def __init__(self, message: str, details: Optional[Any] = None) -> None:
        super().__init__(
            code="ASSERTION_NOT_ALLOWED",
            message=message,
            status_code=400,
            details=details,
        )


class LocalLabDisabledError(AppError):
    def __init__(self, message: str = "Local lab execution is disabled by default.") -> None:
        super().__init__(
            code="LOCAL_LAB_DISABLED",
            message=message,
            status_code=400,
        )


class LocalLabUnavailableError(AppError):
    def __init__(self, message: str = "Local lab service is currently unavailable.") -> None:
        super().__init__(
            code="LOCAL_LAB_UNAVAILABLE",
            message=message,
            status_code=503,
        )


class ValidationError(AppError):
    def __init__(self, message: str, details: Optional[Any] = None) -> None:
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=422,
            details=details,
        )


class InternalError(AppError):
    def __init__(self, message: str = "An internal server error occurred.") -> None:
        super().__init__(
            code="INTERNAL_ERROR",
            message=message,
            status_code=500,
        )
