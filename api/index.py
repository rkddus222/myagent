import sys
import os

# Vercel 환경에서 루트 디렉토리를 모듈 경로에 추가
# 현재 파일 위치: /var/task/api/index.py
# 목표 루트 위치: /var/task
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir) # 루트 디렉토리
sys.path.append(parent_dir)

from back.main import app # 실제 백엔드 앱 임포트

# Vercel은 'app' 객체를 자동으로 감지하여 Serverless Function으로 배포합니다.
