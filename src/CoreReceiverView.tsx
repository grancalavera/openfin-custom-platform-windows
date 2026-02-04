import { useState, useEffect, useRef } from 'react'
import { useFdc3 } from './hooks/useFdc3'
import type { Fdc3Context, Fdc3Listener } from './types/fdc3.d'

interface ReceivedIntent {
  context: Fdc3Context
  receivedAt: Date
}

function CoreReceiverView() {
  const fdc3Ready = useFdc3()
  const [receivedIntent, setReceivedIntent] = useState<ReceivedIntent | null>(null)
  const listenerRef = useRef<Fdc3Listener | null>(null)

  useEffect(() => {
    if (!fdc3Ready || typeof fdc3 === 'undefined') return

    const registerHandler = async () => {
      console.log('[Core Window] Registering ViewChart intent listener...')
      const listener = await fdc3.addIntentListener('ViewChart', (context) => {
        console.log('[Core Window] Received ViewChart intent:', context)
        setReceivedIntent({
          context,
          receivedAt: new Date()
        })
      })
      listenerRef.current = listener
      console.log('[Core Window] Intent listener registered')
    }

    registerHandler()

    return () => {
      if (listenerRef.current) {
        console.log('[Core Window] Unsubscribing intent listener')
        listenerRef.current.unsubscribe()
      }
    }
  }, [fdc3Ready])

  const ticker = receivedIntent?.context.id?.ticker

  return (
    <div className="receiver-view core-window">
      <h1>Core Window Receiver</h1>
      <p className="window-type">fin.Window.create()</p>
      <p className="status-badge" data-ready={fdc3Ready}>
        FDC3: {fdc3Ready ? 'Ready' : 'Not Ready'}
      </p>

      {receivedIntent ? (
        <div className="intent-card">
          <div className="card-header">ViewChart Intent Received</div>
          <div className="card-body">
            <div className="ticker-display">{ticker || 'N/A'}</div>
            <div className="context-details">
              <div className="detail-row">
                <span className="label">Context Type:</span>
                <span className="value">{receivedIntent.context.type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Received At:</span>
                <span className="value">{receivedIntent.receivedAt.toLocaleTimeString()}</span>
              </div>
            </div>
            <details className="raw-context">
              <summary>Raw Context</summary>
              <pre>{JSON.stringify(receivedIntent.context, null, 2)}</pre>
            </details>
          </div>
        </div>
      ) : (
        <div className="waiting-card">
          <div className="waiting-icon">...</div>
          <p>Waiting for ViewChart intent...</p>
          <p className="hint">Send an intent from the Sender view</p>
        </div>
      )}

      <style>{`
        .receiver-view {
          max-width: 400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .receiver-view.core-window h1 {
          color: #f97316;
        }

        .window-type {
          font-family: monospace;
          font-size: 0.875rem;
          color: #f97316;
          background-color: #431407;
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          margin-bottom: 1rem;
        }

        h1 {
          margin-bottom: 0.5rem;
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

        .intent-card {
          border: 1px solid #f97316;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .card-header {
          background-color: #9a3412;
          color: white;
          padding: 0.75rem 1rem;
          font-weight: 600;
        }

        .card-body {
          padding: 1rem;
          background-color: #1f2937;
        }

        .ticker-display {
          font-size: 3rem;
          font-weight: 700;
          text-align: center;
          color: #f97316;
          margin-bottom: 1rem;
          font-family: monospace;
        }

        .context-details {
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #374151;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .label {
          color: #9ca3af;
        }

        .value {
          font-family: monospace;
          color: #d1d5db;
        }

        .raw-context {
          margin-top: 1rem;
        }

        .raw-context summary {
          cursor: pointer;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .raw-context pre {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background-color: #111827;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          overflow-x: auto;
        }

        .waiting-card {
          text-align: center;
          padding: 3rem 2rem;
          background-color: #1f2937;
          border-radius: 0.5rem;
          border: 2px dashed #f97316;
        }

        .waiting-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .waiting-card p {
          margin: 0.5rem 0;
        }

        .hint {
          color: #6b7280;
          font-size: 0.875rem;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default CoreReceiverView
