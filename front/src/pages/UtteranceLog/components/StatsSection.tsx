import { Card } from 'flowbite-react';
import { UtteranceLogStats } from '@apis/utteranceLogApi';

// 통계 카드 컴포넌트
const StatsCard = ({ title, value, colorScheme }: { 
  title: string; 
  value: number | string; 
  colorScheme: string;
}) => {
  // 색상 정의를 객체로 명시적 관리 (라이트모드/다크모드)
  const colorSchemes: Record<string, {
    border: string;
    text: string;
    bg: string;
    darkBorder: string;
    darkText: string;
    darkBg: string;
  }> = {
    blue: {
      border: "border-blue-600",
      text: "text-blue-700",
      bg: "bg-blue-50",
      darkBorder: "dark:border-blue-500",
      darkText: "dark:text-blue-400",
      darkBg: "dark:bg-gray-700"
    },
    indigo: {
      border: "border-indigo-600",
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      darkBorder: "dark:border-indigo-500",
      darkText: "dark:text-indigo-400",
      darkBg: "dark:bg-gray-700"
    },
    red: {
      border: "border-red-600",
      text: "text-red-700",
      bg: "bg-red-50",
      darkBorder: "dark:border-red-500",
      darkText: "dark:text-red-400",
      darkBg: "dark:bg-gray-700"
    },
    amber: {
      border: "border-amber-600",
      text: "text-amber-700",
      bg: "bg-amber-50",
      darkBorder: "dark:border-amber-500",
      darkText: "dark:text-amber-400",
      darkBg: "dark:bg-gray-700"
    },
    gray: {
      border: "border-gray-600",
      text: "text-gray-700",
      bg: "bg-gray-100",
      darkBorder: "dark:border-gray-400",
      darkText: "dark:text-gray-300",
      darkBg: "dark:bg-gray-700"
    },
    green: {
      border: "border-green-600",
      text: "text-green-700",
      bg: "bg-green-50",
      darkBorder: "dark:border-green-500",
      darkText: "dark:text-green-400",
      darkBg: "dark:bg-gray-700"
    },
    orange: {
      border: "border-orange-600",
      text: "text-orange-700",
      bg: "bg-orange-50",
      darkBorder: "dark:border-orange-500",
      darkText: "dark:text-orange-400",
      darkBg: "dark:bg-gray-700"
    },
    purple: {
      border: "border-purple-600",
      text: "text-purple-700",
      bg: "bg-purple-50",
      darkBorder: "dark:border-purple-500",
      darkText: "dark:text-purple-400",
      darkBg: "dark:bg-gray-700"
    }
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.blue;

  return (
    <div className={`${colors.bg} ${colors.darkBg} p-4 rounded-lg border-l-4 ${colors.border} ${colors.darkBorder} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{title}</p>
      <p className={`text-2xl font-bold ${colors.text} ${colors.darkText} mt-1`}>{value}</p>
    </div>
  );
};

interface StatsSectionProps {
  stats: UtteranceLogStats;
}

const StatsSection = ({ stats }: StatsSectionProps) => {
  return (
    <Card className="mb-6 dark:bg-gray-800">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">발화이력 통계</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard title="누적 총 질의수" value={stats.total_count} colorScheme="blue" />
        <StatsCard title="누적 사용자 수" value={stats.unique_users} colorScheme="indigo" />
        <StatsCard title="오류 질의건수" value={stats.error_count} colorScheme="red" />
        <StatsCard title="오인식 질의건수" value={stats.misrecognition_count} colorScheme="amber" />
        <StatsCard title="미관련 질의건수" value={stats.unrelated_count} colorScheme="gray" />
        <StatsCard title="처리 완료 건수" value={stats.completed_count} colorScheme="green" />
        <StatsCard title="진행 중인 건수" value={stats.in_progress_count} colorScheme="blue" />
        <StatsCard title="피드백 필요 건수" value={stats.feedback_count} colorScheme="orange" />
        <StatsCard title="제외 건수" value={stats.excluded_count} colorScheme="purple" />
        <StatsCard title="보류 건수" value={stats.hold_count} colorScheme="gray" />
      </div>
    </Card>
  );
};

export default StatsSection;