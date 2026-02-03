import { useState, useEffect } from 'react'

export function useFdc3() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fdc3) {
      setReady(true)
    } else {
      const handler = () => setReady(true)
      window.addEventListener('fdc3Ready', handler)
      return () => window.removeEventListener('fdc3Ready', handler)
    }
  }, [])

  return ready
}
