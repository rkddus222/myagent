import {
  createMapping,
  deleteMapping,
  getAllMapping,
  updateMapping
} from '@apis/mapping'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

const useMappingMutation = ({
  setMapping
}: {
  setMapping: (data: any) => void
}) => {
  return useMutation({
    mutationFn: getAllMapping,
    onSuccess: (data) => {
      setMapping(data.data)
    }
  })
}
const updateMappingMutation = () => {
  return useMutation({
    mutationFn: updateMapping
  })
}

const deleteMappingMutation = () => {
  return useMutation({
    mutationFn: deleteMapping
  })
}

const createMappingMutation = () => {
  return useMutation({
    mutationFn: createMapping
  })
}

export interface Mapping {
  idx: string
  original_title: string
  replace_title: string
  type: string
  align: string
  reg_dtm: string
}

export function useMappingQuery() {
  const [mapping, setMapping] = useState<Mapping[]>([])

  const { mutate: fetchAllMappings } = useMappingMutation({ setMapping })
  const { mutate: updateMappings } = updateMappingMutation()
  const { mutate: deleteMappings } = deleteMappingMutation()
  const { mutate: createMappings } = createMappingMutation()

  const handleAddMapping = (mapping: Mapping) => {
    createMappings(mapping)
    setTimeout(() => {
      fetchAllMappings()
    }, 2000)
  }

  const handleUpdateMapping = (mapping: Mapping) => {
    updateMappings(mapping)
    setTimeout(() => {
      fetchAllMappings()
    }, 2000)
  }

  const handleDeleteMapping = (idx: string) => {
    deleteMappings(idx)
    setTimeout(() => {
      fetchAllMappings()
    }, 2000)
  }

  const handleFetchAllMappings = () => {
    fetchAllMappings()
  }

  return {
    handleFetchAllMappings,
    mapping,
    handleAddMapping,
    handleUpdateMapping,
    handleDeleteMapping
  }
}
