import { StrictMode, Suspense, use } from 'react'
import { createRoot } from 'react-dom/client'
import './types/openfin.d.ts'
import { initializeLayout } from './layout'

const layoutInitialized = initializeLayout()

const headerStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 24px",
  background: "#2c2c2c",
  color: "white",
  // @ts-expect-error -webkit-app-region is a non-standard CSS property
  WebkitAppRegion: "drag",
};

const titleStyles: React.CSSProperties = {
  margin: 0,
  fontFamily: "system-ui, sans-serif",
  fontSize: "16px",
  fontWeight: 600,
};

const buttonStyles: React.CSSProperties = {
  // @ts-expect-error -webkit-app-region is a non-standard CSS property
  WebkitAppRegion: "no-drag",
  background: "#e74c3c",
  border: "none",
  color: "white",
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  borderRadius: "4px",
};

function PlatformHeader() {
  async function handleClose() {
    if (typeof fin !== "undefined") {
      const currentWindow = await fin.Window.getCurrent();
      await currentWindow.close();
    }
  }

  return (
    <header style={headerStyles}>
      <h1 style={titleStyles}>Application Header</h1>
      <button
        style={buttonStyles}
        onClick={handleClose}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#c0392b";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#e74c3c";
        }}
      >
        Close
      </button>
    </header>
  );
}

type PlatformWindowProps = {
  layoutInitialized: Promise<void>
}

function PlatformWindow(props: PlatformWindowProps) {
  use(props.layoutInitialized)

  return <PlatformHeader />
}

createRoot(document.getElementById('platform-root')!).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <PlatformWindow layoutInitialized={layoutInitialized} />
    </Suspense>
  </StrictMode>
)
