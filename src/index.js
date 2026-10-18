import 'preact/debug'
import { h, render } from 'preact'
import 'intl-pluralrules'
import Banana from 'banana-i18n'
import {
  setAppLanguage, getAppLanguage, setDeviceLanguage, getDeviceLanguage,
  checkHasDeviceLanguageChanged, loadAllLanguagesMessages, consentMessages,
  getDirection, initTouchSupport, initTheme, isProd
} from 'utils'
import { App } from './components/App'

import '../style/style.scss'

// Apply the persisted theme and input preferences before the first paint so
// the app never flashes the wrong colours.
initTheme()
initTouchSupport()

if (checkHasDeviceLanguageChanged()) {
  setDeviceLanguage()
  setAppLanguage(getDeviceLanguage())
}

const lang = getAppLanguage()
const banana = new Banana(lang)
const dir = getDirection(lang)
banana.load(loadAllLanguagesMessages())
banana.load(consentMessages)

render(<App i18n={banana} dir={dir} />, document.querySelector('.root'))

// Web (PWA) build only: the service worker caches the app shell so the app,
// and the articles saved for offline reading, open without a connection. The
// KaiOS package is installed locally (app://) and does not need one.
if (
  isProd() &&
  'serviceWorker' in navigator &&
  /^https?:$/.test(window.location.protocol)
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {})
  })
}
