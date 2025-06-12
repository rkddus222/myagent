import useTheme from '../hooks/useTheme'
import CustomIcons from './common/Icons'

const ToggleTheme = () => {
  const { isDark, toggleDarkMode } = useTheme()

  return (
    <button
      onClick={toggleDarkMode}
      className={`w-16 h-8 rounded-full shadow-lg border border-background-tertiary relative`}
    >
      <div
        className={`w-8 h-8 rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center text-white
          ${isDark ? 'translate-x-8 bg-gray-500' : 'translate-x-0 bg-yellow-300'}
        `}
      >
        {isDark ? <CustomIcons name='moon' /> : <CustomIcons name='sun' />}
      </div>
    </button>
  )
}

export default ToggleTheme
