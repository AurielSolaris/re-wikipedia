// Touch / click support toggle.
//
// The app is primarily keypad-driven (KaiOS). On pointer devices (mouse or
// touchscreen) we let people tap items directly. The preference is stored in
// localStorage; on first run it is auto-detected from the pointer capabilities
// so desktop and touch users get it out of the box while keypad devices keep
// their key-driven navigation.

const STORAGE_KEY = 'touchSupport'

let cached = null
let listeners = []

const detect = () => {
  try {
    if (typeof window === 'undefined') {
      return false
    }
    if (window.matchMedia) {
      if (window.matchMedia('(any-pointer: fine)').matches) return true
      if (window.matchMedia('(any-pointer: coarse)').matches) return true
      if (window.matchMedia('(hover: hover)').matches) return true
    }
    if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) return true
    if ('ontouchstart' in window) return true
  } catch (e) {
    // matchMedia can throw in exotic environments; fall through to disabled.
  }
  return false
}

const applyAttribute = enabled => {
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-touch', enabled ? 'true' : 'false')
    }
  } catch (e) {
    // no document (tests / ssr) - ignore
  }
}

export const getTouchSupport = () => {
  if (cached === null) {
    let stored = null
    try {
      stored = window.localStorage.getItem(STORAGE_KEY)
    } catch (e) {
      // localStorage may be unavailable; fall back to detection
    }
    cached = stored === null ? detect() : stored === 'true'
  }
  return cached
}

export const setTouchSupport = enabled => {
  const next = !!enabled
  cached = next
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false')
  } catch (e) {
    // ignore quota / privacy mode failures
  }
  applyAttribute(next)
  listeners.slice().forEach(listener => listener(next))
}

export const subscribeTouchSupport = listener => {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter(current => current !== listener)
  }
}

export const initTouchSupport = () => {
  const enabled = getTouchSupport()
  applyAttribute(enabled)
  return enabled
}
