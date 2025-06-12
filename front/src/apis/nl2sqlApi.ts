import axiosInstance from './axiosInstance'

interface Nl2sqlRequest {
  user_question: string
  company_id: string
  table_name?: string
}

interface Nl2sqlResponse {
  sql_query: string
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
