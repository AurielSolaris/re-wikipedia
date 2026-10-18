// Reactive preference store.
//
// This is the pure state machine behind the observable preferences (theme,
// touch/click support, ...): it caches the value, validates it against an
// allow-list, persists changes and notifies subscribers. The platform side
// (localStorage, or an in-memory fallback when storage is unavailable) is
// injected from JS through the `storage` record, so nothing here touches the
// DOM and the whole module stays testable.
//
// Used by utils/preference.js, which is re-exported by utils/theme.js and
// utils/touchSupport.js.

type storage = {
  read: string => option<string>,
  write: (string, string) => unit,
  remove: string => unit,
}

type t<'a> = {
  key: string,
  get: unit => 'a,
  set: 'a => bool,
  subscribe: ('a => unit) => unit => unit,
  notify: unit => unit,
  reset: unit => unit,
}

let create = (
  ~storage: storage,
  ~key: string,
  ~values: option<array<'a>>,
  ~defaultValue: unit => 'a,
  ~parse: string => 'a,
  ~serialize: 'a => string,
): t<'a> => {
  let cached: ref<option<'a>> = ref(None)
  let listeners: ref<array<'a => unit>> = ref([])

  let allowed = value =>
    switch values {
    | None => true
    | Some(allowedValues) => Array.includes(allowedValues, value)
    }

  // The stored value wins, but only when it is one of the allowed values;
  // anything else (absent, corrupt or stale) falls back to the default.
  let get = () =>
    switch cached.contents {
    | Some(value) => value
    | None =>
      let resolved = switch storage.read(key) {
      | None => defaultValue()
      | Some(raw) =>
        let parsed = parse(raw)
        allowed(parsed) ? parsed : defaultValue()
      }
      cached := Some(resolved)
      resolved
    }

  let notify = () =>
    Array.forEach(Array.copy(listeners.contents), listener => listener(get()))

  let set = value =>
    if allowed(value) {
      let changed = get() !== value
      cached := Some(value)
      storage.write(key, serialize(value))
      if changed {
        notify()
      }
      true
    } else {
      false
    }

  let subscribe = listener => {
    Array.push(listeners.contents, listener)->ignore
    () => listeners := Array.filter(listeners.contents, current => current !== listener)
  }

  let reset = () => {
    storage.remove(key)
    cached := None
    notify()
  }

  {key, get, set, subscribe, notify, reset}
}
