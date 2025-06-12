import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from typing import Dict, Any
import time
from with_llm.model.chatgpt import gpt_4o_mini as llm


def create_sql_to_json_prompt() -> PromptTemplate:
    """SQL을 JSON으로 변환하기 위한 프롬프트 템플릿 생성"""
    template = """당신은 SQL을 SQLAlchemy 스타일의 JSON으로 변환하는 전문가입니다.
다음 SQL 쿼리를 주어진 형식의 JSON으로 변환해주세요.

SQL:
{sql}

다음과 같은 형식으로 변환해주세요:
{{
    "selected_columns": [
        "Table.COLUMN.label('alias')",
        "func.function(Table.COLUMN).label('alias')"
    ],
    "conditions": [
        "Table.COLUMN == 'value'",
        "Table.COLUMN.in_(['value1', 'value2'])"
    ],
    "group_by": [
        "Table.COLUMN",
        "func.function(Table.COLUMN)"
    ],
    "order_by": [
        "Table.COLUMN",
        "func.function(Table.COLUMN).desc()"
    ],
    "transformations": [
        {{"column": "COLUMN", "transformation": "FUNCTION(COLUMN)"}}
    ]
}}

예시 변환:

1. 기본 SELECT 쿼리:
SQL:
SELECT TYPE,
       SUM(WGT) AS total_weight,
       SUM(AMT) AS total_amount
FROM css_daquv.POC_PRODUCT_WIP_MONTHLY
WHERE BASE_YMD = DATE '2025-02-28'
  AND PREQ_NO LIKE 'W%'
GROUP BY TYPE;

JSON:
{{
    "selected_columns": [
        "Table.TYPE",
        "func.sum(Table.WGT).label('total_weight')",
        "func.sum(Table.AMT).label('total_amount')"
    ],
    "conditions": [
        "Table.BASE_YMD == '2025-02-28'",
        "Table.PREQ_NO.like('W%')"
    ],
    "group_by": [
        "Table.TYPE"
    ],
    "order_by": [],
    "transformations": []
}}

2. UNION ALL을 사용한 비교 쿼리:
SQL:
SELECT '2024-12-31' AS base_date, SUM(WGT) AS total_weight_dec 
FROM css_daquv.POC_PRODUCT_WIP_MONTHLY 
WHERE TYPE = '제품' AND BASE_YMD = '2024-12-31' 
UNION ALL 
SELECT '2025-02-28' AS base_date, SUM(WGT) AS total_weight_feb 
FROM css_daquv.POC_PRODUCT_WIP_MONTHLY 
WHERE TYPE = '제품' AND BASE_YMD = '2025-02-28' 
ORDER BY base_date

JSON:
{{
    "selected_columns": [
        "literal('2024-12-31').label('base_date')",
        "func.sum(Table.WGT).label('total_weight_dec')"
    ],
    "conditions": [
        "Table.TYPE == '제품'",
        "Table.BASE_YMD == '2024-12-31'"
    ],
    "group_by": [],
    "order_by": [
        "literal('2024-12-31')"
    ],
    "transformations": []
}}

3. 날짜 포맷과 복잡한 그룹화:
SQL:
SELECT FORMAT_DATE('%Y-%m', BASE_YMD) AS MONTH,
       ORD_TYPE,
       IRN_LARGE_NM,
       SUM(WGT) AS total_weight,
       SUM(AMT) AS total_amount
FROM css_daquv.POC_PRODUCT_WIP_MONTHLY
WHERE BASE_YMD >= DATE_SUB(DATE '2025-05-11', INTERVAL 3 MONTH)
GROUP BY MONTH,
         ORD_TYPE,
         IRN_LARGE_NM
ORDER BY MONTH,
         ORD_TYPE,
         IRN_LARGE_NM;

JSON:
{{
    "selected_columns": [
        "func.format_date('%Y-%m', Table.BASE_YMD).label('MONTH')",
        "Table.ORD_TYPE",
        "Table.IRN_LARGE_NM",
        "func.sum(Table.WGT).label('total_weight')",
        "func.sum(Table.AMT).label('total_amount')"
    ],
    "conditions": [
        "Table.BASE_YMD >= func.date_sub(func.date('2025-05-11'), func.interval(3, 'MONTH'))"
    ],
    "group_by": [
        "func.format_date('%Y-%m', Table.BASE_YMD)",
        "Table.ORD_TYPE",
        "Table.IRN_LARGE_NM"
    ],
    "order_by": [
        "func.format_date('%Y-%m', Table.BASE_YMD)",
        "Table.ORD_TYPE",
        "Table.IRN_LARGE_NM"
    ],
    "transformations": [
        {{"column": "BASE_YMD", "transformation": "FORMAT_DATE('%Y-%m', BASE_YMD)"}}
    ]
}}

4. WITH 절을 사용한 복잡한 쿼리:
SQL:
WITH monthly_data AS
  (SELECT BASE_YMD,
          SUM(WGT) AS total_weight,
          SUM(AMT) AS total_amount
   FROM css_daquv.POC_PRODUCT_WIP_MONTHLY
   WHERE BASE_YMD >= DATE_SUB(DATE '2025-05-05', INTERVAL 6 MONTH)
     AND TYPE = '제품'
     AND LONG_TYPE IN ('장기', '일몰')
   GROUP BY BASE_YMD)
SELECT BASE_YMD,
       total_weight,
       total_amount
FROM monthly_data
ORDER BY BASE_YMD;

JSON:
{{
    "selected_columns": [
        "Table.BASE_YMD",
        "func.sum(Table.WGT).label('total_weight')",
        "func.sum(Table.AMT).label('total_amount')"
    ],
    "conditions": [
        "Table.BASE_YMD >= func.date_sub(func.date('2025-05-05'), func.interval(6, 'MONTH'))",
        "Table.TYPE == '제품'",
        "Table.LONG_TYPE.in_(['장기', '일몰'])"
    ],
    "group_by": [
        "Table.BASE_YMD"
    ],
    "order_by": [
        "Table.BASE_YMD"
    ],
    "transformations": []
}}

JSON만 출력해주세요. 다른 설명이나 텍스트는 포함하지 마세요."""

    return PromptTemplate(
        input_variables=["sql"],
        template=template
    )

