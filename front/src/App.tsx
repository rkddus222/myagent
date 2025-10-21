import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useThemeStore } from '@/stores/themeStore'

import LeftSidebar from './components/ui/LeftSidebar'
import TopNavigationBar from './components/ui/TopNavigationBar'
import { NotFound, JsonPage } from './pages'
import Nl2sqlPage from '@pages/Llm/Nl2sqlPage'
import RespondentPage from '@pages/Llm/RespondentPage'
import HelpPage from '@pages/Llm/HelpPage'
import DataFrameConverter from '@pages/DataFrame/DataFrameConverter'
import TicTacToePage from '@pages/TicTacToePage'
import GomokuPage from '@pages/Gomoku/GomokuPage'
import AiNewsPage from '@pages/AiNews/AiNewsPage'
import TestPage from '@pages/Test/TestPage'

const Layout = () => {
  const { isDarkMode } = useThemeStore()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className='flex w-full h-screen bg-background-secondary text-primary'>
      <div className='md:flex hidden'>
        <LeftSidebar />
      </div>
      <div
        className='flex-1 h-screen flex flex-col overflow-y-auto'
        style={{ scrollbarWidth: 'none' }}
      >
        <TopNavigationBar />
        <div className='flex-1 bg-background-primary pt-[var(--topbar-height)]'>
          <Routes>
            <Route path='/' element={<Navigate to='/help' />} />
            <Route path='/json' element={<JsonPage />} />
            <Route path='/help' element={<HelpPage />} />
            <Route path='/nl2sql' element={<Nl2sqlPage />} />
            <Route path='/respondent' element={<RespondentPage />} />
            <Route path='/dataframe-converter' element={<DataFrameConverter />} />
            <Route path='/tictactoe' element={<TicTacToePage />} />
            <Route path='/gomoku' element={<GomokuPage />} />
            <Route path='/ai-news' element={<AiNewsPage />} />
            <Route path='/test' element={<TestPage />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <>
      <Layout />
      <ToastContainer position='bottom-right' />
    </>
  )
}

export default App
