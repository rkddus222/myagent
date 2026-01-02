from fastapi import FastAPI
from mangum import Mangum
from pydantic import BaseModel

app = FastAPI()

class StockRequest(BaseModel):
    query: str = "test"

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Vercel Minimal Deployment Success!"}

@app.post("/api/financial/analyze")
def analyze_dummy(request: dict):
    return {
        "status": "success",
        "message": "This is a dummy response from minimal API.",
        "data": "If you see this, Vercel deployment is WORKING correctly. The issue is in 'back' module."
    }

# Mangum Handler
handler = Mangum(app, lifespan="off")
