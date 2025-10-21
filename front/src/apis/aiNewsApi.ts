import axios from 'axios'

export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  imageUrl?: string
}

export interface NewsResponse {
  articles: NewsItem[]
  totalResults: number
  status: string
}

// RSS 피드 소스 설정
const RSS_FEEDS = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    source: 'TechCrunch'
  },
  {
    name: 'MIT Technology Review AI',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/',
    source: 'MIT Tech Review'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    source: 'The Verge'
  },
  {
    name: 'AI News',
    url: 'https://www.artificialintelligence-news.com/feed/',
    source: 'AI News'
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    source: 'VentureBeat'
  }
]

// RSS 피드 파싱을 위한 인터페이스
interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
}

// RSS를 JSON으로 변환하는 서비스 (무료)
const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json'

// AI 관련 키워드 배열
const AI_KEYWORDS = ['AI', 'artificial intelligence', 'LLM', 'GPT', 'ChatGPT', 'OpenAI', 'machine learning', 'deep learning']

// Fallback 더미 데이터
const getDummyNews = (): NewsItem[] => [
  {
    id: '1',
    title: 'OpenAI GPT-4의 새로운 업데이트',
    description: 'GPT-4가 더욱 향상된 추론 능력과 함께 업데이트되었습니다. 새로운 기능들이 추가되어 더욱 정확하고 유용한 답변을 제공합니다.',
    url: 'https://openai.com/blog/gpt-4-update',
    publishedAt: new Date().toISOString(),
    source: 'OpenAI Blog',
    imageUrl: 'https://via.placeholder.com/400x200?text=GPT-4+Update'
  },
  {
    id: '2',
    title: '구글, 새로운 AI 모델 Gemini 발표',
    description: '구글이 Gemini라는 새로운 멀티모달 AI 모델을 발표했습니다. 텍스트, 이미지, 오디오를 모두 처리할 수 있는 강력한 모델입니다.',
    url: 'https://deepmind.google/technologies/gemini/',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: 'Google DeepMind',
    imageUrl: 'https://via.placeholder.com/400x200?text=Google+Gemini'
  },
  {
    id: '3',
    title: 'AI 윤리에 대한 새로운 가이드라인',
    description: 'AI 개발과 사용에 대한 새로운 윤리 가이드라인이 제시되었습니다. 책임감 있는 AI 개발을 위한 중요한 이정표가 될 것으로 예상됩니다.',
    url: 'https://ai-ethics.org/guidelines',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'AI Ethics Today',
    imageUrl: 'https://via.placeholder.com/400x200?text=AI+Ethics'
  },
  {
    id: '4',
    title: 'Microsoft Copilot의 새로운 기능들',
    description: 'Microsoft가 Copilot에 새로운 기능들을 추가했습니다. 더욱 향상된 코드 생성과 문서 작성 능력을 제공합니다.',
    url: 'https://github.com/features/copilot',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'Microsoft',
    imageUrl: 'https://via.placeholder.com/400x200?text=MS+Copilot'
  },
  {
    id: '5',
    title: 'AI 안전성 연구의 최신 동향',
    description: 'AI 안전성 연구 분야의 최신 동향과 발전사항들을 살펴봅니다. 더 안전하고 신뢰할 수 있는 AI 시스템 구축을 위한 노력들이 계속되고 있습니다.',
    url: 'https://ai-safety-research.com/trends',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    source: 'AI Safety Research',
    imageUrl: 'https://via.placeholder.com/400x200?text=AI+Safety'
  }
]

// RSS 피드에서 뉴스를 가져오는 함수
const fetchFromRSSFeed = async (feedUrl: string, source: string): Promise<NewsItem[]> => {
  try {
    const response = await axios.get(RSS_TO_JSON_API, {
      params: {
        rss_url: feedUrl,
        api_key: 'public', // 무료 사용
        count: 10
      }
    })

    if (response.data.status === 'ok' && response.data.items) {
      return response.data.items.map((item: any, index: number): NewsItem => ({
        id: `${source}-${Date.now()}-${index}`,
        title: item.title || '제목 없음',
        description: item.description?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || '설명이 없습니다.',
        url: item.link || '#',
        publishedAt: item.pubDate || new Date().toISOString(),
        source: source,
        imageUrl: item.thumbnail || item.enclosure?.link || undefined
      }))
    }
    return []
  } catch (error) {
    console.error(`${source} RSS 피드를 가져오는 중 오류:`, error)
    return []
  }
}

