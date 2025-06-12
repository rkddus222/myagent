import { Button, Card, TextInput } from 'flowbite-react';
import { HiFilter, HiRefresh } from 'react-icons/hi';
import { UtteranceLogFilter } from '@apis/utteranceLogApi';

interface FilterSectionProps {
  filterValues: UtteranceLogFilter;
  handleFilterChange: (key: string, value: string) => void;
  handleApplyFilter: () => void;
  resetFilters: () => void;
  isLoading: boolean;
}

const FilterSection = ({
  filterValues,
  handleFilterChange,
  handleApplyFilter,
  resetFilters,
  isLoading
}: FilterSectionProps) => {
  return (
    <Card className="mb-6 dark:bg-gray-800">
      <h3 className="text-base font-semibold mb-3 text-gray-800 dark:text-white">발화일시 기간</h3>
      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="w-full md:w-1/3">
          <div className="flex items-center gap-2">
            <TextInput
              type="date"
              value={filterValues.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <span className="text-gray-500 dark:text-gray-300 font-medium">~</span>
            <TextInput
              type="date"
              value={filterValues.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <Button color="blue" onClick={handleApplyFilter} disabled={isLoading}>
          <HiFilter className="mr-2 h-5 w-5" />
          조회
        </Button>
        <Button 
          color="light" 
          onClick={resetFilters} 
          disabled={isLoading} 
          className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <HiRefresh className="mr-2 h-5 w-5" />
          필터 초기화
        </Button>
      </div>
    </Card>
  );
};

export default FilterSection;