import React, { useState, useMemo, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import 'antd/dist/reset.css';
import type { ColumnsType } from 'antd/es/table';
import * as XLSX from 'xlsx';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-sql';

interface DataItem {
  [key: string]: any;
}

type ConversionType = 'single' | 'excel';

const DataFrameConverter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConversionType>('single');
  const [data, setData] = useState<DataItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // 엑셀 업로드용 전체 데이터
  const [excelRows, setExcelRows] = useState<DataItem[]>([]);
  // 선택된 질문 인덱스
  const [selectedRowIdx, setSelectedRowIdx] = useState<number | null>(null);

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    const firstItem = data[0];
    return Object.keys(firstItem).map((key) => {
      const value = firstItem[key];
      const isNumber = typeof value === 'number';
      const isDate = typeof value === 'string' && value.includes('T00:00:00');
      return {
        title: key.replace(/_/g, ' '),
        dataIndex: key,
        key: key,
        render: (value: any) => {
          if (isDate) {
            return new Date(value).toLocaleDateString();
          }
          if (isNumber) {
            if (Math.abs(value) >= 1000) {
              return value.toLocaleString('ko-KR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              });
            }
            return value.toLocaleString('ko-KR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
          return value;
        },
        sorter: isNumber ? (a: any, b: any) => a[key] - b[key] : undefined,
      };
    });
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const preprocessInput = (input: string): string => {
    // 작은따옴표를 큰따옴표로 변환
    let processed = input.replace(/'/g, '"');
    
    // None 값을 null로 변환
    processed = processed.replace(/None/g, 'null');
    
    // 불필요한 공백 제거
    processed = processed.replace(/\s+/g, ' ').trim();
    
    // 대괄호로 시작하지 않는 경우 대괄호 추가
    if (!processed.startsWith('[')) {
      processed = '[' + processed;
    }
    if (!processed.endsWith(']')) {
      processed = processed + ']';
    }
    
    return processed;
  };

  const handleConvert = () => {
    if (!inputValue.trim()) {
      message.warning('JSON 데이터를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const processedInput = preprocessInput(inputValue);
      const parsedData = JSON.parse(processedInput);
      let finalData = parsedData;

      // 중첩된 배열 구조 처리
      while (Array.isArray(finalData) && finalData.length === 1 && Array.isArray(finalData[0])) {
        finalData = finalData[0];
      }

      if (!Array.isArray(finalData)) {
        throw new Error('배열 형식의 JSON 데이터가 필요합니다.');
      }

      setData(finalData);
      message.success('데이터 변환이 완료되었습니다.');
    } catch (error) {
      message.error('올바른 JSON 형식이 아닙니다.');
      console.error('JSON 파싱 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as DataItem[];
        setExcelRows(jsonData);
        setSelectedRowIdx(null); // 초기화
        setData([]); // 표 초기화
        message.success('엑셀 파일 변환이 완료되었습니다.');
      } catch (error) {
        message.error('엑셀 파일 처리 중 오류가 발생했습니다.');
        console.error('엑셀 파싱 에러:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getRowKey = (record: any) => {
    return record.question_n || record.wip_id || record.id || JSON.stringify(record);
  };

  // 안전한 JSON 파싱 함수 (작은따옴표→큰따옴표, None→null)
  function safeJsonParse(str: string) {
    if (!str || typeof str !== 'string') return [];
    let processed = str.replace(/'/g, '"').replace(/\bNone\b/g, 'null');
    try {
      return JSON.parse(processed);
    } catch (e) {
      console.error('safeJsonParse 에러:', e, str);
      return [];
    }
  }

  // 빈 배열 문자열인지 확인하는 함수
  function isEmptyArrayString(str: string) {
    if (!str || typeof str !== 'string') return true;
    try {
      const arr = JSON.parse(str.replace(/'/g, '"').replace(/\bNone\b/g, 'null'));
      return Array.isArray(arr) && arr.length === 0;
    } catch {
      return false;
    }
  }

  // results에서 배열만 추출하는 함수
  function extractArrayFromResults(resultsObj: any) {
    if (Array.isArray(resultsObj)) return resultsObj;
    if (resultsObj && typeof resultsObj === 'object') {
      const firstKey = Object.keys(resultsObj)[0];
      const arr = resultsObj[firstKey];
      if (Array.isArray(arr)) return arr;
    }
    return [];
  }

  const handleRowClick = (idx: number) => {
    setSelectedRowIdx(idx);
    const row = excelRows[idx];
    let resultArr: any[] = [];
    try {
      // 1. result_df 우선
      let resultDf = row.result_df;
      if (resultDf) {
        if (typeof resultDf !== 'string') resultDf = JSON.stringify(resultDf ?? '');
        resultArr = safeJsonParse(resultDf);
      } else {
        // 2. 기존 로직
        let finalResult = row.final_result;
        let results = row.results;
        if (typeof finalResult !== 'string') finalResult = JSON.stringify(finalResult ?? '');
        if (typeof results !== 'string') results = JSON.stringify(results ?? '');
        if (finalResult && !isEmptyArrayString(finalResult)) {
          resultArr = safeJsonParse(finalResult);
        } else if (results && results.trim()) {
          const parsed = safeJsonParse(results);
          resultArr = extractArrayFromResults(parsed);
        }
      }
      if (!Array.isArray(resultArr)) resultArr = [];
    } catch (e) {
      console.error('파싱 에러:', e, row);
      resultArr = [];
    }
    setData(resultArr);
  };

  const handleClear = () => {
    setInputValue('');
    setData([]);
    message.info('입력 데이터가 초기화되었습니다.');
  };

  const renderInputArea = () => {
    switch (activeTab) {
      case 'single':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              JSON 데이터
            </label>
            <textarea
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none shadow-sm font-mono"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="JSON 데이터를 입력하세요"
            />
            <p className="mt-2 text-sm text-gray-500">
              * JSON 데이터는 객체 배열 형식이어야 합니다.
            </p>
          </div>
        );
      case 'excel':
        return (
          <>
            {/* 엑셀 파일 업로드 버튼: 항상 상단에 노출 */}
            <div className="flex items-center gap-4 mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                엑셀 파일 업로드
              </label>
              <input
                type="file"
                accept=".xls, .xlsx"
                onChange={handleExcelUpload}
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <span className="text-xs text-gray-400 ml-2">* 엑셀 파일을 다시 선택하면 데이터가 교체됩니다.</span>
            </div>
            {/* 질문 리스트: 상단 전체 너비, 세로 스크롤 */}
            {excelRows.length > 0 && (
              <div className="w-full max-h-[40vh] overflow-y-auto flex flex-col gap-2 pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                {excelRows.map((row, idx) => (
                  <button
                    key={idx}
                    className={`w-full text-left px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 border shadow-sm flex-shrink-0
                      ${selectedRowIdx === idx ? 'bg-blue-500 text-white font-bold' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-800'}`}
                    onClick={() => handleRowClick(idx)}
                  >
                    {row.question || row.user_input || `질문 ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}
            {/* 결과 표: 질문 리스트 아래에만 표시 */}
            {selectedRowIdx !== null && (
              <div className="w-full">
                {/* 선택된 질문의 dsl, sql 노출 - 위아래 배치, SQL 고정 높이 */}
                <div className="mb-4 flex flex-col gap-4">
                  {/* DSL 카드 */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-base font-bold text-gray-700 dark:text-gray-200 mb-2">DSL</div>
                    <pre className="text-md text-gray-700 dark:text-gray-200 font-sans break-all whitespace-pre-wrap bg-gray-100 dark:bg-gray-900 rounded p-2">
                      {excelRows[selectedRowIdx]?.dsl
                        ? (typeof excelRows[selectedRowIdx].dsl === 'string'
                            ? excelRows[selectedRowIdx].dsl
                            : JSON.stringify(excelRows[selectedRowIdx].dsl, null, 2))
                        : '-'}
                    </pre>
                  </div>
                  {/* SQL 카드 - 고정 높이, 스크롤 */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="text-base font-bold text-gray-700 dark:text-gray-200 mb-2">SQL</div>
                    <pre className="rounded p-2 bg-gray-900 h-60 max-h-96 overflow-y-auto">
                      <code
                        className="language-sql"
                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                      >
                        {excelRows[selectedRowIdx]?.sql || '-'}
                      </code>
                    </pre>
                  </div>
                </div>
                <div className="mb-2 text-gray-600 dark:text-gray-300">총 {data.length}개의 행이 변환되었습니다.</div>
                <div className="overflow-x-auto">
                  <Table
                    columns={columns}
                    dataSource={data}
                    rowKey={getRowKey}
                    pagination={false}
                    bordered
                    scroll={{ x: 'max-content' }}
                  />
                </div>
              </div>
            )}
            {selectedRowIdx === null && excelRows.length > 0 && (
              <div className="text-gray-500 dark:text-gray-400 mt-10 text-center">질문을 선택하면 결과가 여기에 표시됩니다.</div>
            )}
          </>
        );
    }
  };

  const getButtonText = () => {
    switch (activeTab) {
      case 'single':
        return '변환하기';
      case 'excel':
        return '파일 선택';
      default:
        return '실행';
    }
  };

  // 컴포넌트 내부 useEffect 추가
  useEffect(() => {
    Prism.highlightAll();
  }, [excelRows, selectedRowIdx]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">데이터프레임 변환</h1>
          <p className="text-gray-600 dark:text-gray-300">JSON과 엑셀 데이터를 표 형태로 변환해보세요</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
          <div className="flex space-x-2 mb-6">
            <button
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'single'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('single')}
            >
              단건 변환
            </button>
            <button
              className={`flex-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                activeTab === 'excel'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('excel')}
            >
              엑셀 변환
            </button>
          </div>

          <div className="space-y-6">
            {renderInputArea()}

            {/* 변환 버튼: excel 탭에서는 숨김 */}
            {activeTab === 'single' && (
              <div className="flex space-x-4 pt-4">
                <button
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                  onClick={handleConvert}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  {getButtonText()}
                </button>
                <button
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                  onClick={handleClear}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  초기화
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFrameConverter; 