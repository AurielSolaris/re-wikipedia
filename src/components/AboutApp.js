import { h } from 'preact'
import { useI18n, useSoftkey } from 'hooks'
import { appVersion, appInstallId, openExternal } from 'utils'
import { ReactIsland } from './ReactIsland'
import { UnofficialNotice } from './UnofficialNotice'
import { make as Hello } from '../res/Hello.res.mjs'

export const AboutApp = ({ close }) => {
  const i18n = useI18n()

  useSoftkey('AboutApp', {
    right: i18n('softkey-read-more'),
    onKeyRight: () => openExternal('https://wikimediafoundation.org/'),
    left: i18n('softkey-close'),
    onKeyLeft: close,
    onKeyBackspace: close
  }, [])

  return (
    <div class='aboutapp'>
      <div class='header'>{i18n('about-header')}</div>
      <div class='body'>
        <div class='image'>
          <img src='images/onboarding-0.png' />
        </div>
        <div class='image'>
          <img src='images/wikipedia-wordmark-en.png' />
        </div>
        <div class='version'>
          <p>{appVersion()} ({appInstallId()})</p>
          <ReactIsland component={Hello} props={{ name: 'Wikipedia' }} />
        </div>
        <div class='message'>
          <p>{i18n('about-app-message')}</p>
        </div>
        <UnofficialNotice />
      </div>
    </div>
  )
}
