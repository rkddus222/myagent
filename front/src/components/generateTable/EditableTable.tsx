import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { Button, Table } from 'flowbite-react'
import React from 'react'

import { useDragAndDrop } from '../../hooks/generateTable/useDragAndDrop'
import { SortableHeaderCell } from './SortableHeaderCell'

interface EditableTableProps {
  columns: string[]
  tableData: any[]
  setColumns: (columns: string[]) => void
  setTableData: (data: any[]) => void
  handleColumnNameChange: (index: number, newName: string) => void
  handleDeleteColumn: (index: number) => void
  setIsModifyDirty: (value: boolean) => void; // ✅ 추가
  handleTableDataChange: (
    rowIndex: number,
    columnName: string,
    value: string
  ) => void
  addTableRow: () => void
  handleDeleteRow: (rowIndex: number) => void // ✅ 추가
}

export const EditableTable: React.FC<EditableTableProps> = ({
  columns,
  tableData,
  setColumns,
  setTableData,
  handleColumnNameChange,
  handleDeleteColumn,
  handleTableDataChange,
  addTableRow,
  handleDeleteRow, // ✅ 추가
  setIsModifyDirty, // ✅ 추가
}) => {
  const {
    sensors,
    handleDragEnd,
    closestCenter,
    horizontalListSortingStrategy
  } = useDragAndDrop()

  return (
    <div>
      <div className='relative'>
        {/* 🔹 좌우 스크롤 힌트 */}
        <div className='absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-10' />
        <div className='absolute top-0 right-0 w-4 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10' />

        <div className='overflow-x-scroll border rounded shadow-sm bg-white'>
          <Table className='min-w-[1050px] border-collapse border-spacing-0 bg-white'>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                handleDragEnd(
                  event,
                  columns,
                  tableData,
                  setColumns,
                  setTableData
                );
                setIsModifyDirty(true); // ✅ 드래그 후 dirty 표시
              }}
            >
              <SortableContext
                items={columns}
                strategy={horizontalListSortingStrategy}
              >
                <Table.Head className='bg-gray-50 border-b border-gray-300'>
                  {/* 삭제 버튼용 칼럼 (완전 고정) */}
                  <Table.HeadCell className='w-[80px] min-w-[80px] max-w-[80px] text-center' />

                  {/* 데이터 칼럼 */}
                  {columns.length > 0 ? (
                    columns.map((column, index) => (
                      <SortableHeaderCell
                        key={`${index}-${column}`}
                        column={column}
                        index={index}
                        onDelete={() => handleDeleteColumn(index)}
                        onRename={handleColumnNameChange}
                      />
                    ))
                  ) : (
                    <Table.HeadCell className='min-w-[300px] max-w-[800px]' />
                  )}
                </Table.Head>
              </SortableContext>
            </DndContext>

            <Table.Body className='divide-y'>
              {tableData.map((row, rowIndex) => (
                <Table.Row key={`row-${rowIndex}`} className='bg-white'>
                  {/* 삭제 버튼 셀 */}
                  <Table.Cell className='w-[80px] min-w-[80px] max-w-[80px] text-center align-middle border-r'>
                    <div className='flex items-center justify-center w-full h-full'>
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        className='w-[25px] h-[25px] flex items-center justify-center rounded-full bg-red-500 text-white font-bold text-lg leading-none hover:bg-red-600 transition'
                      >
                        -
                      </button>
                    </div>
                  </Table.Cell>

                  {/* 데이터 셀 */}
                  {columns.length > 0 ? (
                    columns.map((column, colIndex) => (
                      <Table.Cell
                        key={`cell-${rowIndex}-${colIndex}`}
                        className='px-2 py-2 border-r border-gray-200 align-middle'
                      >
                        <input
                          type='text'
                          value={row[column] || ''}
                          onChange={(e) =>
                            handleTableDataChange(
                              rowIndex,
                              column,
                              e.target.value
                            )
                          }
                          className='border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400'
                        />
                      </Table.Cell>
                    ))
                  ) : (
                    <Table.Cell className='min-w-[300px] max-w-[800px] border-r border-gray-200' />
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>

      <Button onClick={addTableRow} color='light' className='mt-2'>
        행 추가
      </Button>
    </div>
  )
}
