import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import {
  leftSideBottomElements,
  leftSideElements
} from '../../constants/sidebar.constant'
import NavItem from '../common/NavItem'

function LeftSidebar() {
  const location = useLocation()
  const [openItems, setOpenItems] = useState<string[]>([])
  const navigate = useNavigate()

  const toggleItem = (itemName: string) => {
    setOpenItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    )
  }

  const handleItemClick = (item: (typeof leftSideElements)[0]) => {
    if (item.children) {
      toggleItem(item.name)
    } else if (item.to) {
      navigate(item.to)
    }
  }

  return (
    <div className='md:w-[var(--sidebar-width)] w-full overflow-x-hidden h-full flex-col border-r bg-background-primary border-border'>
      <div className='flex flex-col h-full w-full md:right-[calc(100vw-var(--sidebar-width))]'>
        <div className='flex justify-center items-center h-[var(--topbar-height)]  border-b border-border'></div>
        <div className='flex flex-col flex-1 mt-4 justify-between'>
          <div>
            {leftSideElements.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={item.to ? location.pathname === item.to : false}
                onClick={() => handleItemClick(item)}
                isOpen={openItems.includes(item.name ?? '')}
              />
            ))}
          </div>
          <div>
            {leftSideBottomElements.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={false}
                onClick={() => handleItemClick(item)}
                isOpen={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeftSidebar
