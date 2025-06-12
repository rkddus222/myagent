import { HiClock, HiExclamation } from 'react-icons/hi'
import { HiCheck } from 'react-icons/hi'

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const calculateDuration = (start: string, end: string) => {
  const duration = new Date(end).getTime() - new Date(start).getTime()
  return `${(duration / 1000).toFixed(3)}s`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    default:
      return 'failure'
  }
}

const getNodeIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return HiCheck
    case 'pending':
      return HiClock
    default:
      return HiExclamation
  }
}

export { formatTime, calculateDuration, getStatusColor, getNodeIcon }
