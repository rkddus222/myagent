# MyAgent Frontend

React + TypeScript + Vite 기반의 AI 에이전트 프론트엔드 애플리케이션

## 기능

- JSON 변환
- LLM 테스트
- NL2SQL
- Respondent 샷
- 데이터프레임 변환
- 틱택토 게임
- 오목 게임
- **AI 뉴스** (News API 연동)

## AI 뉴스 기능

실시간 AI 관련 뉴스를 확인할 수 있는 기능입니다.

### 주요 특징
- AI, LLM, GPT 키워드별 뉴스 필터링
- 실시간 뉴스 검색
- News API 연동 (fallback 더미 데이터 제공)
- 다크모드 지원
- 반응형 디자인

### News API 설정

1. [NewsAPI.org](https://newsapi.org/)에서 API 키를 발급받습니다.

2. 프로젝트 루트에 `.env` 파일을 생성하고 API 키를 설정합니다:

```env
VITE_NEWS_API_KEY=your_actual_api_key_here
VITE_NEWS_API_BASE_URL=https://newsapi.org/v2
```

3. API 키가 설정되지 않은 경우 자동으로 더미 데이터를 사용합니다.

## 설치 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Icons**: FontAwesome
- **News API**: NewsAPI.org

## 프로젝트 구조

```
src/
├── apis/           # API 연동 함수들
├── components/     # 재사용 가능한 컴포넌트들
├── constants/      # 상수 정의
├── pages/          # 페이지 컴포넌트들
├── stores/         # 상태 관리
├── types/          # TypeScript 타입 정의
└── utils/          # 유틸리티 함수들
```
