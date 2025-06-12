import React, { useState } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import toast, { Toaster } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

type ConversionType = 'qa' | 'json' | 'csv' | 'csv2'

interface KeyValuePair {
  key: string
  value: string
}

const JsonPage = () => {
  const { isDarkMode } = useThemeStore()
  const [activeTab, setActiveTab] = useState<ConversionType>('qa')
  const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>([
    { key: 'question', value: '' }
  ])
  const [jsonInput, setJsonInput] = useState<string>('')
  const [extractKey, setExtractKey] = useState<string>('')
  const [csvInput, setCsvInput] = useState<string>('')
  const [customInput, setCustomInput] = useState<string>('')
  const [customFormat, setCustomFormat] = useState<string>('')
  const [result, setResult] = useState<string>('')
  const [csv2Result, setCsv2Result] = useState<string>('')
  const [jsonError, setJsonError] = useState<string>('')
  const [format, setFormat] = useState('json')

  const validateJson = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString)
      setJsonError('')
      return true
    } catch (error) {
      setJsonError('올바른 JSON 형식이 아닙니다.')
      return false
    }
  }

  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setJsonInput(value)
    if (value.trim()) {
      validateJson(value)
    } else {
      setJsonError('')
    }
  }

  const handleCsvInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCsvInput(value)
    if (value.trim()) {
      validateJson(value)
    } else {
      setJsonError('')
    }
  }

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setCustomInput(value)
    if (value.trim()) {
      validateJson(value)
    } else {
      setJsonError('')
    }
  }

  const handleConvert = () => {
    try {
      switch (activeTab) {
        case 'qa':
          convertQA()
          break
        case 'json':
          if (!validateJson(jsonInput)) {
            return
          }
          extractJson()
          break
        case 'csv':
          if (!validateJson(csvInput)) {
            return
          }
          downloadCSV()
          break
        case 'csv2':
          // 파일 업로드는 버튼이 아니라 input에서 처리하므로 아무 동작 없음
          break
      }
    } catch (error) {
      console.error('변환 중 오류 발생:', error)
      toast.error('변환 중 오류가 발생했습니다.')
    }
  }

  const convertQA = () => {
    const values = keyValuePairs.map(pair => 
      pair.value.split('\n').filter(v => v.trim())
    )

    // 모든 입력 필드의 줄 수가 같은지 확인
    const lineCount = values[0].length
    if (!values.every(v => v.length === lineCount)) {
      throw new Error('모든 필드의 입력 줄 수가 일치해야 합니다.')
    }

    const result = Array.from({ length: lineCount }, (_, index) => {
      const obj: Record<string, string> = {}
      keyValuePairs.forEach((pair, i) => {
        obj[pair.key] = values[i][index]
      })
      return obj
    })

    setResult(JSON.stringify(result, null, 2))
  }

  const extractJson = () => {
    try {
      const jsonData = JSON.parse(jsonInput)
      const key = extractKey.trim()

      if (!key) {
        throw new Error('추출할 키를 입력해주세요.')
      }

      let extractedValues: any[] = []

      // 배열인 경우
      if (Array.isArray(jsonData)) {
        extractedValues = jsonData.map(item => {
          if (typeof item === 'object' && item !== null) {
            return item[key]
          }
          return null
        }).filter(value => value !== undefined && value !== null)
      }
      // 객체인 경우
      else if (typeof jsonData === 'object' && jsonData !== null) {
        if (key in jsonData) {
          extractedValues = [jsonData[key]]
        }
      }

      if (extractedValues.length === 0) {
        throw new Error('해당 키에 대한 값을 찾을 수 없습니다.')
      }

      setResult(JSON.stringify(extractedValues, null, 2))
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('올바른 JSON 형식이 아닙니다.')
      }
      throw error
    }
  }

  const addKeyValuePair = () => {
    setKeyValuePairs([...keyValuePairs, { key: '', value: '' }])
  }

  const removeKeyValuePair = (index: number) => {
    if (keyValuePairs.length > 1) {
      setKeyValuePairs(keyValuePairs.filter((_, i) => i !== index))
    }
  }

  const updateKeyValuePair = (index: number, field: 'key' | 'value', value: string) => {
    const newPairs = [...keyValuePairs]
    newPairs[index][field] = value
    setKeyValuePairs(newPairs)
  }

  const downloadCSV = () => {
    try {
      const jsonData = JSON.parse(csvInput)
      
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('JSON 데이터는 비어있지 않은 배열이어야 합니다.')
      }

      // 모든 객체의 키를 수집
      const headers = Array.from(
        new Set(
          jsonData.flatMap(obj => 
            typeof obj === 'object' && obj !== null ? Object.keys(obj) : []
          )
        )
      )

      if (headers.length === 0) {
        throw new Error('유효한 데이터가 없습니다.')
      }

      // CSV 헤더 생성
      const csvHeader = headers.join(',') + '\n'

      // CSV 데이터 행 생성
      const csvRows = jsonData.map(obj => {
        return headers.map(header => {
          let value = obj[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') value = JSON.stringify(value);
          let stringValue = String(value);
          // 줄바꿈(\n)은 셀 내부에서 \\n으로 치환
          stringValue = stringValue.replace(/\n/g, '\\n');
          return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',')
      }).join('\n')

      // BOM 추가 (한글 깨짐 방지)
      const csvContent = '\uFEFF' + csvHeader + csvRows

      // CSV 파일 생성 및 다운로드
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'data.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('CSV 파일이 다운로드되었습니다.')
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('올바른 JSON 형식이 아닙니다.')
      }
      throw error
    }
  }

  const convertCustom = () => {
    try {
      const inputData = JSON.parse(customInput)
      const format = customFormat.trim()
      
      // 간단한 템플릿 변환 예시
      const result = inputData.map((item: any) => {
        let formatted = format
        Object.keys(item).forEach(key => {
          formatted = formatted.replace(`{${key}}`, item[key])
        })
        return formatted
      })

      setResult(JSON.stringify(result, null, 2))
    } catch (error) {
      throw new Error('입력 데이터가 올바른 JSON 형식이 아닙니다.')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    toast.success('클립보드에 복사되었습니다.', {
      duration: 2000,
      position: 'bottom-center',
      style: {
        background: isDarkMode ? '#1F2937' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
        border: '1px solid',
        borderColor: isDarkMode ? '#374151' : '#E5E7EB',
      },
    })
  }

  // CSV/엑셀 파일 업로드 핸들러
  const handleCsv2Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = evt.target?.result
      let jsonArr: any[] = []
      try {
        if (file.name.endsWith('.csv')) {
          // CSV 파싱 (papaparse 사용)
          const text = typeof data === 'string' ? data : new TextDecoder('utf-8').decode(data as ArrayBuffer)
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
          if (parsed.errors.length > 0) throw new Error('CSV 파싱 오류: ' + parsed.errors[0].message)
          jsonArr = parsed.data
        } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
          // 엑셀 파싱
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          jsonArr = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
        } else {
          throw new Error('지원하지 않는 파일 형식입니다.')
        }
        setCsv2Result(JSON.stringify(jsonArr, null, 2))
        toast.success('JSON 변환이 완료되었습니다.')
      } catch (err: any) {
        toast.error('파일 변환 중 오류: ' + err.message)
      }
    }
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file)
    } else {
      reader.readAsBinaryString(file)
    }
  }

  const renderInputArea = () => {
    switch (activeTab) {
      case 'qa':
        return (
          <div className="space-y-4">
            {keyValuePairs.map((pair, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    키 이름
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={pair.key}
                    onChange={(e) => updateKeyValuePair(index, 'key', e.target.value)}
                    placeholder="키 이름을 입력하세요"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    값 목록
                  </label>
                  <textarea
                    className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none shadow-sm"
                    value={pair.value}
                    onChange={(e) => updateKeyValuePair(index, 'value', e.target.value)}
                    placeholder="각 줄에 하나의 값을 입력하세요"
                  />
                </div>
                {keyValuePairs.length > 1 && (
                  <button
                    className="mt-8 p-2 text-red-500 hover:text-red-700"
                    onClick={() => removeKeyValuePair(index)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 flex items-center"
              onClick={addKeyValuePair}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              필드 추가
            </button>
          </div>
        )
      case 'json':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                JSON 입력
              </label>
              <textarea
                className={`w-full h-64 p-4 border ${
                  jsonError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none shadow-sm font-mono`}
                value={jsonInput}
                onChange={handleJsonInputChange}
                placeholder="JSON 데이터를 입력하세요"
              />
              {jsonError && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {jsonError}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                추출할 키
              </label>
              <input
                type="text"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white shadow-sm"
                value={extractKey}
                onChange={(e) => setExtractKey(e.target.value)}
                placeholder="추출할 키를 입력하세요"
              />
            </div>
          </div>
        )
      case 'csv':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              JSON 데이터
            </label>
            <textarea
              className={`w-full h-64 p-4 border ${
                jsonError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none shadow-sm font-mono`}
              value={csvInput}
              onChange={handleCsvInputChange}
              placeholder="CSV로 변환할 JSON 데이터를 입력하세요"
            />
            {jsonError && (
              <p className="mt-2 text-sm text-red-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {jsonError}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              * JSON 데이터는 객체 배열 형식이어야 합니다.
            </p>
          </div>
        )
      case 'csv2':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                CSV 또는 엑셀 파일 업로드
              </label>
              <input
                type="file"
                accept=".csv, .xls, .xlsx"
                onChange={handleCsv2Upload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">첫 행이 key, 아래 행이 value로 인식되어 JSON으로 변환됩니다.</p>
            </div>
            {csv2Result && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">변환 결과 (JSON)</label>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl overflow-x-auto font-mono text-sm text-gray-800 dark:text-gray-200">
                  {csv2Result}
                </pre>
              </div>
            )}
          </div>
        )
    }
  }

  // 버튼 텍스트를 탭에 따라 다르게 반환
  const getButtonText = () => {
    switch (activeTab) {
      case 'qa':
        return '변환하기';
      case 'json':
        return '추출하기';
      case 'csv':
        return '다운받기';
      case 'csv2':
        return '변환하기';
      default:
        return '실행';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <Toaster />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">JSON 변환</h1>
          <p className="text-gray-600 dark:text-gray-300">다양한 형식의 데이터를 JSON으로 변환해보세요</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
          <div className="flex space-x-2 mb-6">
            <button
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'qa'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('qa')}
            >
              Q&A 변환
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'json'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('json')}
            >
              JSON 추출
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'csv'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('csv')}
            >
              CSV 다운로드
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'csv2'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('csv2')}
            >
              CSV 변환
            </button>
          </div>

          <div className="space-y-6">
            {renderInputArea()}

            {/* 변환/다운로드/추출 버튼: csv2 탭에서는 숨김 */}
            {activeTab !== 'csv2' && (
              <div className="flex space-x-4 pt-4">
                <button
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                  onClick={handleConvert}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  {getButtonText()}
                </button>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                변환 결과
              </h2>
              <button
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center"
                onClick={handleCopy}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                복사
              </button>
            </div>
            <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl overflow-x-auto font-mono text-sm text-gray-800 dark:text-gray-200">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default JsonPage 