"""API error contract: every handled error responds with
`{"error": {"code": ..., "message_th": ...}}` (see frontend/src/lib/api-client.ts).
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message_th: str):
        self.status_code = status_code
        self.code = code
        self.message_th = message_th


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def _handle_api_error(_request: Request, exc: ApiError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message_th": exc.message_th}},
        )
