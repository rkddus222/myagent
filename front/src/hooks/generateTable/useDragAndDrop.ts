// hooks/useDragAndDrop.ts
import {
    DragEndEvent,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors
  } from '@dnd-kit/core'
  import { horizontalListSortingStrategy } from '@dnd-kit/sortable'
  
  export const useDragAndDrop = () => {
    const sensors = useSensors(useSensor(PointerSensor))
  
    const handleDragEnd = (
      event: DragEndEvent,
      columns: string[],
      tableData: any[],
      setColumns: (columns: string[]) => void,
      setTableData: (data: any[]) => void
    ) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
  
      const oldIndex = columns.indexOf(active.id as string)
      const newIndex = columns.indexOf(over.id as string)
  
      const newColumns = [...columns]
      const moved = newColumns.splice(oldIndex, 1)[0]
      newColumns.splice(newIndex, 0, moved)
  
      const newTableData = tableData.map((row) => {
        const reorderedRow: Record<string, any> = {}
        newColumns.forEach((col) => {
          reorderedRow[col] = row[col]
        })
        return reorderedRow
      })
  
      setColumns(newColumns)
      setTableData(newTableData)
    }
  
    return {
      sensors,
      handleDragEnd,
      closestCenter,
      horizontalListSortingStrategy
    }
  }
  