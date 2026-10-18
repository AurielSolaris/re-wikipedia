import { h } from 'preact'
import { memo } from 'preact/compat'
import { useI18n } from 'hooks'
import { BookmarkIcon } from './icons'

export const SAVED_ARTICLES_KEY = 'saved-articles'

// `savedCount` adds a shortcut to the articles saved for offline reading. It is
// a selectable row, so the host view's navigation and center key handle it.
export const OfflinePanel = memo(({ savedCount = 0 }) => {
  const i18n = useI18n()
  return (
    <div class='offline-panel'>
      <div class='offline-content'>
        <img src='images/offline.svg' />
        <div class='message'>{i18n('offline-message')}</div>
        { savedCount > 0 && (
          <div class='saved-link' data-selectable data-selected-key={SAVED_ARTICLES_KEY}>
            <BookmarkIcon size={18} />
            <span>{i18n('offline-saved-articles', savedCount)}</span>
          </div>
        ) }
      </div>
    </div>
  )
})
