from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.errors import register_error_handlers
from app.core.logging import configure_logging
from app.core.settings import settings
from app.routers import (
    auth,
    dashboard,
    knowledge,
    line_webhook,
    market_radar,
    mock_insights,
    my_business,
    onboarding,
    premium,
    sponsors,
    ubot,
    ubot_insights,
    voice,
)

configure_logging()

app = FastAPI(title="FinLens AI API")
register_error_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Real data (PostgreSQL + LINE)
app.include_router(line_webhook.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

# Mock data (reads ../mock-data/*.json)
app.include_router(my_business.router)
app.include_router(market_radar.router)
app.include_router(mock_insights.router)
app.include_router(ubot.router)
app.include_router(ubot_insights.router)
app.include_router(sponsors.router)
app.include_router(premium.router)
app.include_router(onboarding.router)
app.include_router(voice.router)
app.include_router(knowledge.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
