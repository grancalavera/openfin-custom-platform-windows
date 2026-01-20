import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [openFinInfo, setOpenFinInfo] = useState<string | null>(null)

  useEffect(() => {
    // Check if running in OpenFin environment
    if (typeof fin !== 'undefined') {
      fin.Application.getCurrent().then((app: { identity: { uuid: string } }) => {
        setOpenFinInfo(`Running in OpenFin - App UUID: ${app.identity.uuid}`)
      }).catch(() => {
        setOpenFinInfo('OpenFin available but could not get app info')
      })
    } else {
      setOpenFinInfo('Running in browser (not OpenFin)')
    }
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + OpenFin</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      {openFinInfo && (
        <p className="openfin-info" style={{ color: '#888', fontSize: '0.9em' }}>
          {openFinInfo}
        </p>
      )}
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
