import axios from 'axios'

const daquvInterface = {
  apiUrl: import.meta.env.VITE_DAQUV_API_URL || 'http://localhost:8000'
}

const axiosInstance = axios.create({
  baseURL: daquvInterface.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default axiosInstance
