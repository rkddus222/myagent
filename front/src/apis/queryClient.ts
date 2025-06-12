import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      staleTime: 0 // staleTime을 0으로 설정
    },
    mutations: {
      retry: 0
    }
  }
})
export default queryClient
