import { useState } from 'react'
import { useFdc3 } from './hooks/useFdc3'
import type { WindowType, Fdc3ContextWithRouting } from './types/intent-routing'

const FX_PAIRS = [
  'EURUSD',
  'USDJPY',
  'GBPUSD',
  'USDCHF',
  'AUDUSD',
  'USDCAD',
  'NZDUSD',
  'EURGBP',
  'EURJPY',
  'GBPJPY',
  'AUDJPY',
  'EURCHF',
  'GBPCHF',
  'CADJPY',
  'AUDNZD',
]

function SenderView() {
  const fdc3Ready = useFdc3()
  const [ticker, setTicker] = useState('EURUSD')
  const [windowType, setWindowType] = useState<WindowType>('platform-view')
  const [createNew, setCreateNew] = useState(true)
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  })

  const handleRaiseIntent = async () => {
    if (!fdc3Ready || typeof fdc3 === 'undefined') {
      setStatus({ type: 'error', message: 'FDC3 not available' })
      return
    }

    const context: Fdc3ContextWithRouting = {
      type: 'fdc3.instrument',
      id: { ticker },
      _routingMetadata: { windowType, createNew }
    }

    try {
      setStatus({ type: 'idle', message: 'Sending...' })
      const resolution = await fdc3.raiseIntent('ViewChart', context)
      console.log('Intent resolved:', resolution)
      setStatus({ type: 'success', message: `Intent sent for ${ticker}` })
    } catch (error) {
      console.error('Intent failed:', error)
      setStatus({ type: 'error', message: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` })
    }
  }

  return (
    <div className="sender-view">
      <h1>Sender View</h1>
      <p className="status-badge" data-ready={fdc3Ready}>
        FDC3: {fdc3Ready ? 'Ready' : 'Not Ready'}
      </p>

      <div className="form-group">
        <label htmlFor="ticker">Currency Pair</label>
        <select
          id="ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        >
          {FX_PAIRS.map(pair => (
            <option key={pair} value={pair}>{pair}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="windowType">Window Type</label>
        <select
          id="windowType"
          value={windowType}
          onChange={(e) => setWindowType(e.target.value as WindowType)}
        >
          <option value="platform-view">Platform View</option>
          <option value="core-window">Core Window</option>
        </select>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={createNew}
            onChange={(e) => setCreateNew(e.target.checked)}
          />
          Always create new window
        </label>
      </div>

      <button onClick={handleRaiseIntent} disabled={!fdc3Ready}>
        Raise ViewChart Intent
      </button>

      {status.message && (
        <p className={`status-message ${status.type}`}>
          {status.message}
        </p>
      )}

      <style>{`
        .sender-view {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
        }

        h1 {
          margin-bottom: 1rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .status-badge[data-ready="true"] {
          background-color: #22c55e;
          color: white;
        }

        .status-badge[data-ready="false"] {
          background-color: #ef4444;
          color: white;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group select {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #374151;
          border-radius: 0.375rem;
          background-color: #1f2937;
          color: #f3f4f6;
        }

        .form-group input[type="text"]:focus,
        .form-group select:focus {
          outline: none;
          border-color: #646cff;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          accent-color: #646cff;
        }

        button {
          width: 100%;
          margin-top: 1rem;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-message {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 0.375rem;
          text-align: center;
        }

        .status-message.success {
          background-color: #166534;
          color: #bbf7d0;
        }

        .status-message.error {
          background-color: #991b1b;
          color: #fecaca;
        }

        .status-message.idle {
          background-color: #374151;
          color: #d1d5db;
        }
      `}</style>
    </div>
  )
}

export default SenderView
