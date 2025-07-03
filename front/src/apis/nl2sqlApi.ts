// OpenAI API 직접 호출을 위한 설정
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

interface Nl2sqlRequest {
  user_question: string
  company_id: string
  table_name?: string
}

interface Nl2sqlResponse {
  sql_query: string
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

export const nl2sqlApi = {
  convertToSql: async (request: Nl2sqlRequest): Promise<string> => {
    const messages = [
      {
        role: 'system',
        content: '당신은 SQL 쿼리 생성 전문가입니다. 자연어를 SQL로 변환해주세요. SQL 쿼리만 반환하고 다른 설명은 포함하지 마세요.'
      },
      {
        role: 'user',
        content: `테이블명: ${request.table_name || '기본 테이블'}\n회사 ID: ${request.company_id}\n질문: ${request.user_question}\n\n위 질문에 대한 SQL 쿼리를 생성해주세요.`
      }
    ]

    const sqlQuery = await callOpenAI(messages)
    return sqlQuery
      .replace(/```sql\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
  }
}
