import React, { useState } from 'react';
import { VegaEmbed } from 'react-vega';
import type { VisualizationSpec } from 'vega-embed';

// 기본 예제 스펙들
const exampleSpecs = {
  barChart: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '막대 차트',
    data: {
      values: [
        { category: 'A', value: 28 },
        { category: 'B', value: 55 },
        { category: 'C', value: 43 },
        { category: 'D', value: 91 },
        { category: 'E', value: 81 },
        { category: 'F', value: 53 },
        { category: 'G', value: 19 },
        { category: 'H', value: 87 }
      ]
    },
    mark: 'bar',
    encoding: {
      x: { field: 'category', type: 'nominal', axis: { labelAngle: 0 } },
      y: { field: 'value', type: 'quantitative' }
    }
  },
  lineChart: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '선 차트',
    data: {
      values: [
        { x: 0, y: 5 },
        { x: 1, y: 10 },
        { x: 2, y: 8 },
        { x: 3, y: 15 },
        { x: 4, y: 12 },
        { x: 5, y: 20 },
        { x: 6, y: 18 }
      ]
    },
    mark: { type: 'line', point: true },
    encoding: {
      x: { field: 'x', type: 'quantitative', title: 'X축' },
      y: { field: 'y', type: 'quantitative', title: 'Y축' }
    }
  },
  multiLineChart: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '다중 선 차트',
    data: {
      values: [
        { month: 1, series: '제품 A', value: 30 },
        { month: 2, series: '제품 A', value: 45 },
        { month: 3, series: '제품 A', value: 40 },
        { month: 4, series: '제품 A', value: 55 },
        { month: 5, series: '제품 A', value: 50 },
        { month: 6, series: '제품 A', value: 65 },
        { month: 1, series: '제품 B', value: 20 },
        { month: 2, series: '제품 B', value: 35 },
        { month: 3, series: '제품 B', value: 30 },
        { month: 4, series: '제품 B', value: 45 },
        { month: 5, series: '제품 B', value: 42 },
        { month: 6, series: '제품 B', value: 55 },
        { month: 1, series: '제품 C', value: 15 },
        { month: 2, series: '제품 C', value: 25 },
        { month: 3, series: '제품 C', value: 28 },
        { month: 4, series: '제품 C', value: 35 },
        { month: 5, series: '제품 C', value: 38 },
        { month: 6, series: '제품 C', value: 48 }
      ]
    },
    mark: { type: 'line', point: true },
    encoding: {
      x: { field: 'month', type: 'quantitative', title: '월' },
      y: { field: 'value', type: 'quantitative', title: '판매량' },
      color: { field: 'series', type: 'nominal', title: '제품' }
    }
  },
  areaChart: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '면적 차트',
    data: {
      values: [
        { month: 1, value: 30 },
        { month: 2, value: 45 },
        { month: 3, value: 40 },
        { month: 4, value: 55 },
        { month: 5, value: 50 },
        { month: 6, value: 65 },
        { month: 7, value: 70 },
        { month: 8, value: 60 },
        { month: 9, value: 75 },
        { month: 10, value: 80 },
        { month: 11, value: 85 },
        { month: 12, value: 90 }
      ]
    },
    mark: 'area',
    encoding: {
      x: { field: 'month', type: 'quantitative', title: '월' },
      y: { field: 'value', type: 'quantitative', title: '값' }
    }
  },
  pieChart: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '원형 차트',
    data: {
      values: [
        { category: '제품 A', value: 30 },
        { category: '제품 B', value: 25 },
        { category: '제품 C', value: 20 },
        { category: '제품 D', value: 15 },
        { category: '기타', value: 10 }
      ]
    },
    mark: 'arc',
    encoding: {
      theta: { field: 'value', type: 'quantitative' },
      color: { field: 'category', type: 'nominal' }
    },
    view: { stroke: null }
  },
  stackedBarChart: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '누적 막대 차트',
    data: {
      values: [
        { month: '1월', category: '제품 A', value: 20 },
        { month: '1월', category: '제품 B', value: 15 },
        { month: '1월', category: '제품 C', value: 10 },
        { month: '2월', category: '제품 A', value: 25 },
        { month: '2월', category: '제품 B', value: 20 },
        { month: '2월', category: '제품 C', value: 12 },
        { month: '3월', category: '제품 A', value: 30 },
        { month: '3월', category: '제품 B', value: 18 },
        { month: '3월', category: '제품 C', value: 15 },
        { month: '4월', category: '제품 A', value: 28 },
        { month: '4월', category: '제품 B', value: 22 },
        { month: '4월', category: '제품 C', value: 18 },
        { month: '5월', category: '제품 A', value: 35 },
        { month: '5월', category: '제품 B', value: 25 },
        { month: '5월', category: '제품 C', value: 20 }
      ]
    },
    mark: 'bar',
    encoding: {
      x: { field: 'month', type: 'nominal', title: '월' },
      y: { field: 'value', type: 'quantitative', title: '판매량' },
      color: { field: 'category', type: 'nominal', title: '제품' }
    }
  },
  groupedBarChart: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '그룹 막대 차트',
    data: {
      values: [
        { month: '1월', category: '제품 A', value: 20 },
        { month: '1월', category: '제품 B', value: 15 },
        { month: '1월', category: '제품 C', value: 10 },
        { month: '2월', category: '제품 A', value: 25 },
        { month: '2월', category: '제품 B', value: 20 },
        { month: '2월', category: '제품 C', value: 12 },
        { month: '3월', category: '제품 A', value: 30 },
        { month: '3월', category: '제품 B', value: 18 },
        { month: '3월', category: '제품 C', value: 15 },
        { month: '4월', category: '제품 A', value: 28 },
        { month: '4월', category: '제품 B', value: 22 },
        { month: '4월', category: '제품 C', value: 18 },
        { month: '5월', category: '제품 A', value: 35 },
        { month: '5월', category: '제품 B', value: 25 },
        { month: '5월', category: '제품 C', value: 20 }
      ]
    },
    mark: 'bar',
    encoding: {
      x: { field: 'month', type: 'nominal', title: '월' },
      y: { field: 'value', type: 'quantitative', title: '판매량' },
      color: { field: 'category', type: 'nominal', title: '제품' },
      xOffset: { field: 'category' }
    }
  }
};

