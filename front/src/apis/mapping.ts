import axiosInstance from './axiosInstance'
import { Mapping } from '../types/llmAdmin.type'

export const mappingApi = {
  getMapping: async () => {
    const response = await axiosInstance.get<Mapping[]>('/api/mapping')
    return response.data
  },
  createMapping: async (mapping: Mapping) => {
    const response = await axiosInstance.post<Mapping>('/api/mapping', mapping)
    return response.data
  },
  updateMapping: async (mapping: Mapping) => {
    const response = await axiosInstance.put<Mapping>(`/api/mapping/${mapping.idx}`, mapping)
    return response.data
  },
  deleteMapping: async (id: string) => {
    const response = await axiosInstance.delete(`/api/mapping/${id}`)
    return response.data
  }
} 