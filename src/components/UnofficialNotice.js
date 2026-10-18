import { h } from 'preact'

export const UNOFFICIAL_NOTICE =
  'An unofficial, lightweight web rewrite inspired by the KaiOS Wikipedia app ' +
  'by the Wikimedia Foundation. Not affiliated with or endorsed by Wikimedia.'

export const UnofficialNotice = () => (
  <div class='unofficial-notice' dir='ltr'>
    <p>{UNOFFICIAL_NOTICE}</p>
  </div>
)
