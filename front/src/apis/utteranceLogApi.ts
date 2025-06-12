import axiosInstance from './axiosInstance'

export interface UtteranceLog {
  id: number
  user_id: string
  utterance_datetime: string
  utterance_content: string
  query_date: string
  sql_query: string
  respondent: string
  detail_url: string
  environment: string
  category_code: string
  detail_code: string
  status: '정상' | '오류' | '대기'
  error_type: string
  resolution_method: string
  resolution_date: string
  progress_status: '완료' | '진행' | '피드백' | '보류' | '대기'
  created_at: string
  updated_at: string
}

export interface UtteranceLogStats {
  total: number
  success: number
  error: number
  pending: number
}

export interface UtteranceLogUpdate {
  status?: 'success' | 'error' | 'pending'
  error_type?: string
  resolution_method?: string
  resolution_date?: string
  progress_status?: 'completed' | 'in_progress' | 'pending'
}

export interface UtteranceLogFilter {
  startDate?: string
  endDate?: string
  status?: string
  progressStatus?: string
}

export const utteranceLogApi = {
  getUtteranceLogs: async (filters?: UtteranceLogFilter) => {
    const response = await axiosInstance.get<UtteranceLog[]>('/api/utterance-logs', {
      params: filters
    })
    return response.data
  },

  getUtteranceLog: async (id: number) => {
    const response = await axiosInstance.get<UtteranceLog>(`/api/utterance-logs/${id}`)
    return response.data
  },

  getUtteranceLogStats: async () => {
    const response = await axiosInstance.get<UtteranceLogStats>('/api/utterance-logs/stats')
    return response.data
  },

  createUtteranceLog: async (data: Omit<UtteranceLog, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await axiosInstance.post<UtteranceLog>('/api/utterance-logs', data)
    return response.data
  },

  updateUtteranceLog: async (id: number, data: UtteranceLogUpdate) => {
    const response = await axiosInstance.patch<UtteranceLog>(`/api/utterance-logs/${id}`, data)
    return response.data
  },

  deleteUtteranceLog: async (id: number) => {
    await axiosInstance.delete(`/api/utterance-logs/${id}`)
  }
} 