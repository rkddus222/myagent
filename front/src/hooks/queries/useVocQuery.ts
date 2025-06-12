import { postVocAnswer } from '@apis/vocApi'

import { useMutation } from '@tanstack/react-query'

export const useVocQuery = () => {
  return useMutation({
    mutationFn: postVocAnswer
  })
}
export const useVocAnswer = () => {
  const { mutate: postVocAnswer } = useVocQuery()
  const handleVocAnswer = (vocData: any) => {
    postVocAnswer(vocData)
  }
  return { handleVocAnswer }
}
