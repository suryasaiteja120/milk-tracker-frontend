import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/shell.css'
import './styles/dashboard.css'
import './styles/pages.css'
import './styles/auth.css'
import './styles/motion.css'
import App from './App.jsx'
import { applyTheme } from './lib/theme'

applyTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
