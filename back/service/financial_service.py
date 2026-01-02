import json
import re
from typing import Dict, Any, List
from langchain_core.messages import SystemMessage
from utils.chatgpt import gpt_4o_mini as llm
from service.api_scraper import get_stock_current_price, is_domestic_stock
from service.get_stock import load_stock_list
from service.news_scraper_simple import scrape_naver_news_simple, scrape_yahoo_news_simple
from utils.logger import setup_logger
from prompts.tool_calling_prompt import tool_calling_prompt

logger = setup_logger('financial_service')

def parse_tool_calls(response_content: str) -> List[Dict[str, Any]]:
    """
    LLM 응답에서 툴 호출 정보를 파싱합니다.
    1. 전체가 JSON 객체이고 'tool_call' 키가 있는 경우
    2. <tool_call> 태그 내부에 JSON이 있는 경우
    """
    try:
        # Markdown 코드 블록 제거
        cleaned_content = response_content.strip()
        if cleaned_content.startswith("```"):
            # 첫 줄(예: ```json)과 마지막 줄(```) 제거
            lines = cleaned_content.splitlines()
            if len(lines) >= 2:
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].strip() == "```":
                    lines = lines[:-1]
                cleaned_content = "\n".join(lines).strip()

        # Case 1: 전체 응답이 JSON 포맷인 경우 (LLM이 포맷을 잘 지킨 경우)
        try:
            data = json.loads(cleaned_content)
            if isinstance(data, dict) and "tool_call" in data:
                tool_calls = data["tool_call"]
                if isinstance(tool_calls, list):
                    return tool_calls
                elif isinstance(tool_calls, dict):
                    return [tool_calls]
        except json.JSONDecodeError:
            pass # JSON 파싱 실패 시 XML 태그 검색 시도

        # Case 2: <tool_call> 태그로 감싸진 경우
        match = re.search(r"<tool_call>\s*(.*?)\s*</tool_call>", response_content, re.DOTALL)
        if match:
            json_str = match.group(1).strip()
            # 툴 리스트인 경우
            if json_str.startswith("["):
                return json.loads(json_str)
            # 단일 툴 객체인 경우
            else:
                return [json.loads(json_str)]
        
        return []
    except Exception as e:
        logger.error(f"툴 호출 파싱 실패: {e}")
        return []

def get_stock_code(stock_name: str) -> str:
    """종목명으로 종목 코드를 찾습니다."""
    if not stock_name:
        return ""
        
    domestic_stocks, worldwide_stocks = load_stock_list()
    
    target = stock_name.strip().upper()
    
    # 1. 국내 주식 검색 (이름 -> 코드)
    for code, name in domestic_stocks.items():
        if name.upper() == target or code == target:
            return code
            
    # 2. 해외 주식 검색 (이름 -> 코드)
    for code, name in worldwide_stocks.items():
        if name.upper() == target or code == target:
            return code
            
    # 매핑 테이블에 없는 경우, 입력값 자체가 코드일 가능성 반환
    return target

def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    logger.info(f"툴 실행: {tool_name}, 인자: {arguments}")
    
    if tool_name == "getStockInfo":
        # 인자 매핑
        ticker = arguments.get('ticker') or arguments.get('stock_name')
        if not ticker:
             return {"error": "ticker 또는 stock_name이 누락되었습니다."}
        
        # 종목 코드로 변환 시도
        real_ticker = get_stock_code(ticker)
        logger.info(f"종목 조회: {ticker} -> {real_ticker}")

        try:
            # api_scraper를 통해 데이터 조회 (한글 키 반환)
            raw_data = get_stock_current_price(real_ticker)
            
            if not raw_data:
                return {"error": f"데이터를 찾을 수 없습니다: {ticker}"}

            # 프롬프트 포맷에 맞게 변환
            # Response: {{ "ticker": ..., "name": ..., "current_price": ..., "change_rate": ..., "market_cap": ..., "per": ..., "previous_close": ..., "currency": ... }}
            
            formatted_data = {
                "ticker": real_ticker,
                "name": ticker, # 정확한 이름은 api_scraper에서 안옴, 요청한 이름 사용 또는 별도 매핑 필요하지만 일단 ticker
                "current_price": raw_data.get("현재가"),
                "change_rate": raw_data.get("등락률"),
                "market_cap": raw_data.get("시가총액"),
                "per": raw_data.get("PER"),
                "previous_close": raw_data.get("이전종가", raw_data.get("250일최고가")), # 이전종가가 없을 경우 대체하거나 생략. 국내주식엔 이전종가 키가 없음.
                "currency": raw_data.get("통화", "KRW") # 국내주식은 KRW 가정
            }
            
            # 국내 주식의 경우 이전 종가가 명시적이지 않으면 계산 역산하거나 생략
            if "이전종가" not in raw_data and formatted_data["current_price"] is not None and formatted_data["change_rate"] is not None:
                # 역산: 현재가 / (1 + 등락률/100)
                try:
                    price = float(formatted_data["current_price"])
                    rate = float(formatted_data["change_rate"])
                    prev_close = price / (1 + rate/100)
                    formatted_data["previous_close"] = int(prev_close)
                except:
                    pass

            return formatted_data

        except Exception as e:
            logger.error(f"주식 정보 조회 실패: {e}")
            return {"error": f"조회 중 오류 발생: {str(e)}"}

    elif tool_name == "getEconomicNews":
        ticker_arg = arguments.get('ticker')
        keyword = arguments.get('keyword', "")
        query = arguments.get('query', "") # 하위 호환성
        count = arguments.get('count', 3)
        
        # ticker_arg가 없으면 query에서 추출 시도
        if not ticker_arg and query:
             ticker_arg = query.split()[0]
             if not keyword:
                 keyword = " ".join(query.split()[1:])
                 
        logger.info(f"뉴스 검색 - 티커/종목: {ticker_arg}, 키워드: {keyword}")
        
        # 종목 코드로 변환 시도
        stock_code = get_stock_code(ticker_arg)
        
        try:
            # 국내/해외 주식 구분
            if is_domestic_stock(stock_code):
                logger.info(f"{stock_code}는 국내 주식으로 판단되어 Naver 스크래퍼를 사용합니다.")
                # Naver 스크래퍼 사용 (requests 기반 - Selenium 없음)
                news_data = scrape_naver_news_simple(
                    stock_code=stock_code,
                    keyword=keyword,
                    max_count=count
                )
                # 포맷 변환
                results = []
                for item in news_data:
                    results.append({
                        "title": item.get("title", ""),
                        "summary": item.get("content", ""),
                        "source": "Naver"
                    })
            else:
                logger.info(f"{stock_code}는 해외 주식으로 판단되어 Yahoo 스크래퍼를 사용합니다.")
                # Yahoo 스크래퍼 사용 (requests 기반)
                news_data = scrape_yahoo_news_simple(
                    stock_code=stock_code,
                    keyword=keyword,
                    max_count=count
                )
                # 포맷 변환
                results = []
                for item in news_data:
                    results.append({
                        "title": item.get("title", ""),
                        "summary": item.get("content", ""),
                        "source": item.get("source", "Yahoo Finance")
                    })
            
            logger.info(f"뉴스 {len(results)}개 수집 완료")
            return {"news_list": results}
            
        except Exception as e:
            logger.error(f"뉴스 수집 중 오류 발생: {e}")
            # 오류 발생 시 빈 리스트 반환 (분석은 계속 진행)
            return {"news_list": []}

    elif tool_name == "generateAnalysisReport":
        # 이 단계에서는 데이터를 반환만 하고, 실제 리포트 생성은 메인 에이전트 루프에서 처리합니다.
        # 툴 내에서 별도의 LLM 프롬프트를 호출하지 않습니다.
        return arguments
    
    else:
        return {"error": f"알 수 없는 툴: {tool_name}"}

