from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_name: str = "EstateFlow API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    version: str = "0.1.0"

    # CORS
    frontend_url: str = "http://localhost:5173"

    # Firebase Admin SDK credentials
    firebase_project_id: str = ""
    firebase_client_email: str = ""
    firebase_private_key: str = ""
    firebase_storage_bucket: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def firebase_private_key_normalized(self) -> str:
        """FIREBASE_PRIVATE_KEY env'de \n literal olarak gelebilir, gerçek newline'a çevir."""
        return self.firebase_private_key.replace("\\n", "\n")

    @property
    def is_development(self) -> bool:
        return self.app_env.lower() == "development"

    @property
    def firebase_configured(self) -> bool:
        return all([
            self.firebase_project_id,
            self.firebase_client_email,
            self.firebase_private_key,
        ])


@lru_cache
def get_settings() -> Settings:
    return Settings()
