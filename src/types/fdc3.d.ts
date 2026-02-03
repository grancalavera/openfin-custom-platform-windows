interface Fdc3Context {
  type: string
  name?: string
  id?: Record<string, string>
  [key: string]: unknown
}

interface Fdc3Listener {
  unsubscribe: () => void
}

interface Fdc3IntentResolution {
  source: { appId: string; instanceId?: string }
  intent: string
  getResult?: () => Promise<unknown>
}

interface Fdc3DesktopAgent {
  raiseIntent(intent: string, context: Fdc3Context): Promise<Fdc3IntentResolution>
  addIntentListener(
    intent: string,
    handler: (context: Fdc3Context) => void
  ): Promise<Fdc3Listener>
}

declare global {
  const fdc3: Fdc3DesktopAgent | undefined

  interface Window {
    fdc3?: Fdc3DesktopAgent
  }

  interface WindowEventMap {
    fdc3Ready: Event
  }
}

export type { Fdc3Context, Fdc3Listener, Fdc3IntentResolution, Fdc3DesktopAgent }
