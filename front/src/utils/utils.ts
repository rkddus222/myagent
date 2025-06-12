import { toast } from 'react-toastify'

const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('복사되었습니다')
  } catch (err) {
    toast.error('복사에 실패했습니다')
  }
}

const handleDownload = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
  toast.success('다운로드가 시작되었습니다')
}

export { handleCopy, handleDownload }
