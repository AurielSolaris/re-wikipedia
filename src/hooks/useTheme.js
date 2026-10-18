import { useState, useEffect } from 'preact/hooks'
import { getTheme, resolveTheme, setTheme, subscribeTheme } from 'utils'

/**
 * Reads the theme preference ('auto' | 'light' | 'dark') and keeps every
 * component in sync when it is changed in Settings or by the OS (in 'auto').
 *
 * Returns [theme, resolvedTheme, setTheme].
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState(getTheme)

  useEffect(() => {
    return subscribeTheme(setThemeState)
  }, [])

  return [theme, resolveTheme(theme), setTheme]
}
