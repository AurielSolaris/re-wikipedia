import { useState, useEffect } from 'preact/hooks'
import { getTouchSupport, setTouchSupport, subscribeTouchSupport } from 'utils'

/**
 * Reads the touch/click support preference and keeps every component in sync
 * when it is toggled from Settings.
 *
 * Returns [enabled, setEnabled].
 */
export const useTouchSupport = () => {
  const [enabled, setEnabled] = useState(getTouchSupport)

  useEffect(() => {
    return subscribeTouchSupport(setEnabled)
  }, [])

  return [enabled, setTouchSupport]
}
