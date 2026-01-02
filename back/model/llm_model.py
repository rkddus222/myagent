from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Nl2SqlRequest(BaseModel):
    company_id: str
    user_question: str
    table_name: str

class RespondentRequest(BaseModel):
    company_id: str
    user_question: str
    sql_query: str

class HelpRequest(BaseModel):
    prompt: str
    user_question: str

class EvaluateRequest(BaseModel):
    prompt: str
    question1: str
    question2: str
    user_question: str = Field(default="")

class FinancialAnalysisRequest(BaseModel):
    """종합 분석 요청 모델"""
    target_companies: List[Any] = Field(..., description="분석할 종목 리스트 (문자열 또는 {'name': '삼성전자', 'code': '005930'} 형식)", min_length=1)