def transform_sql_to_json(llm, sql: str) -> Dict[str, Any]:
    """SQL을 JSON으로 변환"""
    prompt = create_sql_to_json_prompt()
    
    try:
        # 새로운 LangChain 문법 사용
        chain = prompt | llm
        result = chain.invoke({"sql": sql})
        
        # 응답에서 JSON 추출
        json_str = result.content.strip()
        
        # 디버그: 모델 출력 확인
        print("\nModel's raw output:")
        print("-" * 50)
        print(json_str)
        print("-" * 50)
        
        # JSON 문자열에서 실제 JSON 부분만 추출
        start_idx = json_str.find('{')
        end_idx = json_str.rfind('}') + 1
        if start_idx >= 0 and end_idx > start_idx:
            json_str = json_str[start_idx:end_idx]
            print("\nExtracted JSON:")
            print("-" * 50)
            print(json_str)
            print("-" * 50)
        
        return json.loads(json_str)
    except Exception as e:
        print(f"Error transforming SQL: {str(e)}")
        return None

def process_json_file(input_file: str, output_file: str = None):
    """JSON 파일 처리 및 변환"""
    if output_file is None:
        # 입력 파일명에서 확장자를 제외한 부분을 가져와서 _edit.json을 붙임
        base_name = input_file.rsplit('.', 1)[0]
        output_file = f"{base_name}_edit.json"
    
    # 입력 파일 읽기
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 각 항목 처리
    for item in data:
        if 'answer' in item and 'sqlalchemy' not in item:
            print(f"Processing SQL: {item['answer'][:100]}...")
            sqlalchemy_json = transform_sql_to_json(llm, item['answer'])
            if sqlalchemy_json:
                # SQLAlchemy 표현식에서 중괄호를 이스케이프 처리
                escaped_json = {}
                for key, value in sqlalchemy_json.items():
                    if isinstance(value, list):
                        escaped_json[key] = [
                            v.replace('{', '{{').replace('}', '}}') if isinstance(v, str) else v
                            for v in value
                        ]
                    else:
                        escaped_json[key] = value
                item['sqlalchemy'] = escaped_json
            time.sleep(1)  # API 호출 제한을 위한 딜레이
    
    # 결과 저장 (ensure_ascii=False로 한글 유지, indent=2로 가독성 확보)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Processing complete. Results saved to {output_file}")

if __name__ == "__main__":
    input_file = '../data/shots_nl2sql.json'
    process_json_file(input_file)