// Theme preference: 'auto' (follow the OS), 'light' or 'dark'.
//
// State lives in the ReScript preference store (src/res/Preference.res); all
// this module has to do is keep the painted result in sync: the `data-theme`
// attribute, the `color-scheme` property and the browser chrome
// (`theme-color`). The colour tokens in style/tokens.scss already expose
// `[data-theme='light'|'dark']` overrides that win over the
// prefers-color-scheme media query.

import { createPreference } from './preference'

export const THEMES = ['auto', 'light', 'dark']

const LIGHT_COLOR = '#ffffff'
const DARK_COLOR = '#0d1117'

const preference = createPreference({
  key: 'theme',
  values: THEMES,
  defaultValue: 'auto'
})

let metaCache = null

const prefersDark = () => {
  try {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  } catch (e) {
    return false
  }
}

export const getTheme = preference.get

// The theme that is actually painted, resolving 'auto' against the OS.
export const resolveTheme = theme => {
  const value = theme || getTheme()
  return value === 'auto' ? (prefersDark() ? 'dark' : 'light') : value
}

export const nextTheme = theme => {
  const current = theme || getTheme()
  return THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
}

const getMetas = () => {
  if (metaCache === null) {
    metaCache = [].map.call(document.querySelectorAll('meta[name="theme-color"]'), meta => ({
      el: meta,
      media: meta.getAttribute('media'),
      content: meta.getAttribute('content')
    }))
  }
  return metaCache
}

// With an explicit choice there is no OS to defer to, so both meta tags are
// collapsed onto the resolved colour; with 'auto' their media queries are
// restored.
const updateThemeColor = resolved => {
  getMetas().forEach(({ el, media, content }) => {
    if (getTheme() === 'auto') {
      if (media) {
        el.setAttribute('media', media)
      } else {
        el.removeAttribute('media')
      }
      el.setAttribute('content', content)
    } else {
      el.removeAttribute('media')
      el.setAttribute('content', resolved === 'dark' ? DARK_COLOR : LIGHT_COLOR)
    }
  })
}

const apply = () => {
  const theme = getTheme()
  const resolved = resolveTheme(theme)
  try {
    const root = document.documentElement
    if (theme === 'auto') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    root.style.colorScheme = resolved
  } catch (e) {
    // no document available - ignore
  }
  updateThemeColor(resolved)
  return resolved
}

// Repaint whenever the preference changes, exactly like any component.
preference.subscribe(apply)

export const setTheme = preference.set

export const subscribeTheme = preference.subscribe

export const initTheme = () => {
  apply()
  try {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      // Only 'auto' follows the OS; an explicit theme stays put.
      if (getTheme() === 'auto') {
        preference.notify()
      }
    }
    if (query.addEventListener) {
      query.addEventListener('change', onChange)
    } else if (query.addListener) {
      query.addListener(onChange)
    }
  } catch (e) {
    // matchMedia unavailable - nothing to follow
  }
  return getTheme()
}
