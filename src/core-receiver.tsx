import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CoreReceiverView from './CoreReceiverView'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CoreReceiverView />
  </StrictMode>
)
