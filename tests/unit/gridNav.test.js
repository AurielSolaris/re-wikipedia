import { describe, expect, it } from 'vitest'
import { columns, move, step, wrap } from '../../src/res/GridNav.res.mjs'

describe('GridNav.columns', () => {
  it('counts one column per track the browser reports', () => {
    expect(columns('360px 360px 360px')).toBe(3)
    expect(columns('  200px   200px ')).toBe(2)
  })

  it('treats a non-grid element as a single column', () => {
    expect(columns('none')).toBe(1)
    expect(columns('')).toBe(1)
    expect(columns('   ')).toBe(1)
  })
})

describe('GridNav.step', () => {
  it('moves one card along a row and a whole row in a grid', () => {
    expect(step('x', 4)).toBe(1)
    expect(step('y', 4)).toBe(1)
    expect(step('grid', 4)).toBe(4)
  })
})

describe('GridNav.wrap', () => {
  it('wraps past either end of the list', () => {
    expect(wrap(4, 1, 5)).toBe(0)
    expect(wrap(0, -1, 5)).toBe(4)
    expect(wrap(1, -3, 5)).toBe(3)
    expect(wrap(2, 1, 5)).toBe(3)
  })

  it('returns 0 for an empty list', () => {
    expect(wrap(3, 1, 0)).toBe(0)
  })
})

describe('GridNav.move', () => {
  // The home screen: the search input (index 0) above a 3-column grid of 5
  // results (indexes 1 to 5).
  const length = 6
  const offset = 1

  it('goes from the input to the first card, not a whole row down', () => {
    expect(move(0, 3, length, offset)).toBe(1)
  })

  it('moves a row at a time inside the grid', () => {
    expect(move(1, 3, length, offset)).toBe(4)
    expect(move(5, -3, length, offset)).toBe(2)
  })

  it('returns to the input from the first row', () => {
    expect(move(2, -3, length, offset)).toBe(0)
    expect(move(1, -1, length, offset)).toBe(0)
  })

  it('wraps to the top past the last row, and from the input to the end', () => {
    expect(move(4, 3, length, offset)).toBe(0)
    expect(move(0, -3, length, offset)).toBe(5)
  })

  it('behaves like wrap for a single column or without an offset', () => {
    for (let index = 0; index < length; index++) {
      for (const delta of [-1, 1]) {
        expect(move(index, delta, length, offset)).toBe(wrap(index, delta, length))
      }
      expect(move(index, 3, length, 0)).toBe(wrap(index, 3, length))
    }
  })

  it('returns 0 for an empty list', () => {
    expect(move(0, 1, 0, 0)).toBe(0)
  })
})
