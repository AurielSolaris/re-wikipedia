import { create } from '../res/Preference.res.mjs'

// Platform side of the ReScript preference store (src/res/Preference.res).
//
// localStorage is the right backing store for preferences: it is synchronous,
// present on KaiOS/Firefox 37 and in private windows, and every value we keep
// is a handful of bytes. (IndexedDB is only worth its async complexity for
// large payloads such as a future offline article cache.) When storage is
// unavailable - quota, privacy mode - writes stay in memory for the session so
// the UI still behaves consistently.

const memory = new Map()

const storage = {
  read: key => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? memory.get(key) : raw
    } catch (e) {
      return memory.get(key)
    }
  },
  write: (key, value) => {
    memory.set(key, value)
    try {
      window.localStorage.setItem(key, value)
    } catch (e) {
      // keep the in-memory copy only
    }
  },
  remove: key => {
    memory.delete(key)
    try {
      window.localStorage.removeItem(key)
    } catch (e) {
      // nothing else to clean up
    }
  }
}

/**
 * Creates a small observable preference.
 *
 * @param {object} options
 * @param {string} options.key            localStorage key
 * @param {any} options.defaultValue      value used when nothing is stored (may be a factory)
 * @param {any[]} [options.values]        allow-list; anything else falls back to the default
 * @param {function} [options.parse]      string -> value
 * @param {function} [options.serialize]  value -> string
 * @returns {{ key, get, set, subscribe, notify, reset }}
 */
export const createPreference = ({ key, defaultValue, values = undefined, parse = value => value, serialize = String }) =>
  create(
    storage,
    key,
    values,
    typeof defaultValue === 'function' ? defaultValue : () => defaultValue,
    parse,
    serialize
  )
