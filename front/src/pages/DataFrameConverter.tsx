import React, { useState, useMemo } from 'react';
import { Table, Button, message } from 'antd';
import 'antd/dist/reset.css';
import type { ColumnsType } from 'antd/es/table';

interface DataItem {
  [key: string]: any;
}

const DataFrameConverter: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo(() => {
    if (data.length === 0) return [];

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
            // 숫자가 1000 이상이면 천 단위 구분자 추가
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

  const handleClear = () => {
    setInputValue('');
    setData([]);
    message.info('입력 데이터가 초기화되었습니다.');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">데이터프레임 변환</h1>
      <div className="mb-4">
        <textarea
          className="w-full h-40 p-2 border rounded mb-2"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="JSON 데이터를 입력하세요"
        />
        <div className="flex gap-2">
          <Button 
            type="primary" 
            onClick={handleConvert}
            loading={isLoading}
          >
            변환하기
          </Button>
          <Button 
            onClick={handleClear}
            danger
          >
            초기화
          </Button>
        </div>
      </div>
      {data.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-gray-600">
            총 {data.length}개의 행이 변환되었습니다.
          </div>
          <Table
            columns={columns}
            dataSource={data}
            rowKey={(record, index) => index?.toString() || ''}
            pagination={false}
            bordered
            scroll={{ x: 'max-content' }}
          />
        </div>
      )}
    </div>
  );
};

export default DataFrameConverter; 