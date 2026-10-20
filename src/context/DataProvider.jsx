import { useCallback, useEffect, useMemo, useState } from 'react'
import { DataContext } from './contexts'
import { api } from '../lib/api'
import { sortPayments, sortPurchases, todayParts } from '../lib/format'

/**
 * Holds everything for the month being viewed: dashboard totals, purchases,
 * payments and notifications, plus the create / update / delete actions.
 */
export default function DataProvider({ children }) {
  const [period, setPeriod] = useState(() => {
    const t = todayParts()
    return { month: t.month, year: t.year }
  })
  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded] = useState({ key: null, dashboard: null, purchases: [], payments: [], error: '' })
  const [notifications, setNotifications] = useState(null)
  const [query, setQuery] = useState('')

  const key = `${period.year}-${period.month}-${reloadKey}`

  // ---- Month data ------------------------------------------------------
  useEffect(() => {
    let cancelled = false
    const q = `month=${period.month}&year=${period.year}`

    Promise.all([
      api(`/api/dashboard?${q}`),
      api(`/api/purchases/month?${q}`),
      api(`/api/payments/month?${q}`),
    ])
      .then(([dashboard, purchases, payments]) => {
        if (cancelled) return
        setLoaded({ key, dashboard, purchases: purchases ?? [], payments: payments ?? [], error: '' })
      })
      .catch((error) => {
        if (cancelled || error.status === 401 || error.status === 403) return
        setLoaded((prev) => ({ ...prev, key, error: error.message }))
      })

    return () => {
      cancelled = true
    }
  }, [key, period.month, period.year])

  const reload = useCallback(() => setReloadKey((n) => n + 1), [])

  // ---- Notifications ---------------------------------------------------
  const refreshNotifications = useCallback(async () => {
    try {
      setNotifications((await api('/api/notifications')) ?? [])
    } catch {
      setNotifications((prev) => prev ?? [])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    api('/api/notifications')
      .then((data) => !cancelled && setNotifications(data ?? []))
      .catch(() => !cancelled && setNotifications([]))
    return () => {
      cancelled = true
    }
  }, [])

  const markRead = useCallback(async (id) => {
    setNotifications((list) => list?.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await api(`/api/notifications/${id}/read`, { method: 'PUT', parse: 'text' })
    } catch {
      setNotifications((list) => list?.map((n) => (n.id === id ? { ...n, read: false } : n)))
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications((list) => list?.map((n) => ({ ...n, read: true })))
    try {
      await api('/api/notifications/read-all', { method: 'PUT', parse: 'text' })
    } catch {
      refreshNotifications()
    }
  }, [refreshNotifications])

  
  const deleteNotification = useCallback(async (id) => {
    // Delete from the backend first.
    await api(`/api/notifications/${id}`, {
      method: 'DELETE',
      parse: 'text',
      errorMessage: 'Could not delete this notification.',
    })

    // Remove it from the UI after the backend confirms success.
    setNotifications((list) =>
      list?.filter((notification) => notification.id !== id),
    )
  }, [])


  // ---- Month navigation ------------------------------------------------
  const shiftMonth = useCallback((delta) => {
    setPeriod(({ month, year }) => {
      const d = new Date(year, month - 1 + delta, 1)
      return { month: d.getMonth() + 1, year: d.getFullYear() }
    })
  }, [])

  const goToToday = useCallback(() => {
    const t = todayParts()
    setPeriod({ month: t.month, year: t.year })
  }, [])

  // ---- Mutations (throw on failure so forms can show the message) --------
  const afterChange = useCallback(() => {
    reload()
    refreshNotifications()
  }, [reload, refreshNotifications])

  const savePurchase = useCallback(
    async (values, id) => {
      await api(id ? `/api/purchases/${id}` : '/api/purchases', {
        method: id ? 'PUT' : 'POST',
        body: values,
        errorMessage: id ? 'Could not update this purchase.' : 'Could not save this purchase.',
      })
      afterChange()
    },
    [afterChange],
  )

  const savePayment = useCallback(
    async (values, id) => {
      await api(id ? `/api/payments/${id}` : '/api/payments', {
        method: id ? 'PUT' : 'POST',
        body: values,
        errorMessage: id ? 'Could not update this payment.' : 'Could not save this payment.',
      })
      afterChange()
    },
    [afterChange],
  )

  const removeItem = useCallback(
    async (type, id) => {
      await api(`/api/${type === 'purchase' ? 'purchases' : 'payments'}/${id}`, {
        method: 'DELETE',
        parse: 'text',
        errorMessage: 'Could not delete this item.',
      })
      afterChange()
    },
    [afterChange],
  )

  const purchases = useMemo(() => sortPurchases(loaded.purchases), [loaded.purchases])
  const payments = useMemo(() => sortPayments(loaded.payments), [loaded.payments])

  const value = useMemo(
    () => ({
      period,
      shiftMonth,
      goToToday,
      dashboard: loaded.dashboard,
      purchases,
      payments,
      error: loaded.dashboard ? '' : loaded.error,
      initialLoading: !loaded.dashboard && !loaded.error,
      fetching: loaded.key !== key,
      reload,
      notifications,
      markRead,
      markAllRead,
      query,
      setQuery,
      savePurchase,
      savePayment,
      removeItem,
      deleteNotification,
    }),
    [period, shiftMonth, goToToday, loaded, purchases, payments, key, reload, notifications, markRead, markAllRead, deleteNotification, query, savePurchase, savePayment, removeItem],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
