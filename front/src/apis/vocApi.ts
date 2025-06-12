import axiosInstance from './axiosInstance'

export const getAllVoc = async () => {
  const response = await axiosInstance.get('/voc/getAll')
  return response.data.data
}

interface postVocAnsweProps {
  seq: number
  answer: string
}
export const postVocAnswer = async (vocData: postVocAnsweProps) => {
  const { data } = await axiosInstance.post('/voc/answer', vocData)
  return data
}
