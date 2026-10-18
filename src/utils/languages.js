import { prioritizedLanguageListName } from 'utils'

// json language file given by iOS team
const languages = [
  {
    canonical_name: 'English',
    code: 'en',
    name: 'English'
  },
  {
    canonical_name: 'Hindi',
    code: 'hi',
    name: '\u0939\u093f\u0928\u094d\u0926\u0940'
  },
  {
    canonical_name: 'Bengali',
    code: 'bn',
    name: '\u09ac\u09be\u0982\u09b2\u09be'
  },
  {
    canonical_name: 'Hebrew',
    code: 'he',
    name: '\u05e2\u05d1\u05e8\u05d9\u05ea'
  },
  {
    canonical_name: 'Russian',
    code: 'ru',
    name: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439'
  },
  {
    canonical_name: 'Japanese',
    code: 'ja',
    name: '\u65e5\u672c\u8a9e'
  }
]

const missingFont = []

const rtl = [
  'he'
]

const prioritizedLists = {
  default: ['en', 'hi', 'bn', 'he', 'ru', 'ja'],
  jio: ['en', 'hi', 'bn']
}

const prioritizedList = prioritizedLists[prioritizedLanguageListName] ||
      prioritizedLists.default

export const isPrioritized = lang => prioritizedList.indexOf(lang) > -1

export const getDirection = langCode => {
  return rtl.includes(langCode) ? 'rtl' : 'ltr'
}

export const isSupportedForReading = langCode => {
  if (!languages.find(language => language.code === langCode)) {
    return false
  }
  return missingFont.indexOf(langCode) === -1
}

export const prioritizedLanguages = languages
  .filter(language => {
    return prioritizedList.indexOf(language.code) !== -1 && isSupportedForReading(language.code)
  })
  .map(language => {
    return {
      lang: language.code,
      title: language.name,
      canonicalName: language.canonical_name,
      dir: getDirection(language.code)
    }
  })

export const allLanguages = prioritizedLanguages.concat(
  languages
    .filter(language => {
      return isSupportedForReading(language.code) && prioritizedList.indexOf(language.code) === -1
    })
    .map(language => {
      return {
        lang: language.code,
        title: language.name,
        canonicalName: language.canonical_name,
        dir: getDirection(language.code)
      }
    })
)

const translationModules = import.meta.glob([
  '../../i18n/*.json',
  '!../../i18n/qqq.json'
], { eager: true })

export const loadAllLanguagesMessages = () => {
  const messages = {}
  allLanguages.forEach(language => {
    const translation = translationModules[`../../i18n/${language.lang}.json`]
    if (translation) {
      messages[language.lang] = translation.default || translation
    }
    // Translation not available, discard
  })

  return messages
}

export const setAppLanguage = lang => {
  localStorage.setItem('language-app', lang)
}

export const getAppLanguage = () => {
  return localStorage.getItem('language-app')
}

export const setDeviceLanguage = () => {
  localStorage.setItem('language-device', getCurrentDeviceLanguage())
}

export const getDeviceLanguage = () => {
  return localStorage.getItem('language-device')
}

export const checkHasDeviceLanguageChanged = () => {
  return getCurrentDeviceLanguage() !== localStorage.getItem('language-device')
}

const getAlias = lang => {
  // Jio uses `kok-IN` for Konkani but Wikipedia uses `gom`
  const aliases = {
    'kok-IN': 'gom'
  }

  return aliases[lang] || lang
}

const getCurrentDeviceLanguage = () => {
  const navigatorLang = getAlias(navigator.language)
  const code = navigatorLang.includes('-')
    ? navigatorLang.substr(0, navigatorLang.indexOf('-'))
    : navigatorLang
  return isSupportedForReading(code) ? code : 'en'
}
