import os
import requests
import json
import psycopg2
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pathlib import Path

from core.config import settings

# 프로젝트 루트 디렉토리 찾기
project_root = Path(__file__).parent.parent.parent
env_file_path = project_root / '.env'

load_dotenv(env_file_path)

# 토큰 캐시 변수 (메모리 내 캐싱)
_cached_token = None

def get_db_connection():
    """DB 연결을 생성합니다."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL 설정이 없습니다.")
        return None
    try:
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        print(f"❌ DB 연결 오류: {e}")
        return None

def save_token_to_db(token_info: dict):
    """
    토큰 정보를 Supabase DB에 저장합니다.
    """
    conn = get_db_connection()
    if not conn:
        return False
        
    try:
        cur = conn.cursor()
        # UPSERT (저장 또는 업데이트)
        cur.execute("""
            INSERT INTO tokens (token_key, access_token, expires_at, updated_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (token_key) 
            DO UPDATE SET 
                access_token = EXCLUDED.access_token,
                expires_at = EXCLUDED.expires_at,
                updated_at = CURRENT_TIMESTAMP;
        """, (
            'KOR_INVESTMENT_API', 
            token_info['access_token'], 
            token_info['expires_at']
        ))
        conn.commit()
        cur.close()
        conn.close()
        print("✅ 토큰 정보가 DB에 저장되었습니다.")
        return True
    except Exception as e:
        print(f"❌ 토큰 저장 중 DB 오류: {e}")
        if conn: conn.close()
        return False

def is_token_expired(expires_at_str: str) -> bool:
    """
    토큰의 만료 시간을 확인합니다.
    """
    if not expires_at_str:
        return True
    
    try:
        # ISO 포맷 또는 DB 저장 포맷 파싱
        expires_at = datetime.fromisoformat(expires_at_str.replace('Z', '+00:00'))
        # 10분 여유를 두고 만료 체크
        return datetime.now(expires_at.tzinfo) >= (expires_at - timedelta(minutes=10))
    except Exception as e:
        print(f"토큰 만료 시간 파싱 오류: {e}")
        return True

def get_token_from_db() -> dict:
    """
    DB에서 저장된 토큰 정보를 가져옵니다.
    """
    conn = get_db_connection()
    if not conn:
        return None
        
    try:
        cur = conn.cursor()
        cur.execute("SELECT access_token, expires_at FROM tokens WHERE token_key = %s", ('KOR_INVESTMENT_API',))
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if row:
            access_token, expires_at = row
            # expires_at을 문자열(ISO)로 변환하거나 객체로 유지
            return {
                "access_token": access_token,
                "expires_at": expires_at.isoformat() if hasattr(expires_at, 'isoformat') else str(expires_at),
                "token_type": "Bearer",
                "base_url": "https://openapi.koreainvestment.com:9443",
                "is_production": True
            }
    except Exception as e:
        print(f"❌ DB 토큰 조회 중 오류: {e}")
        if conn: conn.close()
        
    return None

def clear_token_cache():
    """토큰의 메모리 캐시를 초기화합니다."""
    global _cached_token
    _cached_token = None

def get_api_key_from_db(key_name: str) -> str:
    """DB에서 API 키를 조회합니다."""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT key_value FROM api_keys WHERE key_name = %s", (key_name,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if row:
            return row[0]
    except Exception as e:
        print(f"❌ DB API 키 조회 중 오류 ({key_name}): {e}")
        if conn: conn.close()
    
    return None

def get_access_token() -> dict:
    """
    한국투자증권 API 액세스 토큰을 발급받습니다.
    DB에 저장된 토큰이 있고 만료되지 않았다면 그것을 사용하고,
    만료되었다면 새로 발급받아 DB에 저장합니다.
    """
    global _cached_token
    
    # 1. 메모리 캐시 확인
    if _cached_token and not is_token_expired(_cached_token['expires_at']):
        print("✅ 메모리 캐시된 토큰을 사용합니다.")
        return _cached_token
    
    # 2. DB 저장 토큰 확인
    saved_token = get_token_from_db()
    if saved_token and not is_token_expired(saved_token['expires_at']):
        print("✅ DB에 저장된 토큰을 사용합니다.")
        _cached_token = saved_token
        return saved_token
    
    print("🔄 토큰이 만료되었거나 없습니다. 새로 발급받습니다...")

    # 3. API 키 가져오기 (환경변수 우선 -> DB 조회)
    app_key = os.getenv("KOR_INVESTMENT_APP_KEY")
    app_secret = os.getenv("KOR_INVESTMENT_APP_SECRET")

    # 환경변수에 없으면 DB에서 조회
    if not app_key:
        print("ℹ️ 환경 변수에서 APP_KEY를 찾을 수 없어 DB를 조회합니다.")
        app_key = get_api_key_from_db("KOR_INVESTMENT_APP_KEY")
        
    if not app_secret:
        print("ℹ️ 환경 변수에서 APP_SECRET을 찾을 수 없어 DB를 조회합니다.")
        app_secret = get_api_key_from_db("KOR_INVESTMENT_APP_SECRET")

    if not app_key or not app_secret:
        raise ValueError("API 키가 설정되지 않았습니다. 환경 변수 또는 DB(api_keys 테이블)에서 KOR_INVESTMENT_APP_KEY와 KOR_INVESTMENT_APP_SECRET을 설정해주세요.")

    base_url = "https://openapi.koreainvestment.com:9443"
    url = f"{base_url}/oauth2/tokenP"
    headers = {"Content-Type": "application/json"}
    data = {
        "grant_type": "client_credentials",
        "appkey": app_key,
        "appsecret": app_secret
    }

    try:
        response = requests.post(url, headers=headers, json=data)

        if response.status_code == 200:
            result = response.json()
            # 만료시간 계산 (23시간 후로 설정)
            # 한투 토큰은 24시간 유효하지만 안전하게 23시간으로 설정
            expires_at = datetime.now() + timedelta(hours=23)

            token_info = {
                "access_token": result["access_token"],
                "expires_at": expires_at.isoformat(),
                "token_type": result.get("token_type", "Bearer"),
                "base_url": base_url,
                "is_production": True
            }

            # 토큰을 DB에 저장
            save_token_to_db(token_info)
            _cached_token = token_info
            return token_info
        else:
            print(f"❌ 토큰 발급 실패: {response.status_code}, {response.text}")
            return None

    except Exception as e:
        print(f"❌ 토큰 발급 프로세스 중 오류: {e}")
        return None

if __name__ == "__main__":
    print("=== 한국투자증권 API 토큰 발급 도구 (Supabase 캐시) ===\n")
    token_info = get_access_token()
    if token_info:
        print(f"✅ 토큰 준비 완료! ({token_info['expires_at']} 까지 유효)")
    else:
        print("❌ 토큰 발급에 실패했습니다.")
