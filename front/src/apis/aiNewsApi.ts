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

// News API 응답 인터페이스
interface NewsApiArticle {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

interface NewsApiResponse {
  status: string
  totalResults: number
  articles: NewsApiArticle[]
}

// News API 설정
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY
const NEWS_API_BASE_URL = import.meta.env.VITE_NEWS_API_BASE_URL || 'https://newsapi.org/v2'

// News API 인스턴스 생성
const newsApiInstance = axios.create({
  baseURL: NEWS_API_BASE_URL,
  params: {
    apiKey: NEWS_API_KEY
  }
})

// News API 응답을 내부 포맷으로 변환하는 함수
const transformNewsApiArticle = (article: NewsApiArticle): NewsItem => ({
  id: `${article.url}-${article.publishedAt}`,
  title: article.title,
  description: article.description || '설명이 없습니다.',
  url: article.url,
  publishedAt: article.publishedAt,
  source: article.source.name,
  imageUrl: article.urlToImage || undefined
})

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

// AI 뉴스를 가져오는 API 함수
export const fetchAiNews = async (): Promise<NewsItem[]> => {
  // API 키가 설정되지 않은 경우 더미 데이터 반환
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
    console.warn('News API 키가 설정되지 않았습니다. 더미 데이터를 사용합니다.')
    return getDummyNews()
  }

  try {
    // AI 관련 키워드로 뉴스 검색
    const searchQuery = AI_KEYWORDS.join(' OR ')

    const response = await newsApiInstance.get<NewsApiResponse>('/everything', {
      params: {
        q: searchQuery,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
        domains: 'techcrunch.com,arstechnica.com,theverge.com,wired.com,mit.edu,openai.com,deepmind.com'
      }
    })

    if (response.data.status === 'ok' && response.data.articles) {
      const transformedArticles = response.data.articles
        .filter(article => article.title && article.description && article.url)
        .map(transformNewsApiArticle)
        .slice(0, 10) // 최대 10개만 반환

      return transformedArticles.length > 0 ? transformedArticles : getDummyNews()
    }

    return getDummyNews()
  } catch (error) {
    console.error('AI 뉴스를 가져오는 중 오류 발생:', error)

    // API 에러가 발생한 경우 더미 데이터 반환
    return getDummyNews()
  }
}

// 특정 키워드로 AI 뉴스를 가져오는 함수
export const fetchAiNewsByKeyword = async (keyword: 'AI' | 'LLM' | 'GPT'): Promise<NewsItem[]> => {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
    console.warn('News API 키가 설정되지 않았습니다. 더미 데이터를 사용합니다.')
    return getDummyNews().filter(item =>
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.description.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  try {
    let searchQuery = ''

    switch (keyword) {
      case 'AI':
        searchQuery = 'AI OR "artificial intelligence" OR "machine learning"'
        break
      case 'LLM':
        searchQuery = 'LLM OR "large language model" OR "language model"'
        break
      case 'GPT':
        searchQuery = 'GPT OR ChatGPT OR "OpenAI GPT"'
        break
    }

    const response = await newsApiInstance.get<NewsApiResponse>('/everything', {
      params: {
        q: searchQuery,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 15,
        domains: 'techcrunch.com,arstechnica.com,theverge.com,wired.com,mit.edu,openai.com,deepmind.com,venturebeat.com'
      }
    })

    if (response.data.status === 'ok' && response.data.articles) {
      const transformedArticles = response.data.articles
        .filter(article => article.title && article.description && article.url)
        .map(transformNewsApiArticle)
        .slice(0, 10)

      return transformedArticles.length > 0 ? transformedArticles : getDummyNews()
    }

    return getDummyNews()
  } catch (error) {
    console.error(`${keyword} 뉴스를 가져오는 중 오류 발생:`, error)
    return getDummyNews()
  }
}

// 뉴스 검색 함수 (사용자 정의 쿼리)
export const searchAiNews = async (query: string): Promise<NewsItem[]> => {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
    console.warn('News API 키가 설정되지 않았습니다. 더미 데이터를 사용합니다.')
    return getDummyNews().filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    )
  }

  try {
    // AI 관련 검색어와 사용자 쿼리를 결합
    const combinedQuery = `(AI OR "artificial intelligence" OR LLM OR GPT) AND (${query})`

    const response = await newsApiInstance.get<NewsApiResponse>('/everything', {
      params: {
        q: combinedQuery,
        language: 'en',
        sortBy: 'relevancy',
        pageSize: 15
      }
    })

    if (response.data.status === 'ok' && response.data.articles) {
      const transformedArticles = response.data.articles
        .filter(article => article.title && article.description && article.url)
        .map(transformNewsApiArticle)
        .slice(0, 10)

      return transformedArticles
    }

    return []
  } catch (error) {
    console.error(`AI 뉴스 검색 중 오류 발생:`, error)
    return []
  }
}

// API 상태 확인 함수
export const checkApiStatus = async (): Promise<boolean> => {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_news_api_key_here') {
    return false
  }

  try {
    const response = await newsApiInstance.get<NewsApiResponse>('/everything', {
      params: {
        q: 'test',
        pageSize: 1
      }
    })
    return response.data.status === 'ok'
  } catch (error) {
    console.error('News API 상태 확인 중 오류:', error)
    return false
  }
}