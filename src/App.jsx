import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthProvider from './context/AuthProvider'
import ToastProvider from './context/ToastProvider'
import DataProvider from './context/DataProvider'
import EditorsProvider from './context/EditorsProvider'
import { useAuth } from './context/contexts'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Purchases from './pages/Purchases'
import Payments from './pages/Payments'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

/** Signed-in area: data + editors are only loaded for an authenticated user. */
function Protected() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return (
    <DataProvider>
      <EditorsProvider>
        <AppShell />
      </EditorsProvider>
    </DataProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<Protected />}>
            <Route index element={<Dashboard />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="payments" element={<Payments />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
