// Touch / click support toggle.
//
// The app is primarily keypad-driven (KaiOS). On pointer devices (mouse or
// touchscreen) we let people tap items directly. State lives in the ReScript
// preference store (src/res/Preference.res); on first run it is auto-detected
// from the pointer capabilities so desktop and touch users get it out of the
// box while keypad devices keep their key-driven navigation.

import { createPreference } from './preference'

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

const preference = createPreference({
  key: 'touchSupport',
  values: [true, false],
  defaultValue: detect,
  parse: value => value === 'true',
  serialize: value => (value ? 'true' : 'false')
})

// Reflect the preference on <html> whenever it changes.
preference.subscribe(applyAttribute)

export const getTouchSupport = preference.get

export const setTouchSupport = enabled => preference.set(!!enabled)

export const subscribeTouchSupport = preference.subscribe

export const initTouchSupport = () => {
  const enabled = getTouchSupport()
  applyAttribute(enabled)
  return enabled
}
