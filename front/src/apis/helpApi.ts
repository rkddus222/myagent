import axiosInstance from './axiosInstance'

interface Nl2sqlRequest {
  user_question: string
  company_id: string
  table_name?: string
}

interface Nl2sqlResponse {
  sql_query: string
}

interface HelpRequest {
  prompt: string
  user_question: string
}

interface HelpResponse {
  answer: string
}

interface EvaluateRequest {
  prompt: string
  question1: string
  question2: string
}

interface EvaluateResponse {
  answer: string
}

export const nl2sqlApi = {
  convertToSql: async (request: Nl2sqlRequest): Promise<string> => {
    const response = await axiosInstance.post<Nl2sqlResponse>('/api/llm/nl2sql', request)
    return response.data.sql_query
      .replace(/```sql\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
  }
}

export const helpApi = {
  getHelp: async (request: HelpRequest): Promise<string> => {
    const response = await axiosInstance.post<HelpResponse>('/api/llm/help', request)
    return response.data.answer
  },
  evaluate: async (request: EvaluateRequest): Promise<string> => {
    console.log('Evaluate request:', request)
    const response = await axiosInstance.post<EvaluateResponse>('/api/llm/evaluate', request)
    return response.data.answer
  }
}
