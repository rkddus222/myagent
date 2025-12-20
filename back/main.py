import argparse
import time
import sys, os

# main.py 파일이 있는 back/ 폴더를 sys.path 앞에 추가
sys.path.insert(0, os.path.dirname(__file__))

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from api.llm_api import llm_api
from api.financial_api import financial_api
from utils.logger import setup_logger
from utils.config import Config



log_dir = os.environ.get("LOG_DIR", "logs")
log_file = os.path.join(log_dir, "agent.log")

logger = setup_logger("main")

def parse_arguments():
    parser = argparse.ArgumentParser(description="FastAPI Uvicorn Server")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host to bind")
    parser.add_argument("--port", type=int, default=8081, help="Port to bind")
    parser.add_argument("--reload",  action="store_true", default=True, help="Enable reload")
    parser.add_argument("--workers", type=int, default=1, help="Number of worker processes")
    return parser.parse_args()

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Request started - {request.client.host} - {request.method} {request.url.path}")
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(
        f"Request completed - {request.client.host} - {request.method} {request.url.path} - "
        f"{response.status_code} - {process_time:.2f}ms"
    )
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(llm_api, prefix="/api/llm")

app.include_router(financial_api, prefix="/api/financial")

@app.get("/")
async def root():
    return {"message": "Vector Admin API"}

if __name__ == "__main__":
    args = parse_arguments()
    print(f"\nVPP running at {args.host}:{args.port}\n")
    uvicorn.run(
        "main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers,
    )
