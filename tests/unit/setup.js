// An in-memory IndexedDB for the saved-articles store (jsdom has none).
import 'fake-indexeddb/auto'
import { afterEach } from 'vitest'

afterEach(() => {
  localStorage.clear()
})
