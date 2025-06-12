import { Button, TextInput } from 'flowbite-react';
import { HiSave } from 'react-icons/hi';
import { UtteranceLog, UtteranceLogUpdate } from '@apis/utteranceLogApi';
import { useState } from 'react';

interface UtteranceDetailModalProps {
  utterance: UtteranceLog;
  onClose: () => void;
  onUpdate: (data: UtteranceLogUpdate) => Promise<void>;
}

const UtteranceDetailModal = ({ 
  utterance, 
  onClose, 
  onUpdate 
}: UtteranceDetailModalProps) => {
  const [form, setForm] = useState<UtteranceLogUpdate>({
    id: utterance.id,
    status: utterance.status,
    error_type: utterance.error_type || '',
    resolution_method: utterance.resolution_method || '',
    resolution_date: utterance.resolution_date || '',
    progress_status: utterance.progress_status
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-90vh overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
          발화이력 상세 정보
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">사용자 ID</p>
            <p className="font-medium text-gray-900 dark:text-white">{utterance.user_id}</p>
          </div>
          <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">발화일시</p>
            <p className="font-medium text-gray-900 dark:text-white">{utterance.utterance_datetime}</p>
          </div>
        </div>

        <div className="mb-4 bg-blue-50 dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">발화내역</p>
          <p className="font-medium p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">{utterance.utterance_content}</p>
        </div>

        <div className="mb-4 bg-blue-50 dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">조회날짜</p>
          <p className="font-medium text-gray-900 dark:text-white">{utterance.query_date || '-'}</p>
        </div>

        {utterance.sql_query && (
          <div className="mb-4 bg-blue-50 dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">SQL</p>
            <pre className="p-2 bg-white dark:bg-gray-600 rounded-lg overflow-auto text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
              {utterance.sql_query}
            </pre>
          </div>
        )}

        {utterance.respondent && (
          <div className="mb-4 bg-blue-50 dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">답변</p>
            <pre className="p-2 bg-white dark:bg-gray-600 rounded-lg overflow-auto text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
              {utterance.respondent}
            </pre>
          </div>
        )}

        {utterance.detail_url && (
          <div className="mb-4 bg-blue-50 dark:bg-gray-700 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">발화상세내역</p>
            <a
              href={utterance.detail_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {utterance.detail_url}
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            상태 업데이트
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">상태</label>
              <select
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="정상">정상</option>
                <option value="오류">오류</option>
                <option value="오인식">오인식</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">오류종류</label>
              <TextInput
                type="text"
                value={form.error_type || ''}
                onChange={(e) => handleChange('error_type', e.target.value)}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">처리현황</label>
              <select
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                value={form.progress_status}
                onChange={(e) => handleChange('progress_status', e.target.value)}
              >
                <option value="완료">완료</option>
                <option value="진행">진행</option>
                <option value="피드백">피드백</option>
                <option value="보류">보류</option>
                <option value="제외">제외</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">수정완료날짜</label>
              <TextInput
                type="date"
                value={form.resolution_date || ''}
                onChange={(e) => handleChange('resolution_date', e.target.value)}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">처리방법</label>
            <textarea
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              rows={3}
              value={form.resolution_method || ''}
              onChange={(e) => handleChange('resolution_method', e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" color="blue">
              <HiSave className="mr-2 h-5 w-5" />
              저장
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UtteranceDetailModal;