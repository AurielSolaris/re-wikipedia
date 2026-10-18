import 'preact/debug'
import { h, render } from 'preact'
import 'intl-pluralrules'
import Banana from 'banana-i18n'
import {
  setAppLanguage, getAppLanguage, setDeviceLanguage, getDeviceLanguage,
  checkHasDeviceLanguageChanged, loadAllLanguagesMessages, consentMessages,
  getDirection, initTouchSupport, initTheme
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
