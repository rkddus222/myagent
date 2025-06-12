// components/generateTable/TableSection.tsx
import { Button, Card } from 'flowbite-react'
import React from 'react'

import { EditableTable } from './EditableTable'
import { ReadOnlyTable } from './ReadOnlyTable'

interface TableSectionProps {
  columns: string[]
  tableData: any[]
  isManualInput: boolean
  isApplyingSql: boolean
  isQuestionDirty: boolean
  isModifyDirty: boolean
  isSqlGenerated: boolean
  setColumns: (columns: string[]) => void
  setIsModifyDirty: (value: boolean) => void
  setTableData: (data: any[]) => void
  handleColumnNameChange: (index: number, newName: string) => void
  handleDeleteColumn: (index: number) => void
  handleTableDataChange: (
    rowIndex: number,
    columnName: string,
    value: string
  ) => void
  addTableRow: () => void
  handleAddColumn: () => void
  handleApplySql: () => void
  handleManualInput: () => void
  handleDeleteRow: (rowIndex: number) => void
}

export const TableSection: React.FC<TableSectionProps> = ({
  columns,
  tableData,
  isManualInput,
  isApplyingSql,
  isModifyDirty,
  isSqlGenerated,
  setIsModifyDirty,
  setColumns,
  setTableData,
  handleColumnNameChange,
  handleDeleteColumn,
  handleTableDataChange,
  addTableRow,
  handleAddColumn,
  handleApplySql,
  handleManualInput,
  handleDeleteRow
}) => {
  return (
    <Card>
      <div className='flex justify-between items-center px-4 pt-4'>
        <h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
          표
        </h5>
        {isManualInput && (
          <button
            onClick={handleAddColumn}
            className='bg-gray-100 border border-gray-300 text-sm text-blue-700 px-3 py-1 rounded hover:bg-gray-200 shadow-sm'
          >
            ➕ 열 추가
          </button>
        )}
      </div>

      <div className='p-4'>
        <div className='flex flex-col space-y-4'>
          {isManualInput ? (
            <EditableTable
              columns={columns}
              tableData={tableData}
              setColumns={setColumns}
              setTableData={setTableData}
              handleColumnNameChange={handleColumnNameChange}
              handleDeleteColumn={handleDeleteColumn}
              handleTableDataChange={handleTableDataChange}
              addTableRow={addTableRow}
              handleDeleteRow={handleDeleteRow}
              setIsModifyDirty={setIsModifyDirty}
            />
          ) : (
            <ReadOnlyTable
              columns={columns}
              tableData={tableData}
            />
          )}

          <div className='flex justify-center space-x-4'>
            <Button
              onClick={handleApplySql}
              disabled={
                !isSqlGenerated ||
                isApplyingSql ||
                !isManualInput ||
                !isModifyDirty
              }
            >
              {isApplyingSql ? '반영 중...' : 'SQL 재생성하기'}
            </Button>
            <Button
              onClick={handleManualInput}
              color='light'
              disabled={!isSqlGenerated}
            >
              {isManualInput ? '취소하기' : '수기로 입력하기'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
