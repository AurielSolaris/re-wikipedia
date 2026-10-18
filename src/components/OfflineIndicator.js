import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useI18n, useOnlineStatus } from 'hooks'
import { WifiOffIcon } from './icons'

export const OfflineIndicator = ({ routeUrl }) => {
  const i18n = useI18n()
  const isOnline = useOnlineStatus()
  const [isVisible, setVisible] = useState()

  useEffect(() => {
    setVisible(!isOnline)
    if (!isOnline) {
      setTimeout(() => { setVisible(false) }, 3000)
    }
  }, [isOnline, routeUrl])

  if (isVisible) {
    return <div class='offline'><WifiOffIcon size={16} /><span>{i18n('offline-message')}</span></div>
  }
}
