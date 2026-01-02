import requests
from bs4 import BeautifulSoup

url = "https://finance.naver.com/item/news.naver?code=005930"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

print(f"Status: {response.status_code}")
print(f"Title: {soup.title.string if soup.title else 'No title'}\n")

# 다양한 선택자 시도
selectors = [
    'td.title a.tit',
    'a.tit',
    'td.title',
    'tr.first',
]

for selector in selectors:
    elements = soup.select(selector)
    print(f"{selector}: {len(elements)}개 발견")
    if elements:
        print(f"  첫 번째: {str(elements[0])[:200]}")
        print()
