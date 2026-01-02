import requests
from bs4 import BeautifulSoup

# 네이버 금융 뉴스 페이지 확인
url = "https://finance.naver.com/item/news.naver?code=005930"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

print("=== 페이지 분석 ===\n")
print(f"Status: {response.status_code}\n")

# iframe 찾기
iframes = soup.find_all('iframe')
print(f"Iframe 개수: {len(iframes)}")
for i, iframe in enumerate(iframes):
    src = iframe.get('src', '')
    print(f"  Iframe {i+1}: {src[:100]}")

print("\n=== 뉴스 관련 요소 ===")
# 다양한 선택자 시도
selectors = [
    'tbody',
    'td.title',
    'td.title a.tit',
    'a.tit',
]

for selector in selectors:
    elements = soup.select(selector)
    print(f"{selector}: {len(elements)}개")
    if elements and len(elements) > 0:
        print(f"  첫 번째: {str(elements[0])[:150]}")
