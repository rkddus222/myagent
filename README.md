# MyAgent - AI 주식 분석 에이전트

LangGraph 기반의 자동화된 주식 분석 에이전트 시스템입니다. 뉴스 수집, 주식 데이터 분석, 추천 종목 선정, 이메일 발송까지 전 과정을 자동으로 수행합니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [시스템 요구사항](#시스템-요구사항)
- [설치 방법](#설치-방법)
- [환경 변수 설정](#환경-변수-설정)
- [실행 방법](#실행-방법)
- [API 사용 방법](#api-사용-방법)
- [에이전트 워크플로우](#에이전트-워크플로우)
- [사용 모델](#사용-모델)
- [프로젝트 구조](#프로젝트-구조)

## 프로젝트 개요

이 프로젝트는 다음과 같은 기능을 제공합니다:

- **자동 주식 분석**: 뉴스 수집, 주식 데이터 분석, 추천 종목 선정
- **LangGraph 기반 워크플로우**: 여러 단계의 분석 프로세스를 자동화
- **데이터 저장**: 분석 결과를 데이터베이스에 자동 저장
- **이메일 발송**: 분석 결과를 이메일로 자동 발송
- **RESTful API**: FastAPI 기반의 API 서버
- **웹 프론트엔드**: React 기반의 사용자 인터페이스
- **NL2SQL**: 자연어를 SQL 쿼리로 변환
- **Respondent**: SQL 쿼리 결과를 자연어로 변환

## 시스템 요구사항

- Python 3.8 이상
- Node.js 16 이상
- MongoDB (데이터 저장용, 선택사항)
- API 키:
  - OpenAI API Key (또는 Google API Key, Perplexity API Key)
  - 한국투자증권 API Key (주식 데이터 조회용)
  - News API Key (뉴스 수집용, 선택사항)

## 설치 방법

### 1. 저장소 클론

```bash
git clone <repository-url>
cd myagent
```

### 2. 백엔드 설정

```bash
cd back

# 가상환경 생성 (선택사항)
python -m venv venv

# 가상환경 활성화
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
```

### 3. 프론트엔드 설정

```bash
cd front

# 의존성 설치
npm install
```

## 환경 변수 설정

백엔드 디렉토리에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# AI 모델 API 키 (최소 하나는 필수)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key

# 한국투자증권 API 키
KOR_INVESTMENT_APP_KEY=your_kor_investment_app_key
KOR_INVESTMENT_APP_SECRET=your_kor_investment_app_secret

# 데이터베이스 설정 (선택사항)
DB_HOST=localhost
DB_PORT=27017
DB_DATABASE=myagent
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# 로그 디렉토리
LOG_DIR=logs
```

프론트엔드 디렉토리에 `.env` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# News API 설정 (선택사항)
VITE_NEWS_API_KEY=your_news_api_key
VITE_NEWS_API_BASE_URL=https://newsapi.org/v2
```

## 실행 방법

### 백엔드 서버 실행

```bash
cd back

# 기본 설정으로 실행 (포트 8081)
python main.py

# 커스텀 설정으로 실행
python main.py --host 0.0.0.0 --port 8081 --reload
```

서버가 성공적으로 시작되면 다음 메시지가 표시됩니다:
```
VPP running at 0.0.0.0:8081
```

### 프론트엔드 서버 실행

```bash
cd front

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## API 사용 방법

### 1. NL2SQL (자연어를 SQL로 변환)

**엔드포인트**: `POST /api/llm/nl2sql`

**요청 예시**:
```bash
curl -X POST http://localhost:8081/api/llm/nl2sql \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "seahss",
    "user_question": "2024년 매출이 가장 높은 상위 10개 기업은?",
    "table_name": "모든 테이블"
  }'
```

**응답 예시**:
```json
{
  "sql_query": "SELECT ..."
}
```

### 2. Respondent (SQL 결과를 자연어로 변환)

**엔드포인트**: `POST /api/llm/respondent`

**요청 예시**:
```bash
curl -X POST http://localhost:8081/api/llm/respondent \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "seahss",
    "user_question": "2024년 매출이 가장 높은 상위 10개 기업은?",
    "sql_query": "SELECT ..."
  }'
```

**응답 예시**:
```json
{
  "answer": "2024년 매출 상위 10개 기업은..."
}
```

### 3. Help (도움말 생성)

**엔드포인트**: `POST /api/llm/help`

**요청 예시**:
```bash
curl -X POST http://localhost:8081/api/llm/help \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "당신은 도움이 되는 어시스턴트입니다.",
    "user_question": "어떻게 사용하나요?"
  }'
```

### 4. Evaluate (질문 평가)

**엔드포인트**: `POST /api/llm/evaluate`

**요청 예시**:
```bash
curl -X POST http://localhost:8081/api/llm/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "두 질문을 비교 평가하세요.",
    "question1": "질문 1",
    "question2": "질문 2"
  }'
```

### 5. Financial Analysis (재무 분석)

**엔드포인트**: `POST /api/financial/analyze`

**요청 예시**:
```bash
curl -X POST http://localhost:8081/api/financial/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "target_companies": ["삼성전자", "SK하이닉스"],
    "company_id": "default"
  }'
```

### 주식 분석 에이전트 실행

주식 분석 에이전트는 `StockService`를 통해 실행할 수 있습니다. 현재는 API 엔드포인트가 직접 노출되어 있지 않으며, 백엔드 코드에서 직접 호출하거나 API를 추가해야 합니다.

```python
from service.stock_service import stock_service

result = stock_service.analyze_stocks()
```

## 에이전트 워크플로우

에이전트는 다음 순서로 작업을 수행합니다:

```
START
  ↓
collector (데이터 수집)
  ↓
analyzer (초기 분석)
  ↓
news_scraper (뉴스 수집)
  ↓
stock_scraper (주식 데이터 수집)
  ↓
final_analyzer (최종 분석)
  ↓
proposer (추천 종목 선정)
  ↓
email_sender (이메일 발송)
  ↓
END
```

### 각 노드 설명

1. **collector**: Perplexity Sonar를 사용하여 거시 경제 데이터와 최신 뉴스를 수집합니다.
   - 주요 시장 지수 (코스피, 코스닥, 다우존스, S&P 500, 나스닥)
   - 환율 정보
   - 금리 정보
   - 최신 경제 뉴스

2. **analyzer**: 수집된 데이터를 분석하여 시장 전망을 도출합니다 (긍정/중립/부정).
   - GPT-4o-mini 모델 사용
   - 거시 경제 지표 분석
   - 뉴스 영향 분석

3. **news_scraper**: 관련 뉴스를 웹에서 수집합니다.

4. **stock_scraper**: 주식 시장 데이터를 수집합니다.

5. **final_analyzer**: 모든 데이터를 종합하여 최종 분석을 수행합니다.
   - GPT-4o-mini 모델 사용
   - 뉴스 데이터, 주식 데이터, 초기 분석 결과를 종합

6. **proposer**: 분석 결과를 바탕으로 추천 종목을 선정합니다.
   - 국내 증권사 리포트 수집
   - 해외 증권사 리포트 수집

7. **email_sender**: 분석 결과를 이메일로 발송합니다.

각 노드의 실행 결과는 자동으로 데이터베이스에 저장됩니다 (`EnhancedLangGraphManager` 사용 시).

## 사용 모델

이 프로젝트에서 사용하는 AI 모델:

- **GPT-4o-mini**: 기본 LLM 모델 (analyzer, final_analyzer, nl2sql, respondent 등)
- **Perplexity Sonar Pro**: 데이터 수집용 (collector 노드)
- **Perplexity Llama 3.1 Sonar Large**: 대규모 데이터 처리용 (선택사항)
- **Google Gemini Pro**: 대체 모델 (선택사항)

모델은 `back/nodes/models.py`와 `back/utils/chatgpt.py`에서 설정됩니다.

### 모델별 사용 용도

- **GPT-4o-mini**: 분석, SQL 생성, 자연어 변환 등 일반적인 LLM 작업
- **Perplexity Sonar**: 실시간 웹 검색이 필요한 데이터 수집 작업
- **Gemini Pro**: 대체 모델로 사용 가능

## 프로젝트 구조

```
myagent/
├── back/                    # 백엔드 (Python/FastAPI)
│   ├── api/                 # API 라우터
│   │   ├── llm_api.py      # LLM 관련 API (nl2sql, respondent, help, evaluate)
│   │   └── financial_api.py # 재무 분석 API
│   ├── core/                # 핵심 설정
│   │   └── config.py       # Pydantic 설정 관리
│   ├── nodes/               # LangGraph 노드
│   │   ├── collector.py    # 데이터 수집 노드 (Perplexity 사용)
│   │   ├── analyzer.py     # 분석 노드 (GPT-4o-mini 사용)
│   │   ├── news_scraper.py # 뉴스 수집 노드
│   │   ├── stock_scraper.py # 주식 데이터 수집 노드
│   │   ├── proposer.py     # 추천 노드
│   │   ├── email_sender.py # 이메일 발송 노드
│   │   ├── models.py       # LLM 모델 정의
│   │   ├── types.py        # State 타입 정의
│   │   ├── graph.py        # 기본 그래프
│   │   └── enhanced_graph.py # 데이터 저장 기능이 통합된 그래프
│   ├── service/             # 비즈니스 로직
│   │   ├── stock_service.py # 주식 분석 서비스
│   │   ├── llm_service.py  # LLM 서비스 (nl2sql, respondent, help, evaluate)
│   │   ├── financial_service.py # 재무 분석 서비스
│   │   ├── data_storage_service.py # 데이터 저장 서비스
│   │   ├── news_scrapers/  # 뉴스 스크래퍼
│   │   ├── stock_scrapers/ # 주식 스크래퍼
│   │   └── propose_scrapers/ # 추천 리포트 스크래퍼
│   ├── prompts/             # 프롬프트 템플릿
│   │   ├── collector_prompt.py
│   │   ├── analyzer_prompt.py
│   │   ├── final_analyzer_prompt.py
│   │   └── proposer_prompt.py
│   ├── model/               # Pydantic 모델
│   │   └── llm_model.py    # API 요청/응답 모델
│   ├── utils/               # 유틸리티 함수
│   │   ├── chatgpt.py      # GPT 모델 설정
│   │   ├── config.py       # 환경 변수 설정
│   │   ├── logger.py       # 로깅 설정
│   │   └── prompt/         # 회사별 프롬프트 파일
│   ├── main.py              # FastAPI 애플리케이션 진입점
│   └── requirements.txt     # Python 의존성
│
└── front/                   # 프론트엔드 (React/TypeScript)
    ├── src/
    │   ├── apis/            # API 클라이언트
    │   ├── components/      # React 컴포넌트
    │   ├── pages/           # 페이지 컴포넌트
    │   └── stores/          # 상태 관리
    ├── package.json         # Node.js 의존성
    └── README.md            # 프론트엔드 README
```

## 문제 해결

### 백엔드 서버가 시작되지 않는 경우

1. Python 버전 확인: `python --version` (3.8 이상 필요)
2. 의존성 설치 확인: `pip install -r requirements.txt`
3. 환경 변수 확인: `.env` 파일이 올바르게 설정되었는지 확인
   - 최소한 `OPENAI_API_KEY` 또는 `PERPLEXITY_API_KEY` 중 하나는 필수
4. 포트 충돌 확인: 다른 프로세스가 8081 포트를 사용 중인지 확인

### API 호출이 실패하는 경우

1. 백엔드 서버가 실행 중인지 확인
2. CORS 설정 확인: `back/utils/config.py`의 `ALLOWED_ORIGINS` 확인
3. API 키가 올바르게 설정되었는지 확인
   - OpenAI API: `OPENAI_API_KEY`
   - Perplexity API: `PERPLEXITY_API_KEY`
   - Google API: `GOOGLE_API_KEY` (선택사항)
4. 로그 파일 확인: `logs/agent.log`

### 모델 호출 실패 시

- API 키가 없으면 일부 노드는 모의 응답을 반환합니다
- `analyzer`와 `final_analyzer`는 API 키가 없으면 경고 메시지와 함께 건너뜁니다
- `collector`는 Perplexity API 키가 필요합니다

## 라이선스

[라이선스 정보를 여기에 추가하세요]

## 기여

[기여 가이드라인을 여기에 추가하세요]


