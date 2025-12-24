import sys
import os

# back 폴더를 Python 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'back'))

from mangum import Mangum
from back.main import app

# Mangum으로 FastAPI 앱을 래핑하여 Vercel Serverless Functions에서 사용
handler = Mangum(app, lifespan="off")

