
import React, { useState, useEffect } from 'react';
import axiosInstance from '@/apis/axiosInstance';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FinancialAnalysisPageProps { }

const FinancialAnalysisPage: React.FC<FinancialAnalysisPageProps> = () => {
    const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [loading, setLoading] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('financial_target_companies');
        if (saved) {
            try {
                setTargetCompanies(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved companies", e);
            }
        }
    }, []);

    // Save to localStorage whenever list changes
    useEffect(() => {
        localStorage.setItem('financial_target_companies', JSON.stringify(targetCompanies));
    }, [targetCompanies]);

    const addCompany = () => {
        if (inputValue.trim() && !targetCompanies.includes(inputValue.trim())) {
            setTargetCompanies([...targetCompanies, inputValue.trim()]);
            setInputValue('');
        }
    };

    const removeCompany = (company: string) => {
        setTargetCompanies(targetCompanies.filter(c => c !== company));
    };

    const handleAnalyze = async () => {
        if (targetCompanies.length === 0) return;

        setLoading(true);
        setAnalysisResult('');

        try {
            const response = await axiosInstance.post('/api/financial/analyze', {
                target_companies: targetCompanies
            });
            setAnalysisResult(response.data.answer);
        } catch (error) {
            console.error("Analysis failed", error);
            setAnalysisResult("분석 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-primary p-6 text-primary">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white flex items-center gap-3">
                    <span className="text-blue-500">💰</span> 주식 분석 에이전트
                </h1>

                {/* Input Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">분석 대상 종목 관리</h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCompany()}
                            placeholder="종목명 또는 코드 입력 (예: 삼성전자, 005930)"
                            className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        />
                        <button
                            onClick={addCompany}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                        >
                            추가
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                        {targetCompanies.map(company => (
                            <span key={company} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 rounded-lg text-sm font-medium flex items-center gap-2 border border-blue-200 dark:border-blue-700 animate-fade-in-up">
                                {company}
                                <button
                                    onClick={() => removeCompany(company)}
                                    className="hover:text-red-500 font-bold p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        {targetCompanies.length === 0 && (
                            <span className="text-gray-400 text-sm py-2">분석할 종목을 추가해주세요.</span>
                        )}
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || targetCompanies.length === 0}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform duration-200 ${loading || targetCompanies.length === 0
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white hover:-translate-y-1 hover:shadow-xl'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                데이터 수집 및 분석 중...
                            </span>
                        ) : '종합 분석 요청'}
                    </button>
                </div>

                {/* Result Section */}
                {analysisResult && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                📊 분석 리포트
                            </h2>
                        </div>

                        <div className="p-8">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-blue-600 dark:text-blue-400" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2 text-gray-800 dark:text-gray-200" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
                                    p: ({ node, ...props }) => <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg" {...props} />,
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
                                        </div>
                                    ),
                                    thead: ({ node, ...props }) => <thead className="bg-gray-50 dark:bg-gray-800" {...props} />,
                                    tbody: ({ node, ...props }) => <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
                                    tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" {...props} />,
                                    th: ({ node, ...props }) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />,
                                    td: ({ node, ...props }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-r-lg my-4" {...props} />,
                                    code: ({ node, className, children, ...props }) => (
                                        <code className="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 text-sm font-mono text-pink-500" {...props}>
                                            {children}
                                        </code>
                                    ),
                                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                                }}
                            >
                                {analysisResult}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialAnalysisPage;
