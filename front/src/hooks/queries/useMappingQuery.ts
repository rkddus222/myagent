import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mappingApi } from '@apis/mapping'
import { Mapping } from '@/types/llmAdmin.type'

export const useMappingQuery = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['mapping'],
    queryFn: mappingApi.getMapping
  })

  const createMapping = useMutation({
    mutationFn: (mapping: Mapping) => mappingApi.createMapping(mapping),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapping'] })
    }
  })

  const updateMapping = useMutation({
    mutationFn: (mapping: Mapping) => mappingApi.updateMapping(mapping),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapping'] })
    }
  })

  const deleteMapping = useMutation({
    mutationFn: (id: string) => mappingApi.deleteMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapping'] })
    }
  })

  return {
    mapping: data as Mapping[],
    isLoading,
    error,
    createMapping,
    updateMapping,
    deleteMapping
  }
}
