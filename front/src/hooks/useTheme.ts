import useThemeStore from '@stores/useThemeStore'

import { useEffect } from 'react'

const useTheme = () => {
  const { theme, setTheme } = useThemeStore()
  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return {
    isDark: theme === 'dark',
    toggleDarkMode
  }
}

export default useTheme
