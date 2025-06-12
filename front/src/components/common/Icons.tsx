import {
  MdClose,
  MdMenu,
  MdOutlineBook,
  MdOutlineCheckCircle,
  MdOutlineDarkMode,
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineLightMode,
  MdOutlineLogout,
  MdOutlinePlayArrow,
  MdOutlineQuestionAnswer,
  MdOutlineSave,
  MdOutlineSettings,
  MdSearch
} from 'react-icons/md'

const IconList = {
  close: <MdClose />,
  settings: <MdOutlineSettings />,
  menu: <MdMenu />,
  search: <MdSearch />,
  dashboard: <MdOutlineBook />,
  prompt: <MdOutlineQuestionAnswer />,
  active: <MdOutlineCheckCircle />,
  execute: <MdOutlinePlayArrow />,
  save: <MdOutlineSave />,
  trash: <MdOutlineDelete />,
  moon: <MdOutlineDarkMode />,
  sun: <MdOutlineLightMode />,
  schema: <MdOutlineBook />,
  logout: <MdOutlineLogout />,
  edit: <MdOutlineEdit />
}

export type CustomIconsName = keyof typeof IconList
interface CustomIconsProps extends React.HTMLAttributes<HTMLDivElement> {
  name: CustomIconsName
  isBox?: boolean // 박스 사용 여부
  className?: string
  description?: string
  onClick?: () => void
}
export default function CustomIcons({
  name,
  isBox = false,
  className,
  description,
  onClick,
  ...props
}: CustomIconsProps) {
  const icon = <div className={className}>{IconList[name]}</div>

  return (
    <div className='relative group flex'>
      <div
        className={`${
          isBox && 'bg-background-secondary border border-border rounded-xl'
        } inline-block ${className}`}
        {...props}
        onClick={onClick}
      >
        {icon ? icon : <div className='w-6 h-6'></div>}
      </div>
      {description && (
        <div className='text-base absolute invisible group-hover:visible left-full ml-2 px-2 py-1 bg-tertiary text-background-primary rounded whitespace-nowrap z-50 top-1/2 -translate-y-1/2'>
          {description}
        </div>
      )}
    </div>
  )
}
