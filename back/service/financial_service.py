import json
import re
from typing import Dict, Any, List
from langchain_core.messages import SystemMessage
from utils.chatgpt import gpt_4o_mini as llm
from utils.financial_utils import StockDataTool, NewsCollectorTool
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

def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    logger.info(f"툴 실행: {tool_name}, 인자: {arguments}")
    
    if tool_name == "getStockInfo":
        # 인자 매핑
        # 사용자 프롬프트는 'stock_name' 또는 'ticker'를 요청하지만, 툴은 'ticker'를 사용함.
        # ticker가 제공되면 사용하고, 아니면 stock_name 사용.
        ticker = arguments.get('ticker') or arguments.get('stock_name')
        if not ticker:
             return {"error": "ticker 또는 stock_name이 누락되었습니다."}
        
        tool = StockDataTool()
        data = tool.get_stock_data(ticker)
        return data

    elif tool_name == "getEconomicNews":
        query = arguments.get('query')
        count = arguments.get('count', 3)
        tool = NewsCollectorTool()
        data = tool.search_news(query, count)
        
        # 프롬프트 기대 포맷: title, summary, source
        # 툴 반환 포맷: title, link, source, date, body
        # 일관성을 위해 'body'를 'summary'로 매핑
        results = []
        for item in data:
            results.append({
                "title": item.get("title"),
                "summary": item.get("body"), # body를 요약으로 사용
                "source": item.get("source")
            })
        return {"news_list": results}

    elif tool_name == "generateAnalysisReport":
        # 이 단계에서는 데이터를 반환만 하고, 실제 리포트 생성은 메인 에이전트 루프에서 처리합니다.
        # 툴 내에서 별도의 LLM 프롬프트를 호출하지 않습니다.
        return arguments
    
    else:
        return {"error": f"알 수 없는 툴: {tool_name}"}

def analyze_financial_query(target_companies: List[str]) -> str:
    logger.info(f"에이전트 루프 시작: {target_companies}")
    tool_history = ""
    max_steps = 5
    
    for step in range(max_steps):
        # 1. 프롬프트 생성
        prompt = tool_calling_prompt(target_companies, tool_history)
        
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
