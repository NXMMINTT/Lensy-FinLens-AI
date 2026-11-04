from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

API_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://uledger:uledger@localhost:5432/uledger"

    @property
    def effective_database_url(self) -> str:
        url = self.database_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    line_channel_secret: str = ""
    line_channel_access_token: str = ""
    liff_id: str = ""
    # LINE Login channel that owns the LIFF app — only used by scripts/sync_public_url.py
    line_login_channel_id: str = ""
    line_login_channel_secret: str = ""
    # Dev/demo only (ignored when LIFF_ID is set): show this LINE user's shop on the dashboard instead of the demo shop.
    dashboard_line_user_id: str = ""

    # KKU IntelSphere (OpenAI-compatible Gemini) — LINE bot parsing and U-Fox
    kku_base_url: str = "https://gen.ai.kku.ac.th/api/v1"
    kku_api_key: str = ""
    kku_model: str = "gemini-3.5-flash-lite"

    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = ""
    enable_voice_reply: bool = False

    jwt_secret: str = "change-me"
    public_base_url: str = "http://localhost:8000"
    frontend_origin: str = "http://localhost:3000"
    macro_data_mode: str = "mock"

    tax_rules_path: Path = API_ROOT / "config" / "tax_rules.yaml"
    upload_dir: Path = API_ROOT / "uploads"


settings = Settings()
