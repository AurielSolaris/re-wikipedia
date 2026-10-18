import { useState, useEffect } from 'preact/hooks'
import { useI18n } from 'hooks'
import {
  getArticle, getArticleSummary, getArticleMediaList,
  getSuggestedArticles, getLanglinks, leadImageWidth
} from 'api'
import { canonicalizeTitle, thumbUrl, savedArticles } from 'utils'

export const useArticle = (lang, title) => {
  const [article, setArticle] = useState(null)
  const contentI18n = useI18n(lang)

  let abortFunctions = []
  let cancelled = false

  const abortAll = () => {
    cancelled = true
    if (abortFunctions) {
      abortFunctions.forEach(f => f())
    }
  }

  // The copy saved for offline reading, if there is one.
  const loadSaved = () => savedArticles.isSupported()
    ? savedArticles.get(lang, title)
      .then(record => record && record.article ? { ...record.article, isSavedCopy: true } : null, () => null)
    : Promise.resolve(null)

  const loadArticle = () => {
    cancelled = false
    setArticle(null)
    // Offline: go straight to the saved copy instead of waiting for requests
    // that cannot succeed.
    if (navigator.onLine === false) {
      loadSaved().then(saved => {
        if (cancelled) return
        if (saved) {
          setArticle(saved)
        } else {
          loadFromNetwork()
        }
      })
      return
    }
    loadFromNetwork()
  }

  const loadFromNetwork = () => {
    const [articlePromise, articleAbort] = getArticle(lang, title)
    const [summaryPromise, summaryAbort] = getArticleSummary(lang, title)
    const [mediaPromise, mediaAbort] = getArticleMediaList(lang, title)
    const [suggestionsPromise, suggestionsAbort] = getSuggestedArticles(lang, title)
    const [languagesPromise, languagesAbort] = getLanglinks(lang, title)
    abortFunctions = [articleAbort, summaryAbort, mediaAbort, suggestionsAbort, languagesAbort]
    Promise.all([articlePromise, summaryPromise, mediaPromise, suggestionsPromise, languagesPromise])
      .then(([article, summary, media, suggestedArticles, languages]) => {
        const { sections, toc } = article
        const footerTitle = contentI18n('toc-footer')
        const anchor = canonicalizeTitle(footerTitle)

        // The summary ships the canonical lead image but only as a fixed
        // ~330px thumbnail, which is far too small to stretch across the hero
        // band. Re-build it at the lead width (a standard thumbnail step).
        if (summary.imageUrl) {
          article.sections[0].imageUrl = thumbUrl(summary.imageUrl, leadImageWidth(), lang)
        }

        // set language count value
        article.languageCount = languages.length

        // build footer used section and toc
        // with header title in the same language as article
        const sectionsWithFooter = sections.concat({
          title: footerTitle,
          anchor,
          imageUrl: false,
          isFooter: true
        })
        const tocWithFooter = toc.concat({ level: 1, line: footerTitle, anchor, sectionIndex: sectionsWithFooter.length - 1 })

        setArticle({ ...article, title, sections: sectionsWithFooter, toc: tocWithFooter, suggestedArticles, media })
      }, error => {
        loadSaved().then(saved => {
          if (!cancelled) setArticle(saved || { error })
        })
      })
  }

  useEffect(() => {
    loadArticle()
    return abortAll
  }, [lang, title])

  return [article, loadArticle]
}
