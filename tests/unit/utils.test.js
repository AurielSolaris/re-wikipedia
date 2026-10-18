import { beforeEach, describe, expect, it } from 'vitest'
import {
  articleHistory, buildMwApiUrl, buildPcsUrl, canonicalizeTitle, normalizeTitle,
  isAnchorIntroSkip, skipIntroAnchor, onboarding
} from 'utils'

describe('titles', () => {
  it('converts between URL and display titles', () => {
    expect(normalizeTitle('New_York_City')).toBe('New York City')
    expect(canonicalizeTitle('New York City')).toBe('New_York_City')
  })
})

describe('API URLs', () => {
  it('adds the default MediaWiki API parameters', () => {
    const url = new URL(buildMwApiUrl('fr', { action: 'query', srsearch: 'chat & chien' }))
    expect(url.origin).toBe('https://fr.wikipedia.org')
    expect(url.pathname).toBe('/w/api.php')
    expect(Object.fromEntries(url.searchParams)).toEqual({
      format: 'json',
      formatversion: '2',
      origin: '*',
      action: 'query',
      srsearch: 'chat & chien'
    })
  })

  it('builds page content service URLs from display titles', () => {
    expect(buildPcsUrl('en', 'Albert Einstein ATV', 'summary'))
      .toBe('https://en.wikipedia.org/api/rest_v1/page/summary/Albert_Einstein_ATV')
  })
})

describe('articleHistory', () => {
  beforeEach(() => articleHistory.clear())

  it('steps back to the previous article', () => {
    expect(articleHistory.isEmpty()).toBe(true)
    articleHistory.add('en', 'Cattle')
    expect(articleHistory.hasPrev()).toBe(false)

    articleHistory.add('en', 'Dairy_cattle')
    expect(articleHistory.hasPrev()).toBe(true)
    expect(articleHistory.getPrev()).toEqual({ lang: 'en', title: 'Cattle' })
    expect(articleHistory.prev()).toEqual({ lang: 'en', title: 'Cattle' })
    expect(articleHistory.isEmpty()).toBe(true)
  })

  it('returns false when there is nothing to go back to', () => {
    expect(articleHistory.prev()).toBe(false)
  })
})

describe('onboarding', () => {
  it('is remembered in localStorage', () => {
    expect(onboarding.isDone()).toBe(false)
    onboarding.markAsDone()
    expect(onboarding.isDone()).toBe(true)
  })
})

describe('skipArticleIntro', () => {
  it('recognises the skip-intro anchor', () => {
    expect(isAnchorIntroSkip(skipIntroAnchor)).toBe(true)
    expect(isAnchorIntroSkip('History')).toBe(false)
  })
})
