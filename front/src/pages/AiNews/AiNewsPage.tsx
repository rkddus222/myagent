import { useState, useEffect } from 'react'
import { fetchAiNews, fetchAiNewsByKeyword, searchAiNews, checkApiStatus, NewsItem } from '../../apis/aiNewsApi'

function AiNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedKeyword, setSelectedKeyword] = useState<'ALL' | 'AI' | 'LLM' | 'GPT'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [apiStatus, setApiStatus] = useState<boolean | null>(null)

  useEffect(() => {
    checkApiAvailability()
    loadAiNews()
  }, [])

  useEffect(() => {
    if (selectedKeyword !== 'ALL') {
      loadNewsByKeyword(selectedKeyword)
    } else {
      loadAiNews()
    }
  }, [selectedKeyword])

  const checkApiAvailability = async () => {
    const status = await checkApiStatus()
    setApiStatus(status)
  }

  const loadAiNews = async () => {
    try {
      setLoading(true)
      const newsData = await fetchAiNews()
      setNews(newsData)
      setError(null)
    } catch (err) {
      setError('뉴스를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadNewsByKeyword = async (keyword: 'AI' | 'LLM' | 'GPT') => {
    try {
      setLoading(true)
      const newsData = await fetchAiNewsByKeyword(keyword)
      setNews(newsData)
      setError(null)
    } catch (err) {
      setError('뉴스를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const newsData = await searchAiNews(searchQuery)
      setNews(newsData)
      setError(newsData.length === 0 ? '검색 결과가 없습니다.' : null)
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setSearchQuery('')
    if (selectedKeyword !== 'ALL') {
      loadNewsByKeyword(selectedKeyword)
    } else {
      loadAiNews()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI 뉴스
          </h1>
          {apiStatus !== null && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${apiStatus ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {apiStatus ? 'Live News API 연결됨' : '더미 데이터 모드'}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 키워드 필터 */}
          <div className="flex gap-2">
            {['ALL', 'AI', 'LLM', 'GPT'].map((keyword) => (
              <button
                key={keyword}
                onClick={() => setSelectedKeyword(keyword as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedKeyword === keyword
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {keyword === 'ALL' ? '전체' : keyword}
              </button>
            ))}
          </div>

          {/* 검색 */}
          <div className="flex gap-2 flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="AI 뉴스 검색..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* 뉴스 리스트 */}
      <div className="space-y-6">
        {news.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row">
              {/* 이미지 (있는 경우) */}
              {item.imageUrl && (
                <div className="lg:w-64 h-48 lg:h-auto">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* 콘텐츠 */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {item.title}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
                    {item.source}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {item.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(item.publishedAt)}
                  </span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    자세히 보기 →
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && !loading && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          표시할 뉴스가 없습니다.
        </div>
      )}
    </div>
  )
}

export default AiNewsPage