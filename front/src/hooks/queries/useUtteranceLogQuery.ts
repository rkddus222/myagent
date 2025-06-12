import {
  getAllUtteranceLogs,
  filterUtteranceLogs,
  updateUtteranceLog,
  getUtteranceLogStats,
  downloadExcel,
  UtteranceLogFilter
} from '@apis/utteranceLogApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

export function useUtteranceLogQuery() {
  const [filters, setFilters] = useState<UtteranceLogFilter>({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const queryClient = useQueryClient();

  // 발화이력 조회
  const {
    data: utteranceLogs = [], // 기본값 설정으로 undefined 방지
    isLoading: isLogsLoading,
    isError: isLogsError,
    refetch: refetchLogs,
    error: logsError
  } = useQuery({
    queryKey: ['utteranceLogs', filters],
    queryFn: async () => {
      try {
        if (Object.keys(filters).filter(key => filters[key] !== undefined).length === 0) {
          return await getAllUtteranceLogs();
        } else {
          return await filterUtteranceLogs(filters);
        }
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast.error('발화이력을 불러오는데 실패했습니다.');
        return [];
      }
    }
  });

  // 통계 데이터 조회
  const {
    data: stats = {
      total_count: 0,
      unique_users: 0,
      error_count: 0,
      misrecognition_count: 0,
      unrelated_count: 0,
      completed_count: 0,
      in_progress_count: 0,
      feedback_count: 0,
      excluded_count: 0,
      hold_count: 0
    }, // 기본값으로 빈 통계 객체 제공
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
    error: statsError
  } = useQuery({
    queryKey: ['utteranceStats', filters],
    queryFn: async () => {
      try {
        return await getUtteranceLogStats(filters);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('통계 데이터를 불러오는데 실패했습니다.');
        return {
          total_count: 0,
          unique_users: 0,
          error_count: 0,
          misrecognition_count: 0,
          unrelated_count: 0,
          completed_count: 0,
          in_progress_count: 0,
          feedback_count: 0,
          excluded_count: 0,
          hold_count: 0
        };
      }
    }
  });

  // 발화이력 업데이트
  const { mutateAsync: updateLog, isPending: isUpdating } = useMutation({
    mutationFn: updateUtteranceLog,
    onSuccess: () => {
      toast.success('발화이력이 업데이트되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['utteranceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['utteranceStats'] });
    },
    onError: (error: any) => {
      toast.error(`업데이트 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
    }
  });

  // 필터 적용 - useCallback으로 메모이제이션
  const applyFilters = useCallback((newFilters: UtteranceLogFilter) => {
    setFilters(newFilters);
  }, []);

  // 필터 초기화 - useCallback으로 메모이제이션
  const resetFilters = useCallback(() => {
    setFilters({
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0]
    });
  }, []);

  // 엑셀 다운로드 - useCallback으로 메모이제이션
  const handleExcelDownload = useCallback(() => {
    if (utteranceLogs && utteranceLogs.length > 0) {
      try {
        downloadExcel(utteranceLogs);
        toast.success('엑셀 파일 다운로드를 시작합니다.');
      } catch (error) {
        console.error('Download error:', error);
        toast.error('다운로드 중 오류가 발생했습니다.');
      }
    } else {
      toast.warning('다운로드할 데이터가 없습니다.');
    }
  }, [utteranceLogs]);

  // 에러 발생 시 로그 출력
  if (isLogsError) {
    console.error('Logs error:', logsError);
  }
  
  if (isStatsError) {
    console.error('Stats error:', statsError);
  }

  return {
    utteranceLogs,
    stats,
    isLoading: isLogsLoading || isStatsLoading || isUpdating,
    isError: isLogsError || isStatsError,
    refetch: () => {
      refetchLogs();
      refetchStats();
    },
    updateLog,
    isUpdating,
    applyFilters,
    resetFilters,
    currentFilters: filters,
    handleExcelDownload
  };
}