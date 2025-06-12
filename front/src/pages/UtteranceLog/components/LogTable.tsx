import { Button, Card, Spinner, Table, TextInput } from 'flowbite-react';
import { HiSearch, HiDownload } from 'react-icons/hi';
import { UtteranceLog } from '@apis/utteranceLogApi';
import { memo } from 'react';

interface LogTableProps {
  isLoading: boolean;
  displayedLogs: UtteranceLog[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  handleResetSearch: () => void;
  isSearchApplied: boolean;
  handleUtteranceClick: (utterance: UtteranceLog) => void;
  handleExcelDownload: () => void;
}

// 테이블 행 컴포넌트 - 메모이제이션으로 불필요한 리렌더링 방지
const TableRow = memo(({ log, onClick }: { log: UtteranceLog; onClick: () => void }) => {
  return (
    <Table.Row
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-700"
      onClick={onClick}
    >
      <Table.Cell className="font-medium dark:text-white">{log.user_id}</Table.Cell>
      <Table.Cell className="dark:text-gray-300">{log.utterance_datetime}</Table.Cell>
      <Table.Cell className="truncate max-w-xs dark:text-gray-300">{log.utterance_content}</Table.Cell>
      <Table.Cell className="dark:text-gray-300">{log.query_date || '-'}</Table.Cell>
      <Table.Cell className="dark:text-gray-300">{log.environment || '-'}</Table.Cell>
      <Table.Cell className="dark:text-gray-300">{log.category_code || '-'}</Table.Cell>
      <Table.Cell className="dark:text-gray-300">{log.detail_code || '-'}</Table.Cell>
      <Table.Cell>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          log.status === '정상' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
          log.status === '오류' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
          'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
        }`}>
          {log.status}
        </span>
      </Table.Cell>
      <Table.Cell className="dark:text-gray-300">{log.error_type || '-'}</Table.Cell>
      <Table.Cell className="dark:text-gray-300">{log.resolution_date || '-'}</Table.Cell>
      <Table.Cell>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          log.progress_status === '완료' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
          log.progress_status === '진행' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
          log.progress_status === '피드백' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 
          log.progress_status === '보류' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {log.progress_status}
        </span>
      </Table.Cell>
    </Table.Row>
  );
});

TableRow.displayName = 'TableRow';

// 테이블 헤더 컴포넌트
const TableHeader = () => (
  <Table.Head className="dark:bg-gray-700">
    <Table.HeadCell className="dark:text-white">사용자 ID</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">발화일시</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">발화내역</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">조회날짜</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">환경</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">분류코드</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">상세코드</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">상태</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">오류종류</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">수정완료날짜</Table.HeadCell>
    <Table.HeadCell className="dark:text-white">처리현황</Table.HeadCell>
  </Table.Head>
);

const LogTable = ({
  isLoading,
  displayedLogs,
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleResetSearch,
  isSearchApplied,
  handleUtteranceClick,
  handleExcelDownload
}: LogTableProps) => {
  return (
    <Card className="dark:bg-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">발화이력 목록</h2>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2 w-full md:w-auto">
            <TextInput
              type="text"
              placeholder="사용자ID, 발화내역, 상세코드 등..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Button color="blue" onClick={handleSearch}>
              <HiSearch className="mr-2 h-5 w-5" />
              검색
            </Button>
            <Button
              color="light"
              onClick={handleResetSearch}
              disabled={!isSearchApplied}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            >
              초기화
            </Button>
          </div>
          <Button
            color="green"
            onClick={handleExcelDownload}
            disabled={isLoading || displayedLogs.length === 0}
          >
            <HiDownload className="mr-2 h-5 w-5" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

      <div className="mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
          총 {displayedLogs.length}건
          {isSearchApplied && ` (검색결과)`}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table hoverable className="dark:border-gray-700">
            <TableHeader />
            <Table.Body className="divide-y dark:divide-gray-700">
              {displayedLogs.length > 0 ? (
                displayedLogs.map((log) => (
                  <TableRow 
                    key={log.id} 
                    log={log} 
                    onClick={() => handleUtteranceClick(log)} 
                  />
                ))
              ) : (
                <Table.Row className="dark:bg-gray-800 dark:border-gray-700">
                  <Table.Cell colSpan={11} className="text-center py-6 dark:text-gray-300">
                    {isSearchApplied ? "검색 결과가 없습니다." : "데이터가 없습니다."}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default LogTable;