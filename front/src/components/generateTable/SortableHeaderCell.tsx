import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'

interface SortableHeaderCellProps {
  column: string
  index: number
  onDelete: () => void
  onRename: (index: number, newName: string) => void
}

export const SortableHeaderCell: React.FC<SortableHeaderCellProps> = ({
    column,
    index,
    onDelete,
    onRename
  }) => {
    const [localColumnName, setLocalColumnName] = useState(column)
  
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column })
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    }
  
    useEffect(() => {
      setLocalColumnName(column)
    }, [column])
  
    const handleCommitRename = () => {
      if (localColumnName !== column) {
        onRename(index, localColumnName)
      }
    }
  
    return (
      <th ref={setNodeRef} style={style} className="min-w-[200px] px-1 py-2">
        <div className="flex items-center border rounded px-2 py-1 bg-white shadow-sm gap-2 w-full h-full">
          {/* 드래그 핸들 */}
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 flex-shrink-0"
            title="드래그로 열 순서 변경"
          >
            ☰
          </span>
  
          {/* 입력창 */}
          <input
            type="text"
            value={localColumnName}
            onChange={(e) => setLocalColumnName(e.target.value)}
            onBlur={handleCommitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
            // flex-1로 반응형 확장
          />
  
          {/* 삭제 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-gray-500 hover:text-red-600 text-sm px-2 flex-shrink-0"
            title="열 삭제"
          >
            ✖️
          </button>
        </div>
      </th>
    )
  }
  