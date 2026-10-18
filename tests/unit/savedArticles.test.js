import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as Saved from '../../src/res/SavedArticles.res.mjs'

const IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Cow.jpg/500px-Cow.jpg'
const LEAD = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Cow.jpg/960px-Cow.jpg'
const MAP = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Map.svg/250px-Map.svg.png'

const article = (overrides = {}) => ({
  sections: [
    {
      title: 'Cattle',
      description: 'Domesticated <bovine> & friends',
      imageUrl: LEAD,
      content: `<p>Cows. <img loading="lazy" src="${IMG}"></p><img src="data:image/png;base64,AAAA">`
    },
    { title: 'History', content: `<div><img class="x" src="${IMG}"><img src="${MAP.replace('&', '&amp;')}"></div>` },
    { title: 'Read more', imageUrl: false, isFooter: true }
  ],
  infobox: `<table><tr><td><img src="${MAP}"></td></tr></table>`,
  ...overrides
})

// Each test gets its own database.
beforeEach(async () => {
  for (const record of await Saved.list()) {
    await Saved.remove(record.lang, record.title)
  }
})

describe('pure helpers', () => {
  it('keys articles by language and normalised title', () => {
    expect(Saved.normalizeTitle('Albert_Einstein_ATV')).toBe('Albert Einstein ATV')
    expect(Saved.keyFor('en', 'Albert_Einstein')).toBe('en/Albert Einstein')
  })

  it('collects every image once, skipping data: URLs', () => {
    expect(Saved.imageUrlsOf(article())).toEqual([LEAD, IMG, MAP])
  })

  it('handles articles without an infobox', () => {
    expect(Saved.imageUrlsOf(article({ infobox: null }))).toEqual([LEAD, IMG, MAP])
    expect(Saved.imageUrlsOf({ sections: [] })).toEqual([])
  })

  it('builds the summary from the lead section', () => {
    const record = Saved.summaryOf('en', 'Cattle', article(), 42)
    expect(record).toMatchObject({
      key: 'en/Cattle',
      lang: 'en',
      title: 'Cattle',
      displayTitle: 'Cattle',
      imageUrl: LEAD,
      savedAt: 42
    })
  })

  it('makes list rows with escaped descriptions and a foreign language tag', () => {
    const record = Saved.summaryOf('fr', 'Vache', article(), 1)
    expect(Saved.listItemOf(record, 'en')).toEqual({
      title: 'Cattle',
      description: 'FR · Domesticated &lt;bovine&gt; &amp; friends',
      imageUrl: LEAD
    })
    const plain = Saved.summaryOf('en', 'Rock', { sections: [{ title: 'Rock' }] }, 1)
    expect(Saved.listItemOf(plain, 'en')).toEqual({ title: 'Rock', description: '' })
  })
})

describe('IndexedDB store', () => {
  it('is supported when IndexedDB exists', () => {
    expect(Saved.isSupported()).toBe(true)
  })

  it('saves, reads back and removes an article', async () => {
    expect(await Saved.isSaved('en', 'Cattle')).toBe(false)

    await Saved.save('en', 'Cattle', article())
    expect(await Saved.isSaved('en', 'Cattle')).toBe(true)

    const record = await Saved.get('en', 'Cattle')
    expect(record.article.sections).toHaveLength(3)
    expect(record.imageUrls).toEqual([LEAD, IMG, MAP])

    await Saved.remove('en', 'Cattle')
    expect(await Saved.isSaved('en', 'Cattle')).toBe(false)
    expect(await Saved.get('en', 'Cattle')).toBeUndefined()
  })

  it('lists summaries newest first, without the article bodies', async () => {
    const now = vi.spyOn(Date, 'now')
    now.mockReturnValue(1000)
    await Saved.save('en', 'Older', article())
    now.mockReturnValue(2000)
    await Saved.save('en', 'Newer', article())

    const list = await Saved.list()
    expect(list.map(record => record.title)).toEqual(['Newer', 'Older'])
    expect(list[0].article).toBeUndefined()
  })

  it('notifies subscribers on save and remove', async () => {
    const listener = vi.fn()
    const unsubscribe = Saved.subscribe(listener)
    await Saved.save('en', 'Cattle', article())
    await Saved.remove('en', 'Cattle')
    unsubscribe()
    await Saved.save('en', 'Cattle', article())
    expect(listener).toHaveBeenCalledTimes(2)
  })
})

describe('image cache', () => {
  let stored

  beforeEach(() => {
    stored = new Map()
    const cache = {
      match: async url => stored.get(url),
      put: async (url, response) => { stored.set(url, response) },
      delete: async url => stored.delete(url)
    }
    vi.stubGlobal('caches', { open: async () => cache })
    vi.stubGlobal('fetch', vi.fn(async url => ({ ok: true, url })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('downloads every image of a saved article', async () => {
    await Saved.save('en', 'Cattle', article())
    expect([...stored.keys()].sort()).toEqual([IMG, LEAD, MAP].sort())
  })

  it('falls back to a no-cors request when CORS fails', async () => {
    fetch.mockImplementation(async (url, { mode }) => {
      if (mode === 'cors') throw new TypeError('CORS')
      return { ok: false, type: 'opaque', url }
    })
    await Saved.save('en', 'Rock', { sections: [{ title: 'Rock', imageUrl: LEAD }] })
    expect(stored.get(LEAD)).toMatchObject({ type: 'opaque' })
  })

  it('keeps images another saved article still uses', async () => {
    await Saved.save('en', 'Cattle', article())
    await Saved.save('en', 'Cow', { sections: [{ title: 'Cow', imageUrl: LEAD }] })

    await Saved.remove('en', 'Cattle')
    expect([...stored.keys()]).toEqual([LEAD])
  })

  it('still saves the article when an image download fails', async () => {
    fetch.mockRejectedValue(new TypeError('offline'))
    await Saved.save('en', 'Cattle', article())
    expect(await Saved.isSaved('en', 'Cattle')).toBe(true)
    expect(stored.size).toBe(0)
  })
})
