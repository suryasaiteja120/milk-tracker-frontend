import { useSyncExternalStore } from 'react'

const KEY = 'milkTrackerDarkMode'
const listeners = new Set()

function read() {
  const stored = localStorage.getItem(KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

let dark = read()

export function applyTheme() {
  document.body.classList.toggle('dark-mode', dark)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0C1620' : '#EBF0F5')
}

export function setDark(value) {
  dark = value
  localStorage.setItem(KEY, String(value))
  applyTheme()
  listeners.forEach((l) => l())
}

export function useDark() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => dark,
  )
}
