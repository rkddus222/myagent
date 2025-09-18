import { useState, useRef } from 'react'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { Link, useLocation } from 'react-router-dom'

import { leftSideElementProps } from '../../constants/sidebar.constant'
import CustomIcon, { CustomIconsName } from './Icons'

interface NavItemProps {
  item: leftSideElementProps
  isActive: boolean
  onClick: () => void
  isOpen: boolean
}

function NavItem({ item, isActive, onClick, isOpen }: NavItemProps) {
  const [showSubmenu, setShowSubmenu] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasChildren = item.children && item.children.length > 0
  const location = useLocation()

  const handleContainerMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowSubmenu(true)
  }

  const handleContainerMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowSubmenu(false)
    }, 150)
  }

  return (
    <div
      className='relative'
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <div className='px-1 bg-background-primary mb-2'>
        <div
          onClick={onClick}
          className={`${
            isActive && 'bg-background-secondary rounded-xl text-primary'
          } mb-1.5 flex items-center gap-4 py-3 bg-background-primary px-5 duration-150 cursor-pointer hover:bg-background-secondary hover:rounded-xl`}
        >
          <CustomIcon name={item.name as CustomIconsName} />
          <div className='text-base flex-1'>{item.title}</div>
          {hasChildren && (
            <div className='text-black'>
              <MdKeyboardArrowRight className='w-6 h-6' />
            </div>
          )}
        </div>
      </div>

      {hasChildren && showSubmenu && (
        <div className='absolute left-full top-0 ml-1 bg-background-primary border border-border rounded-lg shadow-xl py-2 min-w-[200px] z-[9999]'>
          {item.children?.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className={`block px-4 py-2 text-sm hover:bg-background-secondary transition-colors duration-150 ${
                location.pathname === child.to ? 'bg-background-secondary text-primary' : ''
              }`}
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default NavItem
