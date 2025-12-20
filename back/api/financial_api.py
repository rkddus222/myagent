from fastapi import APIRouter, HTTPException
from model.llm_model import FinancialAnalysisRequest
from service.financial_service import analyze_financial_query
from utils.logger import setup_logger

logger = setup_logger('financial_api')
financial_api = APIRouter(tags=["financial"])

@financial_api.post("/analyze")
async def analyze_finance(request: FinancialAnalysisRequest):
    try:
        logger.info(f"Received financial analysis request for: {request.target_companies}")
        result = analyze_financial_query(request.target_companies)
        return {"answer": result}
    except Exception as e:
        logger.error(f"Financial analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
