import type { OpenFin } from '@openfin/core'
import * as WorkspacePlatform from '@openfin/workspace-platform'

export const initializePlatform = async () => {
  await WorkspacePlatform.init({
    browser: null,
    interopOverride: async (InteropBroker, ...args) => {
      class CustomBroker extends InteropBroker {
        // Track registered intent handlers: Map<intentName, Map<clientKey, clientIdentity>>
        private intentHandlers = new Map<string, Map<string, OpenFin.ClientIdentity>>()

        // Called when fdc3.addIntentListener() is invoked by a client
        async intentHandlerRegistered(
          payload: { handlerId: string },
          clientIdentity: OpenFin.ClientIdentity
        ) {
          const { handlerId } = payload
          // handlerId format is "intent-handler-{intentName}"
          const intent = handlerId.replace('intent-handler-', '')
          const clientKey = `${clientIdentity.uuid}-${clientIdentity.name}`

          if (!this.intentHandlers.has(intent)) {
            this.intentHandlers.set(intent, new Map())
          }
          this.intentHandlers.get(intent)!.set(clientKey, clientIdentity)

          console.log(`[InteropBroker] Registered handler for "${intent}" from:`, clientIdentity)

          return super.intentHandlerRegistered(payload, clientIdentity)
        }

        // Called when a client disconnects
        async clientDisconnected(clientIdentity: OpenFin.ClientIdentity) {
          const clientKey = `${clientIdentity.uuid}-${clientIdentity.name}`

          // Remove from all intent handler maps
          for (const [intent, handlers] of this.intentHandlers) {
            if (handlers.has(clientKey)) {
              handlers.delete(clientKey)
              console.log(`[InteropBroker] Removed handler for "${intent}" from:`, clientIdentity)
            }
          }

          return super.clientDisconnected(clientIdentity)
        }

        async handleFiredIntent(
          intent: OpenFin.Intent,
          clientIdentity: OpenFin.ClientIdentity & { entityType: OpenFin.EntityType }
        ) {
          console.log('[InteropBroker] Intent fired:', intent, 'from:', clientIdentity)

          const handlers = this.intentHandlers.get(intent.name)

          if (!handlers || handlers.size === 0) {
            console.warn(`[InteropBroker] No handlers registered for intent: ${intent.name}`)
            throw new Error(`No handlers for intent: ${intent.name}`)
          }

          // Route to all registered handlers
          const targets = Array.from(handlers.values())
          console.log(`[InteropBroker] Routing "${intent.name}" to ${targets.length} handler(s)`)

          for (const target of targets) {
            console.log('[InteropBroker] Routing to:', target)
            await super.setIntentTarget(intent, target)
          }

          return {
            source: { appId: fin.me.uuid },
            intent: intent.name,
            version: '2.0'
          }
        }
      }
      return new CustomBroker(...args)
    }
  })

  const platform = fin.Platform.getCurrentSync()
  const { uuid: platformUuid } = platform.identity
  const windowWidth = 640

  await Promise.all([
    // Platform window 1: Sender view
    platform.createWindow({
      defaultLeft: 100,
      defaultTop: 100,
      layout: {
        content: [
          {
            type: 'stack',
            content: [
              {
                type: 'component',
                componentName: 'view',
                componentState: {
                  name: 'sender-view',
                  url: 'http://192.168.68.64:5173/sender.html',
                },
              },
            ],
          },
        ],
      },
    }),

    // Platform window 2: Receiver view (platform view)
    platform.createWindow({
      defaultLeft: 100 + windowWidth + 20,
      defaultTop: 100,
      layout: {
        content: [
          {
            type: 'stack',
            content: [
              {
                type: 'component',
                componentName: 'view',
                componentState: {
                  name: 'receiver-view',
                  url: 'http://192.168.68.64:5173/receiver.html',
                },
              },
            ],
          },
        ],
      },
    }),

    // Core window 3: Receiver (fin.Window.create)
    fin.Window.create({
      name: 'core-receiver-window',
      uuid: platformUuid,
      url: 'http://192.168.68.64:5173/core-receiver.html',
      defaultLeft: 100 + (windowWidth + 20) * 2,
      defaultTop: 100,
      defaultWidth: windowWidth,
      defaultHeight: 800,
      autoShow: true,
      frame: true, // Use system frame to visually distinguish from platform windows
      fdc3InteropApi: '2.0', // Enable FDC3 for the core window
    }),
  ])
}
