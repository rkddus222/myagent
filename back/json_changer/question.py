import json
import re

def convert_text_format(json_file_path, output_file_path=None):
    """
    JSON 파일을 읽어서 텍스트 포맷을 변환합니다.
    
    Args:
        json_file_path (str): 입력 JSON 파일 경로
        output_file_path (str, optional): 출력 파일 경로. None이면 원본 파일을 덮어씁니다.
    """
    
    # JSON 파일 읽기
    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
    except FileNotFoundError:
        print(f"파일을 찾을 수 없습니다: {json_file_path}")
        return
    except json.JSONDecodeError:
        print(f"JSON 형식이 올바르지 않습니다: {json_file_path}")
        return
    
    # JSON을 문자열로 변환 (pretty print)
    json_string = json.dumps(data, ensure_ascii=False, indent=2)
    
    # 1. '{:,.2f}'.format(값) → format(값, ',.2f') 변환
    # 패턴: '{:,.2f}'.format(변수나 표현식)
    pattern1 = r"'{\:,.2f}'\.format\(([^)]+)\)"
    replacement1 = r"format(\1, ',.2f')"
    converted_text = re.sub(pattern1, replacement1, json_string)
    
    # 2. 불필요한 \n 제거 (건\n 입니다 → 건입니다)
    pattern2 = r'건\\n\s*입니다'
    replacement2 = r'건입니다'
    converted_text = re.sub(pattern2, replacement2, converted_text)
    
    # 3. 추가적인 공백 정리가 필요한 경우
    # 예: \n \n → \n 같은 불필요한 공백 제거
    pattern3 = r'\\n\s+입니다'
    replacement3 = r'입니다'
    converted_text = re.sub(pattern3, replacement3, converted_text)
    
    # JSON으로 다시 파싱 (문법 검증)
    try:
        converted_data = json.loads(converted_text)
    except json.JSONDecodeError as e:
        print(f"변환된 텍스트가 유효한 JSON이 아닙니다: {e}")
        return
    
    # 결과 저장
    output_path = output_file_path if output_file_path else json_file_path
    
    try:
        with open(output_path, 'w', encoding='utf-8') as file:
            json.dump(converted_data, file, ensure_ascii=False, indent=2)
        print(f"변환 완료: {output_path}")
    except Exception as e:
        print(f"파일 저장 중 오류 발생: {e}")


def preview_conversion(text):
    """
    변환 결과를 미리보기합니다.
    
    Args:
        text (str): 변환할 텍스트
    
    Returns:
        str: 변환된 텍스트
    """
    # 1. '{:,.2f}'.format(값) → format(값, ',.2f') 변환
    pattern1 = r"'{\:,.2f}'\.format\(([^)]+)\)"
    replacement1 = r"format(\1, ',.2f')"
    converted_text = re.sub(pattern1, replacement1, text)
    
    # 2. 불필요한 \n 제거
    pattern2 = r'건\\n\s*입니다'
    replacement2 = r'건입니다'
    converted_text = re.sub(pattern2, replacement2, converted_text)
    
    # 3. 추가 공백 정리
    pattern3 = r'\\n\s+입니다'
    replacement3 = r'입니다'
    converted_text = re.sub(pattern3, replacement3, converted_text)
    
    return converted_text


# 사용 예시
if __name__ == "__main__":
    
    # 실제 JSON 파일 변환
    convert_text_format('test_cases.json', 'output.json')  # 새 파일로 저장