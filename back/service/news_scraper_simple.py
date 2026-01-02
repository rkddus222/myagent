import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import urllib.parse

def scrape_naver_news_simple(stock_code: str, keyword: str = "", max_count: int = 3) -> List[Dict]:
    """
    네이버 금융 뉴스를 iframe URL로 직접 수집합니다.
    """
    # URL 인코딩 (한글 종목명이 들어올 경우 대비)
    safe_stock_code = urllib.parse.quote(str(stock_code))
    
    # 만약 코드가 숫자가 아니면 (즉, 이름이 그대로 넘어온 경우) 검색 품질이 낮을 수 있음을 알림
    if not str(stock_code).isdigit():
        print(f"경고: 유효하지 않은 종목 코드 '{stock_code}'로 뉴스 수집을 시도합니다. 종목명 매핑을 확인하세요.")
        
    # iframe URL 사용 (실제 뉴스 데이터가 있는 곳)
    url = f"https://finance.naver.com/item/news_news.naver?code={safe_stock_code}&page=&clusterId="

    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': f'https://finance.naver.com/item/news.naver?code={safe_stock_code}'
    }
    
    try:
        print(f"네이버 뉴스 요청: {url}")
        # headers에서 non-ascii 문자 제거 (safe check)
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # 인코딩 명시적으로 설정
        response.encoding = 'euc-kr' 
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        articles = []
        all_articles = []
        
        # td.title 내의 a.tit 선택
        news_links = soup.select('td.title a.tit')
        print(f"네이버 뉴스 링크 {len(news_links)}개 발견")
        
        for link in news_links:
            try:
                title = link.get_text(strip=True)
                href = link.get('href', '')
                
                if not title or len(title) < 5:
                    continue
                
                # 링크 정규화
                if href and not href.startswith('http'):
                    href = "https://finance.naver.com" + href

                article = {
                    'title': title,
                    'content': title,
                    'link': href,
                    'source': '네이버 금융'
                }
                
                all_articles.append(article)
                
                # 키워드 필터링
                if not keyword or keyword in title:
                    articles.append(article)
                
                if len(articles) >= max_count:
                    break
                    
            except Exception as e:
                print(f"뉴스 항목 파싱 오류: {e}")
                continue
        
        # 키워드 필터링 결과가 없으면 전체 뉴스 중 일부 반환
        final_articles = articles if articles else all_articles[:max_count * 2]
        
        print(f"네이버 뉴스 {len(final_articles)}개 수집 완료 (키워드 매칭: {len(articles)}개)")
        return final_articles[:max_count]

        
    except Exception as e:
        print(f"네이버 뉴스 수집 중 오류: {e}")
        return []


def scrape_yahoo_news_simple(stock_code: str, keyword: str = "", max_count: int = 3) -> List[Dict]:
    """
    Yahoo Finance 뉴스를 수집합니다.
    """
    url = f"https://finance.yahoo.com/quote/{stock_code}/news"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        articles = []
        all_articles = []
        
        # Yahoo Finance 뉴스 아이템 찾기
        news_items = soup.select('h3') or soup.select('a[data-test-locator="stream-item-title"]')
        print(f"Yahoo 뉴스 항목 {len(news_items)}개 발견")
        
        for item in news_items:
            try:
                if item.name == 'h3':
                    title = item.get_text(strip=True)
                    link_elem = item.find_parent('a')
                    link = link_elem.get('href', '') if link_elem else ''
                else:
                    title = item.get_text(strip=True)
                    link = item.get('href', '')
                
                if not title or len(title) < 10:
                    continue
                
                # 링크 정규화
                if link and not link.startswith('http'):
                    link = f"https://finance.yahoo.com{link}"
                
                article = {
                    'title': title,
                    'content': title,
                    'link': link,
                    'source': 'Yahoo Finance'
                }
                
                all_articles.append(article)
                
                # 키워드 필터링
                if not keyword or keyword.lower() in title.lower():
                    articles.append(article)
                
                if len(articles) >= max_count:
                    break
                    
            except Exception as e:
                continue
        
        # 키워드 필터링 결과가 없으면 전체 뉴스 중 일부 반환
        final_articles = articles if articles else all_articles[:max_count * 2]
        
        print(f"Yahoo 뉴스 {len(final_articles)}개 수집 완료 (키워드 매칭: {len(articles)}개)")
        return final_articles[:max_count]

        
    except Exception as e:
        print(f"Yahoo 뉴스 수집 중 오류: {e}")
        return []
