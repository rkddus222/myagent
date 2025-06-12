import { useState } from 'react'
import FilterSection from './components/FilterSection'
import LogTable from './components/LogTable'
import StatsSection from './components/StatsSection'
import { UtteranceLog } from '@apis/utteranceLogApi'

export default function UtteranceLogPage() {
  const [selectedLog, setSelectedLog] = useState<UtteranceLog | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">발화 로그</h1>
      <FilterSection />
      <StatsSection />
      <LogTable onSelectLog={setSelectedLog} />
    </div>
  )
} 