import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)
export const ToastContext = createContext(null)
export const DataContext = createContext(null)

export const useAuth = () => useContext(AuthContext)
export const useToast = () => useContext(ToastContext)
export const useData = () => useContext(DataContext)

export const EditorsContext = createContext(null)
export const useEditors = () => useContext(EditorsContext)
