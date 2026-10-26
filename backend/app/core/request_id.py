"""Request-ID middleware and context propagation."""
import contextvars
import re
import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

_request_id_ctx_var: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="")
_SAFE_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-]{1,64}$")


def get_current_request_id() -> str:
    """Return the active request ID from context or generate a fallback."""
    req_id = _request_id_ctx_var.get()
    return req_id if req_id else f"req_{uuid.uuid4().hex[:12]}"


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Assigns or propagates an opaque request ID for traceable error handling."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming_id = request.headers.get("X-Request-ID", "").strip()
        if incoming_id and _SAFE_ID_REGEX.match(incoming_id):
            request_id = incoming_id
        else:
            request_id = f"req_{uuid.uuid4().hex[:12]}"

        # Bind to contextvar and request.state
        token = _request_id_ctx_var.set(request_id)
        request.state.request_id = request_id

        try:
            response = await call_next(request)
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            _request_id_ctx_var.reset(token)
