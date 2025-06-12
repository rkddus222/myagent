import json
import sys
import os
import csv
import time
from typing import Dict, Any, List
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from langchain.prompts import PromptTemplate
from with_llm.model.qwen import qwen_llm as llm

def evaluate_result_prompt() -> PromptTemplate:
    """SQL을 JSON으로 변환하기 위한 프롬프트 템플릿 생성"""
    template = """당신은 SQL쿼리를 평가하는 전문가입니다.
    다음은 원본 SQL 쿼리와 SQLAlchemy로 변환 후 다시 재조립한 SQL 결과입니다.
    두 쿼리가 같은 동작을 하는지 판단해주세요.
    결과가 동일하게 나오면 같은 동작을 하는 쿼리로 판단하면 됩니다.

    원본 SQL:
    {question}

    변환된 SQL:
    {converted_question}

    간결하게 다음 두 가지만 응답해주세요:
    일치여부: [예 또는 아니오]
    의견: [쿼리가 일치하는 이유 또는 불일치하는 이유를 간략히 설명]
    """
    return PromptTemplate(
        input_variables=["question", "converted_question"],
        template=template
    )


def result_to_json(llm, original_sql: str, transformed_sql: str) -> Dict[str, Any]:
    """두 SQL 쿼리를 비교하고 결과를 반환"""
    prompt = evaluate_result_prompt()

    try:
        chain = prompt | llm
        result = chain.invoke({
            "question": original_sql,
            "converted_question": transformed_sql
        })
        response_text = result.content.strip()

        # 결과 추출
        lines = response_text.split('\n')
        result_dict = {}

        for line in lines:
            if line.startswith("일치여부:"):
                result_dict["일치여부"] = line.replace("일치여부:", "").strip()
            elif line.startswith("의견:"):
                result_dict["의견"] = line.replace("의견:", "").strip()

        return result_dict

    except Exception as e:
        print(f"Error comparing SQL queries: {str(e)}")
        return None


def process_json_file(input_file: str, output_file: str = None):
    """JSON 파일 처리 및 변환"""
    if output_file is None:
        base_name = input_file.rsplit('.', 1)[0]
        output_file = f"{base_name}_evaluate_result.json"

    # 입력 파일 로드
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        if 'question' in item and 'converted_question' in item and 'result' not in item:
            original_sql = item['question']
            transformed_sql = item['converted_question']

            print(f"Processing SQL comparison: {original_sql[:100]}...")

            evaluation_result = result_to_json(llm, original_sql, transformed_sql)
            if evaluation_result:
                item['result'] = evaluation_result

            time.sleep(1)  # API 호출 제한 딜레이

    # JSON 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # CSV 저장
    csv_output_file = output_file.replace(".json", ".csv")
    save_as_csv(data, csv_output_file)

    print(f"Processing complete. Results saved to {output_file} and {csv_output_file}")


def save_as_csv(data: List[Dict[str, Any]], output_csv: str):
    """결과를 CSV 파일로 저장"""
    csv_columns = ["question", "answer", "converted_question", "일치여부", "의견"]

    with open(output_csv, 'w', newline='', encoding='utf-8-sig') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
        writer.writeheader()

        for item in data:
            row = {
                "question": item.get("question", ""),
                "answer": item.get("answer", ""),
                "converted_question": item.get("converted_question", "")
            }

            result = item.get("result", {})
            if isinstance(result, dict):
                row.update({
                    "일치여부": result.get("일치여부", ""),
                    "의견": result.get("의견", "")
                })

            writer.writerow(row)

    print(f"CSV file saved to {output_csv}")

if __name__ == "__main__":
    input_file = '../data/question_converted.json'
    reference_file = '../data/shots_nl2sql.json'
    process_json_file(input_file, reference_file)
