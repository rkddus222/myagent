import requests
from bs4 import BeautifulSoup

def test():
    stock_code = "005930"
    url = f"https://finance.naver.com/item/news_news.naver?code={stock_code}&page=&clusterId="
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': f'https://finance.naver.com/item/news.naver?code={stock_code}'
    }
    
    try:
        print(f"Requesting URL: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        response.encoding = 'euc-kr'
        soup = BeautifulSoup(response.text, 'html.parser')
        news_links = soup.select('td.title a.tit')
        print(f"Found {len(news_links)} links")
        for link in news_links[:3]:
            print(f"Title: {link.get_text(strip=True)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
