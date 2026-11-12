import '@fontsource-variable/fraunces'
import '@fontsource-variable/plus-jakarta-sans'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/pages.css'
import './styles/seller.css'
import './styles/phase4.css'
import './styles/calendar.css'
import './styles/personas.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
