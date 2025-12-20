
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if ALLOWED_ORIGINS == ["*"]:
        ALLOWED_ORIGINS = ["*"]
