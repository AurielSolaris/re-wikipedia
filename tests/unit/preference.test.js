import { describe, expect, it, vi } from 'vitest'
import { create } from '../../src/res/Preference.res.mjs'
import { createPreference } from '../../src/utils/preference'

const memoryStorage = (initial = {}) => {
  const data = new Map(Object.entries(initial))
  return {
    data,
    read: key => data.get(key),
    write: (key, value) => data.set(key, value),
    remove: key => data.delete(key)
  }
}

const themePreference = storage =>
  create(storage, 'theme', ['auto', 'light', 'dark'], () => 'auto', value => value, String)

describe('Preference.create', () => {
  it('uses the default when nothing valid is stored', () => {
    expect(themePreference(memoryStorage()).get()).toBe('auto')
    expect(themePreference(memoryStorage({ theme: 'purple' })).get()).toBe('auto')
  })

  it('reads a stored allowed value', () => {
    expect(themePreference(memoryStorage({ theme: 'dark' })).get()).toBe('dark')
  })

  it('persists allowed values and rejects others', () => {
    const storage = memoryStorage()
    const preference = themePreference(storage)
    expect(preference.set('light')).toBe(true)
    expect(storage.data.get('theme')).toBe('light')
    expect(preference.set('purple')).toBe(false)
    expect(preference.get()).toBe('light')
  })

  it('notifies subscribers only on change, until they unsubscribe', () => {
    const preference = themePreference(memoryStorage())
    const listener = vi.fn()
    const unsubscribe = preference.subscribe(listener)

    preference.set('dark')
    preference.set('dark')
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith('dark')

    unsubscribe()
    preference.set('light')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('reset drops the stored value and falls back to the default', () => {
    const storage = memoryStorage({ theme: 'dark' })
    const preference = themePreference(storage)
    preference.reset()
    expect(storage.data.has('theme')).toBe(false)
    expect(preference.get()).toBe('auto')
  })
})

describe('createPreference (localStorage)', () => {
  it('stores values in localStorage with the given serializer', () => {
    const size = createPreference({
      key: 'test-size',
      defaultValue: 2,
      parse: Number,
      serialize: String
    })
    expect(size.get()).toBe(2)
    size.set(4)
    expect(localStorage.getItem('test-size')).toBe('4')
  })
})
