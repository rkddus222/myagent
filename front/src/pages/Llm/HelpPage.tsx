import React, { useState } from 'react'
import { helpApi } from '../../apis/helpApi'
import { toast } from 'react-toastify'

interface TestResult {
  question: string
  answer: string
  timestamp: string
}

type LlmTab = 'single' | 'multi' | 'match'

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState<LlmTab>('single')
  const [question, setQuestion] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [multiQuestions, setMultiQuestions] = useState<string>('')
  const [matchQuestions, setMatchQuestions] = useState<string>('')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [jsonError, setJsonError] = useState<string>('')
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'missing'>('checking')

  const validateJson = (jsonString: string): boolean => {
    try {
      const jsonData = JSON.parse(jsonString)
      if (!Array.isArray(jsonData)) {
        setJsonError('JSON은 배열 형식이어야 합니다.')
        return false
      }
      if (activeTab === 'match') {
        if (jsonData.length === 0) {
          setJsonError('최소 1개의 항목이 필요합니다.')
          return false
        }
        if (!jsonData.every(item => item.question1 && item.question2)) {
          setJsonError('각 항목에 question1과 question2 필드가 필요합니다.')
          return false
        }
      } else {
        if (!jsonData.every(item => typeof item === 'object' && item !== null && 'question' in item)) {
          setJsonError('각 항목은 question 필드를 포함하는 객체여야 합니다.')
          return false
        }
      }
      setJsonError('')
      return true
    } catch (error) {
      setJsonError('올바른 JSON 형식이 아닙니다.')
      return false
    }
  }

  const handleMultiQuestionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMultiQuestions(value)
    if (value.trim()) {
      validateJson(value)
    } else {
      setJsonError('')
    }
  }

  const handleMatchQuestionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMatchQuestions(value)
    if (value.trim()) {
      validateJson(value)
    } else {
      setJsonError('')
    }
  }

  const handleTest = async () => {
    if ((activeTab === 'single' && !question) || 
        (activeTab === 'multi' && !multiQuestions) ||
        (activeTab === 'match' && !matchQuestions)) {
      toast.error('질문을 입력해주세요.')
      return
    }

    if (!prompt) {
      toast.error('프롬프트를 입력해주세요.')
      return
    }

    if ((activeTab === 'multi' || activeTab === 'match') && !validateJson(activeTab === 'multi' ? multiQuestions : matchQuestions)) {
      return
    }

    setIsLoading(true)
    try {
      let questions: string[] = []
      if (activeTab === 'multi') {
        try {
          const jsonData = JSON.parse(multiQuestions)
          if (!Array.isArray(jsonData)) {
            throw new Error('JSON 형식이 올바르지 않습니다. 배열 형태로 입력해주세요.')
          }
          questions = jsonData.map((item: any) => {
            if (!item.question) {
              throw new Error('각 항목에 question 필드가 필요합니다.')
            }
            return item.question
          })
        } catch (error) {
          toast.error('JSON 형식이 올바르지 않습니다. 예시: [{"question": "질문1"}, {"question": "질문2"}]')
          setIsLoading(false)
          return
        }
      } else if (activeTab === 'match') {
        try {
          const jsonData = JSON.parse(matchQuestions)
          if (!Array.isArray(jsonData)) {
            throw new Error('JSON 형식이 올바르지 않습니다. 배열 형태로 입력해주세요.')
          }
          const results: TestResult[] = []
          for (const item of jsonData) {
            if (!item.question1 || !item.question2) {
              throw new Error('각 항목에 question1과 question2 필드가 필요합니다.')
            }
            const answer = await helpApi.evaluate({
              prompt: prompt,
              question1: item.question1,
              question2: item.question2
            })

            results.push({
              question: `질문1: ${item.question1}\n질문2: ${item.question2}`,
              answer: answer,
              timestamp: new Date().toLocaleString()
            })
          }
          setTestResults(results)
          setIsLoading(false)
          return
        } catch (error) {
          toast.error('JSON 형식이 올바르지 않습니다. 예시: [{"question1": "질문1", "question2": "질문2"}]')
          setIsLoading(false)
          return
        }
      } else if (activeTab === 'single' && question) {
        questions = [question]
      }

      const results: TestResult[] = []
      for (const q of questions) {
        const answer = await helpApi.getHelp({
          prompt: prompt,
          user_question: q
        })

        results.push({
          question: q,
          answer: answer,
          timestamp: new Date().toLocaleString()
        })
      }
      setTestResults(results)
    } catch (error) {
      console.error('테스트 중 오류 발생:', error)
      if (error instanceof Error) {
        if (error.message.includes('OpenAI API 키')) {
          toast.error('OpenAI API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 설정해주세요.')
        } else if (error.message.includes('OpenAI API 오류')) {
          toast.error(`API 오류: ${error.message}`)
        } else {
          toast.error(`테스트 중 오류가 발생했습니다: ${error.message}`)
        }
      } else {
        toast.error('테스트 중 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setQuestion('')
    setPrompt('')
    setMultiQuestions('')
    setMatchQuestions('')
    setTestResults([])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('클립보드에 복사되었습니다.')
  }

  // API 키 상태 확인
  React.useEffect(() => {
    const checkApiKey = () => {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      if (apiKey && apiKey !== 'your_openai_api_key_here' && apiKey !== '') {
        setApiKeyStatus('valid')
      } else {
        setApiKeyStatus('missing')
      }
    }
    checkApiKey()
  }, [])

  const getResultsAsJson = () => {
    if (activeTab === 'match') {
      const jsonResults = testResults.map(result => {
        const [question1, question2] = result.question.split('\n').map(q => q.replace('질문1: ', '').replace('질문2: ', ''))
        const [matchResult, reason] = result.answer.split('\n이유:')
        return {
          question: {
            query1: question1,
            query2: question2
          },
          answer: matchResult.replace('일치 여부:', '').trim(),
          reason: reason ? reason.trim() : ''
        }
      })
      return JSON.stringify(jsonResults, null, 2)
    } else {
      const jsonResults = testResults.map(result => ({
        question: result.question,
        answer: result.answer
      }))
      return JSON.stringify(jsonResults, null, 2)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">LLM 테스트</h1>
          {apiKeyStatus === 'checking' && (
            <div className="flex items-center justify-center text-blue-500">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              API 키 확인 중...
            </div>
          )}
          {apiKeyStatus === 'valid' && (
            <div className="flex items-center justify-center text-green-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              OpenAI API 키가 설정되었습니다
            </div>
          )}
          {apiKeyStatus === 'missing' && (
            <div className="flex items-center justify-center text-red-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              OpenAI API 키가 설정되지 않았습니다
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
          <div className="flex space-x-2 mb-6">
            <button
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'single'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('single')}
            >
              단일 질문
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'multi'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('multi')}
            >
              다중 질문
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'match'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('match')}
            >
              일치 여부 확인
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                프롬프트
              </label>
              <textarea
                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none shadow-sm"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="프롬프트를 입력하세요"
              />
            </div>

            {activeTab === 'single' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  질문
                </label>
                <textarea
                  className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none shadow-sm"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="테스트할 질문을 입력하세요"
                />
              </div>
            )}

            {activeTab === 'multi' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  다중 질문 (JSON 형식)
                </label>
                <textarea
                  className={`w-full h-72 p-4 border ${
                    jsonError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none shadow-sm`}
                  value={multiQuestions}
                  onChange={handleMultiQuestionsChange}
                  placeholder='[{"question": "질문1"}, {"question": "질문2"}] 형식으로 입력하세요'
                />
                {jsonError && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {jsonError}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'match' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  일치 여부 확인 질문 (JSON 형식)
                </label>
                <textarea
                  className={`w-full h-72 p-4 border ${
                    jsonError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none shadow-sm`}
                  value={matchQuestions}
                  onChange={handleMatchQuestionsChange}
                  placeholder='[{"question1": "질문1", "question2": "질문2"}] 형식으로 입력하세요'
                />
                {jsonError && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {jsonError}
                  </p>
                )}
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 disabled:bg-blue-300 shadow-md hover:shadow-lg flex items-center justify-center"
                onClick={handleTest}
                disabled={isLoading || apiKeyStatus === 'missing'}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    테스트 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    실행
                  </>
                )}
              </button>
              <button
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                onClick={handleClear}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                초기화
              </button>
            </div>
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                테스트 결과
              </h2>
              <button
                onClick={() => copyToClipboard(getResultsAsJson())}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                전체 결과 복사
              </button>
            </div>
            <div className="space-y-6">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        질문
                      </span>
                      <button
                        onClick={() => copyToClipboard(result.question)}
                        className="text-blue-500 hover:text-blue-600 text-sm flex items-center transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        복사
                      </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">{result.question}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        답변
                      </span>
                      <button
                        onClick={() => copyToClipboard(result.answer)}
                        className="text-blue-500 hover:text-blue-600 text-sm flex items-center transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        복사
                      </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm whitespace-pre-wrap">{result.answer}</p>
                  </div>
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {result.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HelpPage 