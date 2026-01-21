import { useState, useEffect } from 'react'

function ProviderApp() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function initPlatform() {
      if (typeof fin !== 'undefined') {
        await fin.Platform.init({})

        const platform = fin.Platform.getCurrentSync()
        await platform.createWindow({
          url: 'http://192.168.68.65:5173/platform-window.html',
          defaultWidth: 1280,
          defaultHeight: 800,
          defaultCentered: true,
          autoShow: true,
          frame: false,
          resizable: true,
          contextMenu: true,
          layout: {
            content: [
              {
                type: 'column',
                content: [
                  {
                    type: 'row',
                    content: [
                      {
                        type: 'stack',
                        content: [
                          {
                            type: 'component',
                            componentName: 'view',
                            componentState: {
                              name: 'view-1',
                              url: 'http://192.168.68.65:5173'
                            }
                          },
                          {
                            type: 'component',
                            componentName: 'view',
                            componentState: {
                              name: 'view-1-1',
                              url: 'http://192.168.68.65:5173'
                            }
                          }
                        ]
                      },
                      {
                        type: 'stack',
                        content: [
                          {
                            type: 'component',
                            componentName: 'view',
                            componentState: {
                              name: 'view-2',
                              url: 'https://www.google.com'
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    type: 'row',
                    content: [
                      {
                        type: 'stack',
                        content: [
                          {
                            type: 'component',
                            componentName: 'view',
                            componentState: {
                              name: 'view-3',
                              url: 'https://www.github.com'
                            }
                          }
                        ]
                      },
                      {
                        type: 'stack',
                        content: [
                          {
                            type: 'component',
                            componentName: 'view',
                            componentState: {
                              name: 'view-4',
                              url: 'https://openfin.co'
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        })

        setIsReady(true)
      }
    }
    initPlatform()
  }, [])

  async function handleQuit() {
    if (typeof fin !== 'undefined') {
      const platform = fin.Platform.getCurrentSync()
      await platform.quit()
    }
  }

  if (!isReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #333',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Initializing platform...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <button
        onClick={handleQuit}
        style={{
          backgroundColor: '#dc2626',
          color: '#fff',
          border: 'none',
          padding: '24px 48px',
          fontSize: '24px',
          fontWeight: 'bold',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#b91c1c'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        QUIT APPLICATION
      </button>
    </div>
  )
}

export default ProviderApp
