from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Sonora"
    database_url: str = "sqlite:///./sonora.db"


settings = Settings()
