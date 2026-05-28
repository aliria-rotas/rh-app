import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedIfNeeded } from './lib/seed'

// Renderiza o app imediatamente — o seed roda em background
// As páginas já têm estado de loading próprio
seedIfNeeded().catch(console.error)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
