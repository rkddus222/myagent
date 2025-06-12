import axiosInstance from './axiosInstance'

interface RespondentRequest {
  user_question: string
  company_id: string
  sql_query: string
}

interface RespondentResponse {
  answer: string
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

      const requestData = {
        user_question: parsedQuestion,
        company_id: request.company_id,
        sql_query: parsedSqlQuery
      }
      console.log('API Request:', requestData)  // 디버깅을 위한 로그 추가
      const response = await axiosInstance.post<RespondentResponse>('/api/llm/respondent', requestData)
      return response.data.answer
    } catch (error) {
      console.error('API 요청 중 오류 발생:', error)
      throw error
    }
  }
} 