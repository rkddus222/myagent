import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def create_token_table():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL 설정이 없습니다.")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # tokens 테이블 생성
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tokens (
                token_key TEXT PRIMARY KEY,
                access_token TEXT NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        print("✅ tokens 테이블이 성공적으로 생성되었습니다.")
    except Exception as e:
        print(f"❌ 테이블 생성 중 오류 발생: {e}")

if __name__ == "__main__":
    create_token_table()
