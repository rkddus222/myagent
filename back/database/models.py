import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

class DatabaseManager:
    """SQLite 데이터베이스 관리 클래스"""

    def __init__(self, db_path: str = "data/stock_analysis.db"):
        """
        데이터베이스 매니저 초기화

        Args:
            db_path: 데이터베이스 파일 경로
        """
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(exist_ok=True)
        self.init_database()

    def get_connection(self) -> sqlite3.Connection:
        """데이터베이스 연결을 반환합니다."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 딕셔너리 형태로 결과 반환
        return conn

    def init_database(self):
        """데이터베이스 테이블을 초기화합니다."""
        with self.get_connection() as conn:
            # 분석 세션 테이블
            conn.execute('''
                CREATE TABLE IF NOT EXISTS analysis_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT UNIQUE NOT NULL,
                    start_time DATETIME NOT NULL,
                    end_time DATETIME,
                    status TEXT DEFAULT 'running',
                    email_sent BOOLEAN DEFAULT FALSE,
                    email_sent_time DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # 분석 결과 테이블
            conn.execute('''
                CREATE TABLE IF NOT EXISTS analysis_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    analysis_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES analysis_sessions (session_id)
                )
            ''')

            # 추천 종목 테이블
            conn.execute('''
                CREATE TABLE IF NOT EXISTS recommended_stocks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    brokerage TEXT NOT NULL,
                    stock_name TEXT NOT NULL,
                    stock_code TEXT NOT NULL,
                    market_type TEXT,
                    entry_price TEXT,
                    current_price TEXT,
                    target_price TEXT,
                    profit_rate TEXT,
                    recommender TEXT,
                    recommendation_reason TEXT,
                    recommendation_date DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES analysis_sessions (session_id)
                )
            ''')

            # 주가 데이터 테이블
            conn.execute('''
                CREATE TABLE IF NOT EXISTS stock_prices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    stock_code TEXT NOT NULL,
                    date DATE NOT NULL,
                    open_price DECIMAL(10,2),
                    high_price DECIMAL(10,2),
                    low_price DECIMAL(10,2),
                    close_price DECIMAL(10,2),
                    volume INTEGER,
                    market_type TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(stock_code, date)
                )
            ''')

            # 뉴스 데이터 테이블
            conn.execute('''
                CREATE TABLE IF NOT EXISTS news_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT,
                    source TEXT,
                    url TEXT,
                    published_date DATETIME,
                    related_stocks TEXT,
                    sentiment REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (session_id) REFERENCES analysis_sessions (session_id)
                )
            ''')

            # 성과 추적 테이블
            conn.execute('''
                CREATE TABLE IF NOT EXISTS performance_tracking (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    stock_code TEXT NOT NULL,
                    brokerage TEXT NOT NULL,
                    recommendation_date DATE NOT NULL,
                    entry_price DECIMAL(10,2),
                    current_price DECIMAL(10,2),
                    profit_rate DECIMAL(5,2),
                    days_held INTEGER,
                    status TEXT DEFAULT 'active',
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            conn.commit()

    def create_session(self, session_id: str) -> str:
        """새로운 분석 세션을 생성합니다."""
        with self.get_connection() as conn:
            conn.execute('''
                INSERT INTO analysis_sessions (session_id, start_time)
                VALUES (?, ?)
            ''', (session_id, datetime.now()))
            conn.commit()
        return session_id

    def save_analysis_result(self, session_id: str, analysis_type: str, content: str, metadata: Dict = None):
        """분석 결과를 저장합니다."""
        with self.get_connection() as conn:
            conn.execute('''
                INSERT INTO analysis_results (session_id, analysis_type, content, metadata)
                VALUES (?, ?, ?, ?)
            ''', (session_id, analysis_type, content, json.dumps(metadata) if metadata else None))
            conn.commit()

    def save_recommended_stocks(self, session_id: str, brokerage: str, stocks: List[Dict]):
        """추천 종목을 저장합니다."""
        with self.get_connection() as conn:
            for stock in stocks:
                conn.execute('''
                    INSERT INTO recommended_stocks
                    (session_id, brokerage, stock_name, stock_code, market_type,
                     entry_price, current_price, target_price, profit_rate,
                     recommender, recommendation_reason, recommendation_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    session_id,
                    brokerage,
                    stock.get('stock_name', ''),
                    stock.get('stock_code', ''),
                    stock.get('market_type', ''),
                    stock.get('entry_price', ''),
                    stock.get('current_price', ''),
                    stock.get('target_price', ''),
                    stock.get('profit_rate', ''),
                    stock.get('recommender', ''),
                    stock.get('recommendation_reason', ''),
                    datetime.now().date()
                ))
            conn.commit()

    def save_stock_prices(self, stock_data: List[Dict]):
        """주가 데이터를 저장합니다."""
        with self.get_connection() as conn:
            for data in stock_data:
                conn.execute('''
                    INSERT OR REPLACE INTO stock_prices
                    (stock_code, date, open_price, high_price, low_price, close_price, volume, market_type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    data.get('stock_code', ''),
                    data.get('date', ''),
                    data.get('open_price'),
                    data.get('high_price'),
                    data.get('low_price'),
                    data.get('close_price'),
                    data.get('volume'),
                    data.get('market_type', '')
                ))
            conn.commit()

    def save_news_data(self, session_id: str, news_list: List[Dict]):
        """뉴스 데이터를 저장합니다."""
        with self.get_connection() as conn:
            for news in news_list:
                conn.execute('''
                    INSERT INTO news_data
                    (session_id, title, content, source, url, published_date, related_stocks, sentiment)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    session_id,
                    news.get('title', ''),
                    news.get('content', ''),
                    news.get('source', ''),
                    news.get('url', ''),
                    news.get('published_date'),
                    json.dumps(news.get('related_stocks', [])),
                    news.get('sentiment')
                ))
            conn.commit()

    def update_session_status(self, session_id: str, status: str, email_sent: bool = False):
        """세션 상태를 업데이트합니다."""
        with self.get_connection() as conn:
            conn.execute('''
                UPDATE analysis_sessions
                SET status = ?, end_time = ?, email_sent = ?, email_sent_time = ?
                WHERE session_id = ?
            ''', (
                status,
                datetime.now(),
                email_sent,
                datetime.now() if email_sent else None,
                session_id
            ))
            conn.commit()

    def get_recent_sessions(self, limit: int = 10) -> List[Dict]:
        """최근 분석 세션을 조회합니다."""
        with self.get_connection() as conn:
            cursor = conn.execute('''
                SELECT * FROM analysis_sessions
                ORDER BY start_time DESC
                LIMIT ?
            ''', (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def get_session_results(self, session_id: str) -> Dict:
        """특정 세션의 모든 결과를 조회합니다."""
        with self.get_connection() as conn:
            # 세션 정보
            session = conn.execute(
                'SELECT * FROM analysis_sessions WHERE session_id = ?',
                (session_id,)
            ).fetchone()

            if not session:
                return {}

            # 분석 결과
            analysis_results = conn.execute(
                'SELECT * FROM analysis_results WHERE session_id = ? ORDER BY created_at',
                (session_id,)
            ).fetchall()

            # 추천 종목
            recommended_stocks = conn.execute(
                'SELECT * FROM recommended_stocks WHERE session_id = ? ORDER BY created_at',
                (session_id,)
            ).fetchall()

            # 뉴스 데이터
            news_data = conn.execute(
                'SELECT * FROM news_data WHERE session_id = ? ORDER BY created_at',
                (session_id,)
            ).fetchall()

            return {
                'session': dict(session),
                'analysis_results': [dict(row) for row in analysis_results],
                'recommended_stocks': [dict(row) for row in recommended_stocks],
                'news_data': [dict(row) for row in news_data]
            }

    def get_stock_performance(self, days: int = 30) -> List[Dict]:
        """주식 성과를 조회합니다."""
        with self.get_connection() as conn:
            cursor = conn.execute('''
                SELECT
                    rs.stock_code,
                    rs.stock_name,
                    rs.brokerage,
                    rs.entry_price,
                    rs.recommendation_date,
                    sp.close_price as current_price,
                    sp.date as price_date
                FROM recommended_stocks rs
                LEFT JOIN stock_prices sp ON rs.stock_code = sp.stock_code
                WHERE rs.recommendation_date >= date('now', '-' || ? || ' days')
                AND (sp.date = (
                    SELECT MAX(date) FROM stock_prices sp2
                    WHERE sp2.stock_code = rs.stock_code
                ) OR sp.date IS NULL)
                ORDER BY rs.recommendation_date DESC
            ''', (days,))
            return [dict(row) for row in cursor.fetchall()]