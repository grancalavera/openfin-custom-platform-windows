import type { OpenFin } from '@openfin/core'
import * as WorkspacePlatform from '@openfin/workspace-platform'

export const initializePlatform = async () => {
  await WorkspacePlatform.init({
    browser: null,
    interopOverride: async (InteropBroker, ...args) => {
      class CustomBroker extends InteropBroker {
        async handleFiredIntent(
          intent: OpenFin.Intent,
          clientIdentity: OpenFin.ClientIdentity & { entityType: OpenFin.EntityType }
        ) {
          console.log('Intent fired:', intent, 'from:', clientIdentity)

          // Find the receiver view that has registered the intent handler
          const platform = fin.Platform.getCurrentSync()
          const { uuid: platformUuid } = platform.identity

          // Set the intent target to our receiver view
          // The receiver view registers an addIntentListener for 'ViewChart'
          const targetIdentity = { uuid: platformUuid, name: 'receiver-view' }

          console.log('Routing intent to:', targetIdentity)
          await super.setIntentTarget(intent, targetIdentity)

          return {
            source: { appId: platformUuid, instanceId: targetIdentity.name },
            intent: intent.name,
            version: '2.0'
          }
        }
      }
      return new CustomBroker(...args)
    }
  })

  const platform = fin.Platform.getCurrentSync()
  const windowWidth = 640

  await Promise.all([
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
  ])
}
