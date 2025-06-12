import re
import os
import json
from datetime import datetime
from typing import List, Dict, Any

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage

from utils.chatgpt import gpt_4o_mini as llm
from utils.logger import setup_logger

logger = setup_logger('llm_service')

TODAY = datetime.now().strftime("%Y-%m-%d")

def read_prompt_file(prompt_name: str, company_id: str, table_name: str) -> str | None:
    base_path = os.path.join(os.path.dirname(__file__), '..', 'utils', 'prompt')

    # 회사별 프롬프트 파일 경로 (company_id가 제공된 경우)
    if company_id == "fstring":
        prompt_path = os.path.join(base_path, 'fstring', 'respondent.py')
        logger.info(f"Checking for fstring-specific prompt at: {prompt_path}")
    else:
        # 회사별 프롬프트 파일 경로 (company_id가 제공된 경우)
        prompt_path = os.path.join(base_path, company_id, f'{prompt_name}.py') if company_id else None
        logger.info(f"Checking for company-specific prompt at: {prompt_path}")

    # 프롬프트 파일 존재 여부 확인
    if prompt_path and os.path.exists(prompt_path):
        try:
            with open(prompt_path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                logger.info(f"Successfully read prompt file. Content length: {len(content)}")
                
                # 테이블별 프롬프트 처리
                if table_name and table_name != '모든 테이블':
                    try:
                        # prompts_nl2sql.py 파일에서 테이블별 프롬프트 변수 가져오기
                        import importlib.util
                        spec = importlib.util.spec_from_file_location("prompts", prompt_path)
                        prompts_module = importlib.util.module_from_spec(spec)
                        spec.loader.exec_module(prompts_module)
                        
                        # 테이블 이름을 프롬프트 변수 이름으로 변환 (예: DGC_INFO -> PROMPT_DGC_INFO)
                        prompt_var_name = f"PROMPT_{table_name}"
                        if hasattr(prompts_module, prompt_var_name):
                            table_prompt = getattr(prompts_module, prompt_var_name)
                            logger.info(f"Found table-specific prompt for {table_name}")
                            return table_prompt
                        else:
                            logger.warning(f"Table-specific prompt not found: {prompt_var_name}")
                    except Exception as e:
                        logger.warning(f"Failed to load table-specific prompt: {str(e)}")
                
                return content
        except Exception as e:
            logger.warning(f"프롬프트 파일 읽기 실패 ({prompt_path}): {str(e)}")
            return None

    logger.warning(f"프롬프트 파일을 찾을 수 없습니다: {prompt_path}")
    return None

def extract_sql_from_response(result: str) -> str:
    logger.info(f"Extracting SQL from response: {result[:200]}...")
    match = re.search(r"```sql\s*(.*?)\s*```", result, re.DOTALL)
    if match:
        sql = match.group(1).strip()
        logger.info(f"Found SQL in code block: {sql[:200]}...")
        return sql

    match = re.search(r"(WITH\s+.*|SELECT\s+.*)", result, re.DOTALL)
    if match:
        sql = match.group(0).strip()
        logger.info(f"Found SQL in plain text: {sql[:200]}...")
        return sql

    logger.error("No SQL query found in response")
    raise ValueError("SQL 쿼리를 찾을 수 없습니다.")

def nl2sql(company_id: str, user_question: str, table_name: str) -> str:
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        system_prompt = read_prompt_file("prompts_nl2sql", company_id, table_name)
        partial_prompt = system_prompt.format(user_question=user_question, today=today)
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=partial_prompt),
            ("user", user_question)
        ])

        chain = prompt | llm
        logger.info("Invoking LLM chain...")
        response = chain.invoke({"user_question": user_question})
        result = response.content if hasattr(response, "content") else str(response)
        logger.info(f"LLM response: {result[:200]}...")
        
        return result

    except Exception as e:
        logger.error(f"NL2SQL 처리 중 오류 발생: {str(e)}")
        logger.error(f"Error details: {type(e).__name__}")
        raise

def respondent(company_id: str, user_question: str, sql_query: str) -> str:
    try:
        print(f"user_question: {user_question}")
        print(f"sql_query: {sql_query}")
        system_prompt = read_prompt_file("prompts_respondent", company_id, sql_query)
        partial_prompt = system_prompt.format(user_question=user_question, sql_query=sql_query)
        print(partial_prompt)
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=partial_prompt),
            ("user", user_question),
        ])

        chain = prompt | llm
        logger.info("Invoking LLM chain...")
        response = chain.invoke({"user_question": user_question})
        result = response.content if hasattr(response, "content") else str(response)
        logger.info(f"LLM response: {result}")
        
        return result

    except Exception as e:
        logger.error(f"Respondent 처리 중 오류 발생: {str(e)}")
        logger.error(f"Error details: {type(e).__name__}")
        raise

def help(prompt: str, user_question: str) -> str:
    try:
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt),
            ("user", user_question)
        ])

        chain = prompt | llm
        logger.info("Invoking LLM chain...")
        response = chain.invoke({"user_question": user_question})
        result = response.content if hasattr(response, "content") else str(response)
        logger.info(f"LLM response: {result[:200]}...")
        
        return result

    except Exception as e:
        logger.error(f"HELP 처리 중 오류 발생: {str(e)}")
        logger.error(f"Error details: {type(e).__name__}")
        raise

def evaluate(prompt: str, question1: str, question2: str) -> str:
    try:
        user_question = f"질문1: {question1}\n질문2: {question2}"
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt),
            ("user", user_question)
        ])

        chain = prompt | llm
        logger.info("Invoking LLM chain...")
        response = chain.invoke({"user_question": user_question})
        result = response.content if hasattr(response, "content") else str(response)
        logger.info(f"LLM response: {result[:200]}...")
        
        return result

    except Exception as e:
        logger.error(f"EVALUATE 처리 중 오류 발생: {str(e)}")
        logger.error(f"Error details: {type(e).__name__}")
        raise