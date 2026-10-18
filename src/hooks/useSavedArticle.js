import { useState, useEffect } from 'preact/hooks'
import { savedArticles } from 'utils'

// Whether one article is saved for offline reading, and a toggle for it.
// Returns [isSaved, toggle, isBusy]. `isSaved` is null until it is known.
export const useSavedArticle = (lang, title) => {
  const [saved, setSaved] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!savedArticles.isSupported()) {
      return
    }
    let active = true
    const refresh = () => {
      savedArticles.isSaved(lang, title).then(value => {
        if (active) setSaved(value)
      })
    }
    refresh()
    const unsubscribe = savedArticles.subscribe(refresh)
    return () => {
      active = false
      unsubscribe()
    }
  }, [lang, title])

  const toggle = article => {
    if (busy || !savedArticles.isSupported()) {
      return Promise.resolve(saved)
    }
    setBusy(true)
    const next = saved
      ? savedArticles.remove(lang, title).then(() => false)
      : savedArticles.save(lang, title, article).then(() => true)
    return next
      .then(value => {
        setSaved(value)
        return value
      }, () => saved)
      .then(value => {
        setBusy(false)
        return value
      })
  }

  return [saved, toggle, busy]
}

// Every saved article (newest first, without the bodies), kept up to date.
// `null` while loading.
export const useSavedArticleList = () => {
  const [items, setItems] = useState(null)

  useEffect(() => {
    let active = true
    const refresh = () => {
      savedArticles.list().then(list => {
        if (active) setItems(list)
      })
    }
    refresh()
    const unsubscribe = savedArticles.subscribe(refresh)
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return items
}
