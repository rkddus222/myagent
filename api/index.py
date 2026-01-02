import sys
import os

# Vercel 환경에서 'back' 디렉토리를 모듈 경로에 추가
# 현재 파일 위치: /var/task/api/index.py (예시)
# 목표 'back' 위치: /var/task/back
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir) # 루트 디렉토리
sys.path.append(os.path.join(parent_dir, "back"))

from fastapi import FastAPI
from mangum import Mangum
from back.main import app # 실제 백엔드 앱 임포트

# Vercel Serverless Function 진입점
handler = Mangum(app)
