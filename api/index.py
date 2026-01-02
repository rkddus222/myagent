import sys
import os
import json

try:
    # back 폴더를 Python 경로에 추가
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'back'))
    # 루트 폴더도 추가 (back 모듈을 찾기 위해)
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

    from mangum import Mangum
    from back.main import app

    # Mangum으로 FastAPI 앱을 래핑하여 Vercel Serverless Functions에서 사용
    handler = Mangum(app, lifespan="off")

except Exception as e:
    import traceback
    error_msg = f"Bootstrap Error: {str(e)}\n{traceback.format_exc()}"
    print(error_msg)
    
    # 에러 발생 시 임시 핸들러 반환
    def handler(event, context):
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": error_msg})
        }