const TestPage: React.FC = () => {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(exampleSpecs.barChart, null, 2));
  const [spec, setSpec] = useState<VisualizationSpec>(exampleSpecs.barChart as VisualizationSpec);
  const [error, setError] = useState<string | null>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);
    
    try {
      const parsed = JSON.parse(value);
      setSpec(parsed as VisualizationSpec);
      setError(null);
    } catch (err) {
      setError('유효하지 않은 JSON 형식입니다.');
    }
  };

  const loadExample = (exampleKey: keyof typeof exampleSpecs) => {
    const example = exampleSpecs[exampleKey];
    setJsonInput(JSON.stringify(example, null, 2));
    setSpec(example as VisualizationSpec);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background-primary p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-6 text-4xl font-bold text-gray-800 dark:text-white">
          Vega-Lite 시각화 테스트
        </h1>
        
        {/* 예제 버튼들 */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => loadExample('barChart')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            막대 차트
          </button>
          <button
            onClick={() => loadExample('lineChart')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
          >
            선 차트
          </button>
          <button
            onClick={() => loadExample('multiLineChart')}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium"
          >
            다중 선 차트
          </button>
          <button
            onClick={() => loadExample('areaChart')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
          >
            면적 차트
          </button>
          <button
            onClick={() => loadExample('pieChart')}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
          >
            원형 차트
          </button>
          <button
            onClick={() => loadExample('stackedBarChart')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
          >
            누적 막대 차트
          </button>
          <button
            onClick={() => loadExample('groupedBarChart')}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors font-medium"
          >
            그룹 막대 차트
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* JSON 입력 영역 */}
          <div className="flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full flex flex-col">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Vega-Lite JSON 스펙
              </h2>
              <textarea
                value={jsonInput}
                onChange={handleJsonChange}
                className="flex-1 w-full p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Vega-Lite JSON 스펙을 입력하세요..."
                spellCheck={false}
              />
              {error && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 시각화 결과 영역 */}
          <div className="flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full flex flex-col">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                시각화 결과
              </h2>
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                {!error && spec ? (
                  <VegaEmbed spec={spec} options={{ actions: false }} />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    유효한 JSON을 입력하면 시각화가 표시됩니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 사용 가이드 */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            사용 가이드
          </h2>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>• <strong>7가지 차트 타입</strong>을 예제 버튼으로 바로 테스트할 수 있습니다.</p>
            <p>• 왼쪽 영역에서 JSON을 직접 수정하면 오른쪽에 실시간으로 시각화가 업데이트됩니다.</p>
            <p>• 각 차트의 데이터와 스타일을 자유롭게 수정하여 원하는 시각화를 만들어보세요.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
              <div>
                <p className="font-semibold text-blue-600 dark:text-blue-400">📊 막대 차트</p>
                <p className="text-sm">카테고리별 값 비교</p>
              </div>
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">📈 선 차트</p>
                <p className="text-sm">시간에 따른 추세 표현</p>
              </div>
              <div>
                <p className="font-semibold text-teal-600 dark:text-teal-400">📉 다중 선 차트</p>
                <p className="text-sm">여러 시리즈 비교</p>
              </div>
              <div>
                <p className="font-semibold text-cyan-600 dark:text-cyan-400">🏔️ 면적 차트</p>
                <p className="text-sm">누적 데이터 강조</p>
              </div>
              <div>
                <p className="font-semibold text-purple-600 dark:text-purple-400">🥧 원형 차트</p>
                <p className="text-sm">전체 대비 비율 표시</p>
              </div>
              <div>
                <p className="font-semibold text-orange-600 dark:text-orange-400">📊 누적 막대 차트</p>
                <p className="text-sm">카테고리별 구성 비교</p>
              </div>
              <div>
                <p className="font-semibold text-pink-600 dark:text-pink-400">📊 그룹 막대 차트</p>
                <p className="text-sm">그룹별 값 나란히 비교</p>
              </div>
            </div>
            <p className="pt-4">• Vega-Lite 스펙에 대한 자세한 내용은 <a href="https://vega.github.io/vega-lite/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold">공식 문서</a>를 참조하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

