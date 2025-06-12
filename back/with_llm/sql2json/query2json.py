import json
import sys
import os
import time
from typing import Dict, Any
from schema import SCHEMA
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from with_llm.model.chatgpt import gpt_4o_mini as llm

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config  # 환경 설정 그대로 사용


def create_question_to_answer_prompt() -> PromptTemplate:
    """JSON Guide 프롬프트 생성"""
    template = """
아래 지침에 따라 기존의 SQL 쿼리를 JSON 형식으로 변환해 주세요. 이 JSON 형식은 QueryBuilder 클래스를 통해 SQLAlchemy 쿼리로 다시 변환될 것입니다.
변환 목적
제공된 SQL 쿼리를 JSON 형식으로 변환하여, 이후 QueryBuilder 클래스를 사용해 SQLAlchemy 쿼리로 올바르게 변환되는지 테스트하기 위함입니다.
JSON 구조 규칙
기본 JSON 구조는 다음과 같습니다:
{{
  "select": [...],  // SELECT 절의 컬럼들
  "where": [...],   // WHERE 절의 조건들
  "group_by": [...], // GROUP BY 절의 컬럼들 (필요시)
  "order_by": [...] // ORDER BY 절의 정렬 조건들 (필요시)
}}
SELECT 절 변환 규칙

단순 컬럼: 문자열로 표현 (예: "user_id")
집계 함수: 객체로 표현
{{
  "func": "함수명",  // sum, avg, count, min, max 등
  "column": "컬럼명",
  "label": "별칭"   // AS 뒤의 이름 (선택사항)
}}

필터가 있는 함수: filter 객체 추가
{{
  "func": "함수명",
  "column": "컬럼명",
  "filter": {{
    "column": "필터컬럼",
    "op": "연산자",   // eq, ne, gt, lt 등
    "value": "비교값"
  }},
  "label": "별칭"
}}

윈도우 함수(OVER): over 객체 추가
{{
  "func": "함수명",
  "column": "컬럼명",
  "over": {{
    "partition_by": ["컬럼1", "컬럼2"],
    "order_by": [
      {{"column": "정렬컬럼", "direction": "asc/desc"}}
    ]
  }},
  "label": "별칭"
}}

WHERE 절 변환 규칙
각 조건을 다음 형식으로 변환:
{{
  "column": "컬럼명",
  "op": "연산자",   // eq, ne, gt, ge, lt, le, like, ilike, in, notin 등
  "value": "비교값" // IS NULL, IS NOT NULL의 경우 value 필요 없음
}}

GROUP BY 절 변환 규칙
그룹화할 컬럼명을 문자열 배열로 표현:
"group_by": ["컬럼1", "컬럼2"]
ORDER BY 절 변환 규칙
정렬 조건을 다음 형식으로 변환:
[
  {{"column": "컬럼명", "direction": "asc"}},
  {{"column": "컬럼명", "direction": "desc"}}
]

연산자 매핑 참조표
= → "op": "eq"
!=, <> → "op": "ne"
> → "op": "gt"
>= → "op": "ge"
< → "op": "lt"
<= → "op": "le"
LIKE → "op": "like"
ILIKE → "op": "ilike" (대소문자 구분 없는 LIKE)
IN → "op": "in", 값은 배열로 제공
NOT IN → "op": "notin", 값은 배열로 제공
IS NULL → "op": "isnull" (value 필드 불필요)
IS NOT NULL → "op": "notnull" (value 필드 불필요)
BETWEEN → "op": "between", 값은 [min, max] 배열로 제공

변환 예시
SQL:
SELECT bank_nm, acct_dv, sum(acct_bal_won) AS total_balance
FROM account_amounts
WHERE bank_nm = '기업은행'
JSON:
{{
        "select": [
            "bank_nm",
            "acct_dv",
            {{
                "func": "sum",
                "column": "acct_bal_won",
                "label": "total_balance"
            }}
        ],
        "where": [
            {{
                "column": "bank_nm",
                "op": "eq",
                "value": "기업은행"
            }}
        ]
    }}
SQL 쿼리 : {question}
줄바꿈 없이 JSON만 출력해주세요. 다른 설명이나 텍스트는 포함하지 마세요.
"""
    return PromptTemplate(
        input_variables=["question"],
        template=template
    )


def transform_question_to_answer(llm, question: str) -> str:
    """질문을 LLM으로 처리하여 답변 생성"""
    try:
        prompt = create_question_to_answer_prompt()  # 따로 프롬프트 정의 필요
        chain = prompt | llm
        result = chain.invoke({"question": question})
        return result.content.strip()
    except Exception as e:
        print(f"Error generating answer: {str(e)}")
        return ""

def process_json_file(input_file: str, output_file: str = None):
    """JSON 파일 처리 및 변환"""
    if output_file is None:
        base_name = input_file.rsplit('.', 1)[0]
        output_file = f"{base_name}_edit.json"

    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        # 1. question → answer 처리
        if 'question' in item:
            print(f"Processing Question: {item['question'][:100]}...")
            answer = transform_question_to_answer(llm, item['question'])
            item['answer'] = answer

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Processing complete. Results saved to {output_file}")

if __name__ == "__main__":
    input_file = '../data/question.json'
    process_json_file(input_file)