def analyze_financial_query(target_companies: List[Any]) -> str:
    """
    target_companies: ['삼성전자', '005930'] 또는 [{'name': '삼성전자', 'code': '005930'}] 형태 가능
    """
    # 전처리: 종목 리스트 정리 및 매핑 정보 추출
    processed_targets = []
    known_mappings = {}
    
    for item in target_companies:
        if isinstance(item, dict):
            name = item.get('name', '')
            code = item.get('code', '')
            if name and code:
                processed_targets.append(f"{name}({code})")
                known_mappings[name] = code
                known_mappings[code] = code
            elif name:
                processed_targets.append(name)
            elif code:
                processed_targets.append(code)
        else:
            processed_targets.append(str(item))
            
    logger.info(f"에이전트 루프 시작: {processed_targets}")
    targets_str = ", ".join(processed_targets)
    tool_history = ""
    max_steps = 5
    
    for step in range(max_steps):
        # 1. 프롬프트 생성 (리스트 대신 포맷팅된 문자열 전달)
        prompt = tool_calling_prompt(targets_str, tool_history)
        
        # 2. LLM 호출
        chain = prompt | llm
        response = chain.invoke({})
        content = response.content
        logger.info(f"단계 {step+1} LLM 응답: {content}")
        
        # 3. 툴 호출 파싱
        tool_calls = parse_tool_calls(content)
        
        if not tool_calls:
            logger.info("툴 호출을 찾을 수 없습니다. 루프를 종료합니다.")
            break
            
        # 4. 툴 실행
        step_results = []
        final_report_args = None
        
        for call in tool_calls:
            tool_name = call.get("tool")
            arguments = call.get("arguments")
            
            if tool_name == "generateAnalysisReport":
                # 리포트 생성 요청이 오면 툴을 실행(인자 반환)하고 루프 종료 준비
                final_report_args = execute_tool(tool_name, arguments)
                break 
            
            # 다른 툴 실행
            try:
                result = execute_tool(tool_name, arguments)
                step_results.append({
                    "tool": tool_name,
                    "arguments": arguments,
                    "response": result
                })
            except Exception as e:
                step_results.append({
                    "tool": tool_name,
                    "error": str(e)
                })
        
        # 리포트 생성 단계인 경우 메인 LLM을 통해 최종 응답 생성
        if final_report_args:
            stock_info = final_report_args.get("stock_info", {})
            news_data = final_report_args.get("news_data", [])
            user_intent = final_report_args.get("user_intent", "")
            
            writer_prompt = f"""
            당신은 전문 금융 분석가입니다. 다음 데이터를 바탕으로 사용자의 의도("{user_intent}")에 맞는 심층 분석 리포트를 작성해주세요.
            
            [주식 정보]
            {json.dumps(stock_info, ensure_ascii=False, indent=2)}
            
            [뉴스 데이터]
            {json.dumps(news_data, ensure_ascii=False, indent=2)}
            
            리포트는 전문적이고 객관적인 어조로 작성하며, 명확한 근거를 제시해야 합니다.
            반드시 한국어로 작성하세요.
            """
            
            logger.info("최종 리포트 생성 중...")
            final_response = llm.invoke([SystemMessage(content=writer_prompt)])
            return final_response.content

        # 5. 히스토리 업데이트
        formatted_results = json.dumps(step_results, ensure_ascii=False)
        tool_history += f"\n<previous_step>\n<tool_calls>{json.dumps(tool_calls, ensure_ascii=False)}</tool_calls>\n<tool_results>{formatted_results}</tool_results>\n</previous_step>\n"

    return "분석을 완료하지 못했습니다 (최대 단계 초과)."
