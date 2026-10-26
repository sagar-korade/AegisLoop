"""FastAPI application factory and lifecycle management."""
import logging
from contextlib import asynccontextmanager
from typing import Any, Optional
from fastapi import APIRouter, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes.health import router as health_router
from app.api.routes.mitigations import router as mitigations_router
from app.api.routes.runs import router as runs_router
from app.api.routes.scenarios import router as scenarios_router
from app.api.routes.verification import router as verification_router
from app.core.config import Settings, get_settings
from app.core.logging import setup_logging
from app.core.request_id import RequestIdMiddleware, get_current_request_id
from app.db.session import DatabaseManager, get_db_manager
from app.domain.errors import AppError

logger = logging.getLogger("aegisloop")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown lifecycle."""
    if hasattr(app.state, "db_manager") and app.state.db_manager:
        app.state.db_manager.init_db()
    yield
    if hasattr(app.state, "db_manager") and app.state.db_manager:
        app.state.db_manager.close()


def create_app(
    settings: Optional[Settings] = None,
    db_manager: Optional[DatabaseManager] = None,
    init_db_eagerly: bool = False,
) -> FastAPI:
    """Create and configure an instance of the AegisLoop FastAPI application."""
    app_settings = settings or get_settings()
    app_db_manager = db_manager or get_db_manager(app_settings.database_url)
    if init_db_eagerly:
        app_db_manager.init_db()

    setup_logging(app_settings.log_level)

    app = FastAPI(
        title="AegisLoop Purple-Team Prototype API",
        description="Deterministic purple-team security workflow demonstrator",
        version=app_settings.version,
        lifespan=lifespan,
    )
    app.state.settings = app_settings
    app.state.db_manager = app_db_manager

    # 1. CORS Middleware - restricted to documented local origins without credentials
    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # 2. Request ID Middleware
    app.add_middleware(RequestIdMiddleware)

    # 3. Exception Handlers
    def _extract_request_id(request: Request) -> str:
        return getattr(request.state, "request_id", None) or get_current_request_id()

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        request_id = _extract_request_id(request)
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                    "request_id": request_id,
                }
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        request_id = _extract_request_id(request)
        details = []
        for error in exc.errors():
            loc = [str(x) for x in error.get("loc", [])]
            details.append({
                "loc": loc,
                "msg": error.get("msg", ""),
                "type": error.get("type", ""),
            })
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Request validation failed.",
                    "details": details,
                    "request_id": request_id,
                }
            },
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        request_id = _extract_request_id(request)
        if exc.status_code == 404:
            code = "NOT_FOUND"
        elif exc.status_code == 405:
            code = "METHOD_NOT_ALLOWED"
        else:
            code = "HTTP_ERROR"

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": code,
                    "message": str(exc.detail),
                    "details": None,
                    "request_id": request_id,
                }
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        request_id = _extract_request_id(request)
        logger.exception("Unhandled server exception [request_id=%s]", request_id)
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An internal server error occurred.",
                    "details": None,
                    "request_id": request_id,
                }
            },
        )

    # 4. Route registration
    # Root health endpoint
    app.include_router(health_router)

    # API v1 routes
    api_v1_router = APIRouter(prefix="/api/v1")
    api_v1_router.include_router(scenarios_router)
    api_v1_router.include_router(runs_router)
    api_v1_router.include_router(mitigations_router)
    api_v1_router.include_router(verification_router)
    app.include_router(api_v1_router)

    return app


# Default app instance for ASGI servers (uvicorn)
app = create_app()
