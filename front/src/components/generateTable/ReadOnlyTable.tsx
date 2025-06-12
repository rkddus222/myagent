import { Table } from 'flowbite-react'
import React from 'react'

interface ReadOnlyTableProps {
  columns: string[]
  tableData: any[]
}

export const ReadOnlyTable: React.FC<ReadOnlyTableProps> = ({
  columns,
  tableData
}) => {
  return (
    <div>
      <Table>
        <Table.Head>
          {columns.map((column) => (
            <Table.HeadCell key={column}>{column}</Table.HeadCell>
          ))}
        </Table.Head>
        <Table.Body className='divide-y'>
          {tableData.map((row, rowIndex) => (
            <Table.Row
              key={rowIndex}
              className='bg-white dark:border-gray-700 dark:bg-gray-800'
            >
              {columns.map((column) => (
                <Table.Cell key={`${rowIndex}-${column}`}>
                  {row[column]}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

