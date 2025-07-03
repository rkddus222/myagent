// OpenAI API 직접 호출을 위한 설정
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

interface RespondentRequest {
  user_question: string
  company_id: string
  sql_query: string
}

interface RespondentResponse {
  answer: string
}

// OpenAI API 호출 함수
const callOpenAI = async (messages: any[]) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다. VITE_OPENAI_API_KEY 환경변수를 설정해주세요.')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`OpenAI API 오류: ${errorData.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export const respondentApi = {
  convertToSql: async (request: RespondentRequest): Promise<string> => {
    try {
      // user_question이 JSON 문자열인 경우 파싱
      let parsedQuestion = request.user_question
      let parsedSqlQuery = request.sql_query
      
      try {
        const jsonData = JSON.parse(request.user_question)
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const firstItem = jsonData[0]
          if (firstItem.question) {
            parsedQuestion = firstItem.question
          }
          if (firstItem.answer) {
            parsedSqlQuery = firstItem.answer
          }
        }
      } catch (e) {
        // JSON 파싱 실패 시 원본 문자열 사용
        console.log('JSON 파싱 실패, 원본 문자열 사용:', e)
      }

      const messages = [
        {
          role: 'system',
          content: '당신은 SQL 쿼리 결과를 분석하고 사용자 친화적인 답변을 제공하는 전문가입니다. SQL 쿼리 결과를 바탕으로 명확하고 이해하기 쉬운 답변을 제공해주세요.'
        },
        {
          role: 'user',
          content: `회사 ID: ${request.company_id}\n사용자 질문: ${parsedQuestion}\nSQL 쿼리: ${parsedSqlQuery}\n\n위 SQL 쿼리 결과를 바탕으로 사용자 질문에 대한 답변을 제공해주세요.`
        }
      ]

      console.log('API Request:', { user_question: parsedQuestion, company_id: request.company_id, sql_query: parsedSqlQuery })
      return await callOpenAI(messages)
    } catch (error) {
      console.error('API 요청 중 오류 발생:', error)
      throw error
    }
  }
} 