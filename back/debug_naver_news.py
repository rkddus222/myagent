import requests
from bs4 import BeautifulSoup

# 네이버 금융 뉴스 페이지 구조 확인
url = "https://finance.naver.com/item/news_news.naver?code=005930&page=1"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

print("=== 페이지 구조 분석 ===\n")
print(f"Status Code: {response.status_code}")
print(f"Page Title: {soup.title.string if soup.title else 'No title'}\n")

# 다양한 선택자 시도
selectors = [
    'table.type5',
    'table.type5 tr',
    'table.type5 a',
    'table.type5 a.tit',
    'a.tit',
    'td.title a',
    'div.newsWrap',
    'div.news_list',
]

for selector in selectors:
    elements = soup.select(selector)
    print(f"{selector}: {len(elements)}개 발견")
    if elements and len(elements) > 0:
        print(f"  첫 번째 요소: {str(elements[0])[:200]}")
        print()

# 모든 링크 확인
all_links = soup.find_all('a')
print(f"\n전체 링크 수: {len(all_links)}")
print("뉴스 관련 링크 샘플:")
for link in all_links[:10]:
    text = link.get_text(strip=True)
    href = link.get('href', '')
    if text and len(text) > 10:
        print(f"  - {text[:50]}: {href[:50]}")
