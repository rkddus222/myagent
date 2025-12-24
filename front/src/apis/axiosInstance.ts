import axios from 'axios'

const getBaseURL = () => {
  // 프로덕션에서는 상대 경로 사용 (같은 도메인의 API 사용)
  if (import.meta.env.PROD) {
    return ''
  }
  
  // 개발 환경에서는 환경 변수 또는 localhost 사용
  const envUrl = import.meta.env.VITE_API_URL
  
  if (!envUrl) {
    return 'http://localhost:8081'
  }
  
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
}

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

if (import.meta.env.DEV) {
  console.log('API Base URL:', axiosInstance.defaults.baseURL)
}

export default axiosInstance
