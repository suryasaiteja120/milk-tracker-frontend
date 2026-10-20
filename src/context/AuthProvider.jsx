import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './contexts'
import { api, setUnauthorizedHandler } from '../lib/api'

const STORAGE_KEY = 'milkTrackerUser'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const login = useCallback((nextUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const updateUser = useCallback((updates) => {
  setUser((currentUser) => {
    if (!currentUser) return currentUser

    const nextUser = { ...currentUser, ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))

    return nextUser
  })
}, [])

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST', auth: false, parse: 'text' })
    } catch {
      /* the local session is cleared either way */
    }
    clear()
  }, [clear])

  useEffect(() => {
    setUnauthorizedHandler(clear)
    return () => setUnauthorizedHandler(null)
  }, [clear])

  const value = useMemo(
  () => ({ user, login, logout, updateUser }),
  [user, login, logout, updateUser]
)
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
