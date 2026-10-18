import { describe, expect, it } from 'vitest'
import { steps, snap } from '../../src/res/ThumbSize.res.mjs'
import { fixImgSrc, thumbUrl } from '../../src/utils/fixImgSrc'

const COMMONS = 'https://upload.wikimedia.org/wikipedia/commons'

describe('ThumbSize.snap', () => {
  it('rounds up to the next standard Wikimedia width', () => {
    expect(snap(1)).toBe(20)
    expect(snap(64)).toBe(120)
    expect(snap(250)).toBe(250)
    expect(snap(251)).toBe(330)
  })

  it('clamps to the largest step', () => {
    expect(snap(10000)).toBe(steps[steps.length - 1])
  })
})

describe('fixImgSrc', () => {
  it('makes protocol-relative and extension paths absolute', () => {
    expect(fixImgSrc('//upload.wikimedia.org/a.png', 'en')).toBe('https://upload.wikimedia.org/a.png')
    expect(fixImgSrc('/w/extensions/foo.svg', 'fr')).toBe('https://fr.wikipedia.org/w/extensions/foo.svg')
  })

  it('returns an empty string for missing sources', () => {
    expect(fixImgSrc(undefined, 'en')).toBe('')
    expect(fixImgSrc('   ', 'en')).toBe('')
  })
})

describe('thumbUrl', () => {
  it('builds a thumbnail at a standard width from an original', () => {
    expect(thumbUrl(`${COMMONS}/a/ab/Cow.jpg`, 300, 'en'))
      .toBe(`${COMMONS}/thumb/a/ab/Cow.jpg/330px-Cow.jpg`)
  })

  it('re-sizes an existing thumbnail', () => {
    expect(thumbUrl(`${COMMONS}/thumb/a/ab/Cow.jpg/64px-Cow.jpg`, 500, 'en'))
      .toBe(`${COMMONS}/thumb/a/ab/Cow.jpg/500px-Cow.jpg`)
  })

  it('renders SVGs as PNG thumbnails', () => {
    expect(thumbUrl(`${COMMONS}/1/12/Map.svg`, 200, 'en'))
      .toBe(`${COMMONS}/thumb/1/12/Map.svg/250px-Map.svg.png`)
  })

  it('leaves GIFs and non-Wikimedia URLs alone', () => {
    expect(thumbUrl(`${COMMONS}/1/12/Anim.gif`, 200, 'en')).toBe(`${COMMONS}/1/12/Anim.gif`)
    expect(thumbUrl('https://example.org/x.jpg', 200, 'en')).toBe('https://example.org/x.jpg')
  })
})
