import requests
from typing import List, Dict, Any
import json

class StockDataTool:
    def get_stock_data(self, ticker: str) -> Dict[str, Any]:
        """
        Yahoo Finance API를 직접 호출하여 주식 데이터를 조회합니다.
        라이브러리(yfinance) 없이 requests만 사용하여 경량화하였습니다.
        """
        try:
            ticker = ticker.upper().strip()
            
            # 한국 주식 코드(숫자)인 경우 .KS 또는 .KQ 추가 시도
            target_tickers = [ticker]
            if ticker.isdigit():
                target_tickers = [f"{ticker}.KS", f"{ticker}.KQ"]

            data = None
            error_msg = ""

            for t in target_tickers:
                try:
                    # Yahoo Finance API 호출
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{t}?interval=1d&range=1d"
                    response = requests.get(url, headers=headers, timeout=5)
                    
                    if response.status_code == 200:
                        json_data = response.json()
                        result = json_data.get('chart', {}).get('result')
                        
                        if result and len(result) > 0:
                            meta = result[0].get('meta', {})
                            
                            # 데이터 추출
                            currency = meta.get('currency', 'KRW')
                            current_price = meta.get('regularMarketPrice')
                            previous_close = meta.get('chartPreviousClose')
                            symbol = meta.get('symbol')
                            
                            # 시가총액 등 추가 정보는 quoteSummary API에서 가져올 수 있으나, 
                            # 최소한의 정보로 chart API만 사용하거나 필요시 추가 호출
                            # 여기서는 chart API의 meta 데이터만으로 구성
                            
                            data = {
                                "ticker": symbol,
                                "name": symbol, # API에서 이름을 바로 주지 않을 수 있음
                                "current_price": current_price,
                                "market_cap": "N/A", # chart API에는 없음, 필요시 quote API 사용 고려
                                "per": "N/A",
                                "previous_close": previous_close,
                                "currency": currency
                            }
                            break # 성공하면 루프 종료
                except Exception as req_e:
                    error_msg = str(req_e)
                    continue

            if data:
                return data
            else:
                return {"error": f"데이터 조회 실패: {ticker}, {error_msg}"}

        except Exception as e:
            return {"error": f"{ticker}에 대한 주식 데이터 조회 실패: {str(e)}"}


class NewsCollectorTool:
    def search_news(self, query: str, count: int = 5) -> List[Dict[str, str]]:
        """
        DuckDuckGo를 사용하여 검색어와 관련된 최신 뉴스를 검색합니다.
        """
        try:
            from duckduckgo_search import DDGS  # Lazy import
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
