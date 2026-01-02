"""
주식 분석 서비스 테스트 스크립트
리팩토링된 financial_service.py가 올바르게 작동하는지 확인합니다.
"""
import sys
import os

# 프로젝트 루트를 sys.path에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from service.financial_service import analyze_financial_query

if __name__ == "__main__":
    print("=== 주식 분석 서비스 테스트 ===\n")
    
    # 테스트할 종목 리스트 (객체 형식 테스트)
    test_companies = [
        {"name": "삼성전자", "code": "005930"},
        {"name": "애플", "code": "AAPL"}
    ]
    
    print(f"분석 대상: {test_companies}\n")
    print("분석을 시작합니다...\n")
    
    try:
        result = analyze_financial_query(test_companies)
        print("\n=== 분석 결과 ===")
        print(result)
        print("\n✅ 테스트 완료!")
    except Exception as e:
        print(f"\n❌ 테스트 실패: {e}")
        import traceback
        traceback.print_exc()
