import { h } from 'preact'
import { route } from 'preact-router'
import { useRef, useEffect } from 'preact/hooks'
import { useNavigation, useI18n, useSoftkey, usePopup, useTouchSupport, useTheme } from 'hooks'
import { ListView } from './ListView'
import { AboutApp } from './AboutApp'
import { AboutWikipedia } from './AboutWikipedia'
import { PrivacyTerms } from './PrivacyTerms'
import { Feedback } from './Feedback'
import {
  LanguagesIcon, TouchIcon, FeedbackIcon, InfoIcon, AppIcon, PrivacyIcon,
  SunIcon, MoonIcon, SunMoonIcon, BookmarkIcon
} from './icons'
import { goto, openExternal, nextTheme, getTheme, getTouchSupport } from 'utils'

export const Settings = () => {
  const containerRef = useRef()
  const listRef = useRef()
  const i18n = useI18n()
  const [touchSupport, setTouchSupport] = useTouchSupport()
  const [theme, , setTheme] = useTheme()
  const [showAboutApp] = usePopup(AboutApp, { mode: 'fullscreen' })
  const [showAboutWikipedia] = usePopup(AboutWikipedia, { mode: 'fullscreen' })
  const [showFeedback] = usePopup(Feedback, { mode: 'fullscreen' })
  const [showPrivacyTerms] = usePopup(PrivacyTerms, { mode: 'fullscreen' })

  const onKeyCenter = () => {
    const { index } = getCurrent()
    const item = items[index]

    // open link
    if (item.link) {
      openExternal(item.link)
    } else if (item.path) {
      route(item.path)
    } else if (item.action) {
      item.action()
    }
  }

  const onAboutAppSelected = () => {
    showAboutApp()
  }

  const onAboutWikipediaSelected = () => {
    showAboutWikipedia()
  }

  const onFeedbackSelected = () => {
    showFeedback()
  }

  const onPrivacyTermsSelected = () => {
    showPrivacyTerms()
  }

  useSoftkey('Settings', {
    left: i18n('softkey-close'),
    onKeyLeft: () => goto.back(),
    center: i18n('centerkey-select'),
    onKeyCenter,
    onKeyBackspace: () => goto.back()
  }, [theme, touchSupport])

  const [, setNavigation, getCurrent] = useNavigation('Settings', containerRef, listRef, 'grid')

  useEffect(() => {
    setNavigation(0)
  }, [])

  // Read the preference from the store itself: the softkey config below is only
  // re-dispatched when a preference actually changes, so handlers closing over
  // the rendered values would go stale and could only ever apply one change.
  const onTouchSupportToggle = () => {
    setTouchSupport(!getTouchSupport())
  }

  const onThemeToggle = () => {
    setTheme(nextTheme(getTheme()))
  }

  const themeIcon = theme === 'dark' ? MoonIcon : theme === 'light' ? SunIcon : SunMoonIcon

  const items = [
    { title: i18n('settings-saved'), icon: BookmarkIcon, path: '/saved' },
    { title: i18n('settings-language'), icon: LanguagesIcon, path: '/language' },
    { title: i18n('settings-theme'), description: i18n(`theme-${theme}`), icon: themeIcon, action: onThemeToggle },
    { title: i18n('settings-touch-support'), icon: TouchIcon, switch: touchSupport, action: onTouchSupportToggle },
    { title: i18n('settings-help-feedback'), icon: FeedbackIcon, action: onFeedbackSelected },
    { title: i18n('settings-about-wikipedia'), icon: InfoIcon, action: onAboutWikipediaSelected },
    // @todo will have this soon and don't delete it from the language json
    // { title: i18n('settings-rate') },
    { title: i18n('settings-about-app'), icon: AppIcon, action: onAboutAppSelected },
    { title: i18n('settings-privacy-terms'), icon: PrivacyIcon, action: onPrivacyTermsSelected }
  ]

  return <div class='settings' ref={containerRef}>
    <ListView
      header={i18n('header-settings')}
      items={items}
      containerRef={listRef}
    />
  </div>
}
