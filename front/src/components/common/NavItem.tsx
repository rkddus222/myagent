import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'
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
  const hasChildren = item.children && item.children.length > 0
  const path = useLocation().pathname
  if (path.startsWith('/settings/prompt')) {
    console.log('path', path)
  }
  return (
    <div className='px-1 bg-background-primary mb-2'>
      <div
        onClick={onClick}
        className={`${
          isActive && 'bg-background-secondary rounded-xl text-primary'
        } mb-1.5 flex items-center gap-4 py-3 bg-background-primary px-5 duration-150 cursor-pointer`}
      >
        <CustomIcon name={item.name as CustomIconsName} />
        <div className='text-base flex-1'>{item.title}</div>
        {hasChildren && (
          <div className='text-black'>
            {isOpen ? (
              <MdKeyboardArrowDown className='w-6 h-6' />
            ) : (
              <MdKeyboardArrowRight className='w-6 h-6' />
            )}
          </div>
        )}
      </div>
      {hasChildren && (
        <div
          className={`ml-6 border-b border-border bg-background-primary overflow-hidden ${isOpen && hasChildren ? 'max-h-80' : 'max-h-0'}`}
        >
          {item.children?.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              className={`${
                location.pathname === child.to && 'bg-background-secondary'
              } mb-1.5 flex items-center gap-4 py-2 pl-4 rounded-md`}
            >
              <div className=''>{child.title}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default NavItem
