from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from service.llm_service import nl2sql, respondent, help, evaluate
from model.llm_model import Nl2SqlRequest, RespondentRequest, HelpRequest, EvaluateRequest
from utils.logger import setup_logger

logger = setup_logger('llm_api')
llm_api = APIRouter(tags=["llm"])

@llm_api.post("/nl2sql")
async def post_nl2sql(request: Nl2SqlRequest):
    try:
        sql_query = nl2sql(request.company_id, request.user_question, request.table_name)
        return {"sql_query": sql_query}
    except Exception as e:
        logger.error(f"NL2SQL 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@llm_api.post("/respondent")
async def post_respondent(request: RespondentRequest):
    try:
        fstring_answer = respondent(request.company_id, request.user_question, request.sql_query)
        return {"answer": fstring_answer}
    except Exception as e:
        logger.error(f"Respondent 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@llm_api.post("/help")
async def post_help(request: HelpRequest):
    try:
        answer = help(request.prompt, request.user_question)
        return {"answer": answer}
    except Exception as e:
        logger.error(f"HELP 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@llm_api.post("/evaluate")
async def post_evaluate(request: EvaluateRequest):
    try:
        request.user_question = f"질문1: {request.question1}\n질문2: {request.question2}"
        answer = evaluate(request.prompt, request.question1, request.question2)
        return {"answer": answer}
    except Exception as e:
        logger.error(f"EVALUATE 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
