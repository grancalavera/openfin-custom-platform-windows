import { useState } from 'react'
import { useFdc3 } from './hooks/useFdc3'
import type { Fdc3Context } from './types/fdc3.d'

function SenderView() {
  const fdc3Ready = useFdc3()
  const [ticker, setTicker] = useState('AAPL')
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  })

  const handleRaiseIntent = async () => {
    if (!fdc3Ready || typeof fdc3 === 'undefined') {
      setStatus({ type: 'error', message: 'FDC3 not available' })
      return
    }

    const context: Fdc3Context = {
      type: 'fdc3.instrument',
      id: { ticker }
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
        <label htmlFor="ticker">Ticker Symbol</label>
        <input
          id="ticker"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter ticker (e.g., AAPL)"
        />
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

        .form-group input {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #374151;
          border-radius: 0.375rem;
          background-color: #1f2937;
          color: #f3f4f6;
        }

        .form-group input:focus {
          outline: none;
          border-color: #646cff;
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
