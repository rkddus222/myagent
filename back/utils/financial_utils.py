import yfinance as yf
from duckduckgo_search import DDGS
from typing import List, Dict, Any
import json

class StockDataTool:
    def get_stock_data(self, ticker: str) -> Dict[str, Any]:
        """
        yfinance를 사용하여 주어진 티커 또는 주식명에 대한 실시간 주식 데이터를 조회합니다.
        """
        try:
            # 티커가 이름인 경우 조회가 필요할 수 있으나, 지금은 유효한 티커나 그와 유사한 값으로 가정합니다.
            # 실제 시나리오에서는 검색 단계가 필요할 수 있습니다. 프롬프트에는 "검색하여 티커 찾기"라고 되어 있습니다.
            # 여기서는 입력이 티커일 가능성이 높거나 알려진 심볼이라고 가정합니다.
            # 티커 정리
            ticker = ticker.upper().strip()
            
            # 한국 주식 코드(숫자)인 것 같으면 .KS를 붙입니다.
            if ticker.isdigit():
                # 테스트 용으로 삼성전자(005930)를 기본값으로 할 수 있지만, 로직은 일반적이어야 합니다.
                # .KS(코스피) 또는 .KQ(코스닥) 추가를 시도합니다.
                # yfinance는 보통 한국 주식에 접미사가 필요합니다.
                # 전략: .KS를 먼저 시도하고, 실패하면 .KQ를 시도합니다.
                # 지금은 숫자인 경우 .KS를 기본으로 시도합니다.
                ticker_ks = f"{ticker}.KS"
                stock = yf.Ticker(ticker_ks)
                info = stock.info
                # 데이터가 없으면 .KQ 시도
                if not info or 'regularMarketPrice' not in info:
                     ticker_kq = f"{ticker}.KQ"
                     stock = yf.Ticker(ticker_kq)
                     info = stock.info
            else:
                stock = yf.Ticker(ticker)
                info = stock.info

            # 관련 데이터 추출
            # yfinance info 키는 자주 변경되므로 fallback을 사용합니다.
            data = {
                "ticker": ticker,
                "name": info.get('shortName', 'N/A'),
                "current_price": info.get('currentPrice', info.get('regularMarketPrice', 'N/A')),
                "market_cap": info.get('marketCap', 'N/A'),
                "per": info.get('trailingPE', 'N/A'),
                "previous_close": info.get('previousClose', 'N/A'),
                "currency": info.get('currency', 'KRW')
            }
            return data
        except Exception as e:
            return {"error": f"{ticker}에 대한 주식 데이터 조회 실패: {str(e)}"}

class NewsCollectorTool:
    def search_news(self, query: str, count: int = 5) -> List[Dict[str, str]]:
        """
        DuckDuckGo를 사용하여 검색어와 관련된 최신 뉴스를 검색합니다.
        """
        try:
            results = []
            with DDGS() as ddgs:
                # keywords 인자는 'keywords'입니다. max_results는 예전에 사용 가능했나요?
                # DDGS 구문: ddgs.news(keywords, region="wt-wt", safesearch="moderate", timelimit="m", max_results=10)
                news_gen = ddgs.news(keywords=query, region="kr-kr", safesearch="off", timelimit="w", max_results=count)
                for r in news_gen:
                    results.append({
                        "title": r.get('title', ''),
                        "link": r.get('url', ''),
                        "source": r.get('source', ''),
                        "date": r.get('date', ''),
                        "body": r.get('body', '')
                    })
            return results
        except Exception as e:
            return [{"error": f"뉴스 조회 실패: {str(e)}"}]

class AnalysisReportTool:
    def format_for_llm(self, stock_data: Dict, news_data: List[Dict]) -> str:
        """
        수집된 데이터를 LLM을 위한 컨텍스트 문자열로 포맷팅합니다.
        """
        stock_str = json.dumps(stock_data, ensure_ascii=False, indent=2)
        news_str = ""
        for i, news in enumerate(news_data):
            news_str += f"{i+1}. [{news.get('date', 'Unknown')}] {news.get('title')}: {news.get('body')}\n"
        
        return f"""
        [Stock Data]
        {stock_str}
        
        [Recent News]
        {news_str}
        """
