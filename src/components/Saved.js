import { h } from 'preact'
import { useRef, useEffect } from 'preact/hooks'
import { ListView } from './ListView'
import { Loading } from './Loading'
import {
  useNavigation, useI18n, useSoftkey, useSavedArticleList, useConfirmDialog
} from 'hooks'
import { goto, getAppLanguage, savedArticles } from 'utils'
import { listItemOf } from '../res/SavedArticles.res.mjs'

// Articles saved for offline reading (src/res/SavedArticles.res).
export const Saved = () => {
  const containerRef = useRef()
  const listRef = useRef()
  const i18n = useI18n()
  const items = useSavedArticleList()
  const itemsRef = useRef(items)
  itemsRef.current = items
  const showConfirmDialog = useConfirmDialog()
  const [, setNavigation, getCurrent] = useNavigation('Saved', containerRef, listRef, 'grid')
  const appLang = getAppLanguage()

  const selected = () => {
    const list = itemsRef.current
    if (!list || !list.length) return null
    const { index } = getCurrent()
    return list[index] || null
  }

  const onKeyCenter = () => {
    const item = selected()
    if (item) {
      goto.article(item.lang, item.title)
    }
  }

  const onKeyRight = () => {
    const item = selected()
    if (!item) return
    showConfirmDialog({
      title: i18n('saved-remove-title'),
      message: i18n('saved-remove-message', item.displayTitle),
      onDiscardText: i18n('softkey-cancel'),
      onSubmitText: i18n('softkey-remove'),
      onSubmit: () => savedArticles.remove(item.lang, item.title)
    })
  }

  const hasItems = !!(items && items.length)

  useSoftkey('Saved', {
    left: i18n('softkey-close'),
    onKeyLeft: () => goto.back(),
    center: hasItems ? i18n('softkey-read') : '',
    onKeyCenter: hasItems ? onKeyCenter : null,
    right: hasItems ? i18n('softkey-remove') : '',
    onKeyRight: hasItems ? onKeyRight : null,
    onKeyBackspace: () => goto.back()
  }, [hasItems])

  // Keep a valid selection as the list loads and shrinks.
  useEffect(() => {
    if (!items) return
    const { index } = getCurrentSafe(getCurrent)
    setNavigation(Math.min(index, Math.max(items.length - 1, 0)))
  }, [items && items.length])

  // The container is always rendered: useNavigation binds tap handling to it
  // on mount.
  return (
    <div class='saved' ref={containerRef}>
      { items
        ? (
          <ListView
            header={i18n('header-saved')}
            items={items.map(item => listItemOf(item, appLang))}
            containerRef={listRef}
            empty={i18n('saved-empty')}
          />
          )
        : <Loading /> }
    </div>
  )
}

const getCurrentSafe = getCurrent => {
  try {
    const current = getCurrent()
    return { index: isNaN(current.index) ? 0 : current.index }
  } catch (e) {
    return { index: 0 }
  }
}
