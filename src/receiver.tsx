import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ReceiverView from './ReceiverView'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReceiverView />
  </StrictMode>
)
