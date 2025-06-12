import CustomIcons from '@components/common/Icons'

import { useEffect, useState } from 'react'
import ToggleTheme from '../ToggleTheme'
import LeftSidebar from './LeftSidebar'
import { useNavigate } from 'react-router-dom'

export default function TopNavigationBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [navigate])

  return (
    <div className='px-4 mx-auto fixed z-50 left-0 shadow-sm right-0 h-[var(--topbar-height)] border-b border-border flex items-center justify-between md:px-8 bg-background-primary'>
      <div className='flex md:hidden'>
        <CustomIcons
          name='menu'
          className='text-2xl'
          onClick={handleToggleMobileMenu}
        />
      </div>
      <h1 className='text-lg md:text-2xl font-semibold'>My Agent</h1>
      <div className='hidden md:flex items-center gap-3'>

        <ToggleTheme />

      </div>
      <div
        className={`fixed transition-[max-width] duration-300 ease-in-out top-[var(--topbar-height)] left-0 bg-background-primary w-full overflow-x-hidden h-full ${isMobileMenuOpen ? 'max-w-full' : 'max-w-0'}`}
      >
        <LeftSidebar />
      </div>
    </div>
  )
}
