import 'preact/debug'
import { h, render } from 'preact'
import 'intl-pluralrules'
import Banana from 'banana-i18n'
import {
  setAppLanguage, getAppLanguage, setDeviceLanguage, getDeviceLanguage,
  checkHasDeviceLanguageChanged, loadAllLanguagesMessages, consentMessages,
  getDirection
} from 'utils'
import { App } from './components/App'

import '../style/style.scss'

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
