import axiosInstance from './axiosInstance'

export interface UtteranceLog {
  id: string
  question: string
  answer: string
  created_at: string
  updated_at: string
}

export const utteranceLogApi = {
  getUtteranceLogs: async () => {
    const response = await axiosInstance.get<UtteranceLog[]>('/api/utterance-logs')
    return response.data
  },
  getUtteranceLog: async (id: string) => {
    const response = await axiosInstance.get<UtteranceLog>(`/api/utterance-logs/${id}`)
    return response.data
  },
  createUtteranceLog: async (data: Omit<UtteranceLog, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await axiosInstance.post<UtteranceLog>('/api/utterance-logs', data)
    return response.data
  },
  updateUtteranceLog: async (id: string, data: Partial<UtteranceLog>) => {
    const response = await axiosInstance.put<UtteranceLog>(`/api/utterance-logs/${id}`, data)
    return response.data
  },
  deleteUtteranceLog: async (id: string) => {
    const response = await axiosInstance.delete(`/api/utterance-logs/${id}`)
    return response.data
  }
} 