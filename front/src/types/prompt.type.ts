interface Prompt {
  prompt_nm: string
  // description: string
  prompt_text: string
  node_nm: string
  updated_at: string
}

type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'date'
export type { Prompt, SortOption }
