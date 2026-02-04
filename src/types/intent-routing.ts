import type { OpenFin } from '@openfin/core'

export type WindowType = 'platform-view' | 'core-window'

export interface IntentRoutingMetadata {
  windowType: WindowType
  createNew: boolean
}

export interface Fdc3ContextWithRouting {
  type: string
  name?: string
  id?: Record<string, string>
  _routingMetadata?: IntentRoutingMetadata
  [key: string]: unknown
}

export interface PendingIntentRequest {
  intent: OpenFin.Intent
  windowName: string
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}
