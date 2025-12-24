import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaPlus, FaTrash, FaArrowRight } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';

interface StockItem {
  id: string;
  name: string;
  code: string;
}

const STOCK_STORAGE_KEY = 'myagent_stock_portfolio';

const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STOCK_STORAGE_KEY);
    if (saved) {
      try {
        setStocks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved stocks', e);
      }
    } else {
      // Default initial state
      setStocks([{ id: '1', name: '', code: '' }]);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever stocks change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stocks));
    }
  }, [stocks, isLoaded]);

  const addRow = () => {
    const newId = Date.now().toString();
    setStocks([...stocks, { id: newId, name: '', code: '' }]);
  };

  const removeRow = (id: string) => {
    if (stocks.length === 1) {
      // Don't remove the last row, just clear it
      setStocks([{ ...stocks[0], name: '', code: '' }]);
      return;
    }
    setStocks(stocks.filter(stock => stock.id !== id));
  };

  const updateStock = (id: string, field: keyof StockItem, value: string) => {
    setStocks(stocks.map(stock =>
      stock.id === id ? { ...stock, [field]: value } : stock
    ));
  };

  const handleAnalyze = () => {
    const validStocks = stocks.filter(s => s.name.trim() || s.code.trim());
    if (validStocks.length === 0) return;

    setIsAnalyzing(true);
    setShowResult(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 2000);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-background-primary p-6 lg:p-10 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full space-y-8"
      >
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4"
          >
            <FaChartLine className="text-3xl text-blue-600 dark:text-blue-400" />
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            포트폴리오 구성
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            보유하신 주식 정보를 입력해주세요. 입력된 정보는 브라우저에 자동 저장됩니다.
          </p>
        </div>

        {/* Stock Table Card */}
        <motion.div
          layout
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
          <div className="p-6 md:p-8">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 px-2">
              <div className="col-span-5 md:col-span-6">종목명</div>
              <div className="col-span-5 md:col-span-5">종목코드 / 티커</div>
              <div className="col-span-2 md:col-span-1 text-center">삭제</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {stocks.map((stock) => (
                  <motion.div
                    key={stock.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-5 md:col-span-6">
                      <input
                        type="text"
                        value={stock.name}
                        onChange={(e) => updateStock(stock.id, 'name', e.target.value)}
                        placeholder="예: 삼성전자"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="col-span-5 md:col-span-5">
                      <input
                        type="text"
                        value={stock.code}
                        onChange={(e) => updateStock(stock.id, 'code', e.target.value)}
                        placeholder="예: 005930"
                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 font-mono"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-center">
                      <button
                        onClick={() => removeRow(stock.id)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
              <button
                onClick={addRow}
                className="flex items-center justify-center px-6 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-colors w-full sm:w-auto"
              >
                <FaPlus className="mr-2" />
                종목 추가하기
              </button>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || stocks.every(s => !s.name.trim() && !s.code.trim())}
                className={`
                  relative flex items-center justify-center py-3.5 px-8 rounded-xl font-bold text-white shadow-lg transition-all duration-300 w-full sm:w-auto
                  ${isAnalyzing || stocks.every(s => !s.name.trim() && !s.code.trim())
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]'}
                `}
              >
                {isAnalyzing ? (
                  <>
                    <BiLoaderAlt className="animate-spin mr-2 text-xl" />
                    분석 중...
                  </>
                ) : (
                  <>
                    분석 시작하기
                    <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center"
          >
            <div className="flex flex-col items-center py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <FaChartLine className="text-4xl text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">분석 완료!</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                입력하신 {stocks.filter(s => s.name.trim() || s.code.trim()).length}개 종목에 대한 포트폴리오 분석 준비가 되었습니다.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-w-sm w-full text-left">
                <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">입력 데이터 미리보기</p>
                <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(stocks.filter(s => s.name || s.code), null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default StockPage;
