from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from model.llm_model import FinancialAnalysisRequest
from service.financial_service import analyze_financial_query
from utils.logger import setup_logger

logger = setup_logger('financial_api')
financial_api = APIRouter(tags=["financial"])

@financial_api.post("/analyze")
async def analyze_finance(request: FinancialAnalysisRequest) -> Dict[str, Any]:
    """
    종합 분석 요청 엔드포인트
    
    프론트엔드에서 "종합 분석 요청" 버튼 클릭 시 호출됩니다.
    주어진 종목 리스트에 대해 주식 정보 수집, 뉴스 수집, 분석 리포트 생성을 수행합니다.
    
    Args:
        request: 분석할 종목 리스트를 포함한 요청 객체
        
    Returns:
        분석 결과 리포트 (문자열)
        
    Raises:
        HTTPException: 분석 실패 시 500 에러
    """
    try:
        if not request.target_companies:
            raise HTTPException(
                status_code=400, 
                detail="분석할 종목이 최소 1개 이상 필요합니다."
            )
        
        logger.info(f"종합 분석 요청 수신: {request.target_companies}")
        result = analyze_financial_query(request.target_companies)
        
        if not result or result.strip() == "":
            raise HTTPException(
                status_code=500,
                detail="분석 결과가 생성되지 않았습니다."
            )
        
        logger.info("종합 분석 완료")
        return {"answer": result}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"종합 분석 실패: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"분석 중 오류가 발생했습니다: {str(e)}"
        )