// 모든 RSS 피드에서 AI 뉴스를 가져오는 함수
export const fetchAiNews = async (): Promise<NewsItem[]> => {
  try {
    // 여러 RSS 피드에서 병렬로 뉴스 가져오기
    const feedPromises = RSS_FEEDS.map(feed =>
      fetchFromRSSFeed(feed.url, feed.source)
    )

    const results = await Promise.allSettled(feedPromises)

    // 성공한 결과들만 합치기
    const allNews: NewsItem[] = []
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        allNews.push(...result.value)
      }
    })

    // 날짜순 정렬 (최신순)
    allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    // 최대 15개 반환
    const limitedNews = allNews.slice(0, 15)

    // 뉴스가 없으면 더미 데이터 반환
    return limitedNews.length > 0 ? limitedNews : getDummyNews()

  } catch (error) {
    console.error('RSS 피드에서 AI 뉴스를 가져오는 중 오류 발생:', error)
    return getDummyNews()
  }
}

// 특정 키워드로 AI 뉴스를 필터링하는 함수
export const fetchAiNewsByKeyword = async (keyword: 'AI' | 'LLM' | 'GPT'): Promise<NewsItem[]> => {
  try {
    // 먼저 모든 뉴스를 가져온 다음 키워드로 필터링
    const allNews = await fetchAiNews()

    const keywordLower = keyword.toLowerCase()
    const keywordMap: { [key: string]: string[] } = {
      'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml'],
      'llm': ['llm', 'large language model', 'language model', 'transformer'],
      'gpt': ['gpt', 'chatgpt', 'openai', 'generative']
    }

    const searchTerms = keywordMap[keywordLower] || [keywordLower]

    const filteredNews = allNews.filter(item => {
      const title = item.title.toLowerCase()
      const description = item.description.toLowerCase()

      return searchTerms.some((term: string) =>
        title.includes(term) || description.includes(term)
      )
    })

    return filteredNews.length > 0 ? filteredNews : getDummyNews().filter(item =>
      item.title.toLowerCase().includes(keywordLower) ||
      item.description.toLowerCase().includes(keywordLower)
    )
  } catch (error) {
    console.error(`${keyword} 뉴스를 필터링하는 중 오류 발생:`, error)
    return getDummyNews().filter(item =>
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.description.toLowerCase().includes(keyword.toLowerCase())
    )
  }
}

// 뉴스 검색 함수 (사용자 정의 쿼리)
export const searchAiNews = async (query: string): Promise<NewsItem[]> => {
  try {
    // 먼저 모든 뉴스를 가져온 다음 검색어로 필터링
    const allNews = await fetchAiNews()

    if (!query.trim()) {
      return allNews
    }

    const queryLower = query.toLowerCase()
    const searchTerms = queryLower.split(' ').filter(term => term.length > 0)

    const filteredNews = allNews.filter(item => {
      const title = item.title.toLowerCase()
      const description = item.description.toLowerCase()
      const source = item.source.toLowerCase()

      return searchTerms.some(term =>
        title.includes(term) ||
        description.includes(term) ||
        source.includes(term)
      )
    })

    // 검색어와 더 관련성이 높은 순으로 정렬
    const scoredNews = filteredNews.map(item => {
      const title = item.title.toLowerCase()
      const description = item.description.toLowerCase()

      let score = 0
      searchTerms.forEach((term: string) => {
        if (title.includes(term)) score += 3 // 제목에 있으면 높은 점수
        if (description.includes(term)) score += 1 // 설명에 있으면 낮은 점수
      })

      return { ...item, score }
    })

    scoredNews.sort((a, b) => b.score - a.score)

    return scoredNews.map(({ score, ...item }) => item)
  } catch (error) {
    console.error(`AI 뉴스 검색 중 오류 발생:`, error)
    return getDummyNews().filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    )
  }
}

// RSS API 상태 확인 함수
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    // RSS2JSON API 테스트
    const response = await axios.get(RSS_TO_JSON_API, {
      params: {
        rss_url: RSS_FEEDS[0].url, // 첫 번째 피드로 테스트
        api_key: 'public',
        count: 1
      },
      timeout: 10000 // 10초 타임아웃
    })
    return response.data.status === 'ok'
  } catch (error) {
    console.error('RSS API 상태 확인 중 오류:', error)
    return false
  }
}