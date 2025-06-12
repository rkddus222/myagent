import os
from pydantic import Field
from dotenv import load_dotenv

from back.utils.logger import setup_logger

logger = setup_logger("Config")
load_dotenv()

class Config:
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    ALLOWED_ORIGINS: list = [
        #"*",
        "https://vector-admin.daquv.com",
        "http://183.102.124.134",
        "http://183.102.124.146",
        "https://qvadmin.daquv.com",
        "http://localhost:4010"
    ]

    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_DATABASE = os.getenv("DB_DATABASE")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")

    # Dolt 설정
    DOLT_TOKEN = os.getenv("DOLT_TOKEN")
    DOLT_BASE_API = os.getenv("DOLT_BASE_API")
    DOLT_BRANCH = os.getenv("DOLT_BRANCH")
    DOLT_GET_COMMIT_HISTORY = os.getenv("DOLT_GET_COMMIT_HISTORY")
    DOLT_GET_COMMIT_INFO = os.getenv("DOLT_GET_COMMIT_INFO")
    DOLT_LOCAL = os.getenv("DOLT_LOCAL")
    DOLT_GET_COMMIT_DIFF = os.getenv("DOLT_GET_COMMIT_DIFF")


    SSH_HOST = os.getenv("SSH_HOST")
    SSH_USER = os.getenv("SSH_USER")
    SSH_KEY_PATH = os.getenv("SSH_KEY_PATH")
    SSH_KEY_PATH_LINUX = os.getenv("SSH_KEY_PATH_LINUX")

    # 기타 설정들
    OPENAI_API_KEY: str = Field(default="")
    API_URL = os.getenv("API_URL")
    ADMIN_DOMAIN = os.getenv("ADMIN_DOMAIN")
    AES_KEY = os.getenv("AES_KEY")