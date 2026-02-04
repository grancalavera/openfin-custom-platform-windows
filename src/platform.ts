import type { OpenFin } from "@openfin/core";
import * as WorkspacePlatform from "@openfin/workspace-platform";
import type {
  WindowType,
  Fdc3ContextWithRouting,
  PendingIntentRequest,
} from "./types/intent-routing";

// Base URL for receiver windows - update this when your network IP changes
const BASE_URL = "http://192.168.68.64:5173";

export const initializePlatform = async () => {
  await WorkspacePlatform.init({
    browser: null,
    interopOverride: async (InteropBroker, ...args) => {
      class CustomBroker extends InteropBroker {
        // Track registered intent handlers: Map<intentName, Map<clientKey, clientIdentity>>
        private intentHandlers = new Map<
          string,
          Map<string, OpenFin.ClientIdentity & { windowType?: WindowType }>
        >();
        // Track pending intents waiting for window registration
        private pendingIntents = new Map<string, PendingIntentRequest>();
        // Counter for unique window naming
        private windowCounter = 0;

        // Generate unique window name based on type
        private generateWindowName(windowType: WindowType): string {
          this.windowCounter++;
          return windowType === "platform-view"
            ? `receiver-view-${this.windowCounter}`
            : `core-receiver-window-${this.windowCounter}`;
        }

        // Create a receiver window based on type
        private async createReceiverWindow(
          windowType: WindowType,
          windowName: string,
        ): Promise<void> {
          const platform = fin.Platform.getCurrentSync();
          const { uuid: platformUuid } = platform.identity;

          // Calculate position based on existing windows
          const defaultLeft = 100 + this.windowCounter * 50;
          const defaultTop = 100 + this.windowCounter * 30;

          if (windowType === "platform-view") {
            await platform.createWindow({
              defaultLeft,
              defaultTop,
              defaultWidth: 400,
              defaultHeight: 850,
              layout: {
                content: [
                  {
                    type: "stack",
                    content: [
                      {
                        type: "component",
                        componentName: "view",
                        componentState: {
                          name: windowName,
                          url: `${BASE_URL}/receiver.html`,
                        },
                      },
                    ],
                  },
                ],
              },
            });
          } else {
            await fin.Window.create({
              name: windowName,
              uuid: platformUuid,
              url: `${BASE_URL}/core-receiver.html`,
              defaultLeft,
              defaultTop,
              defaultWidth: 400,
              defaultHeight: 850,
              autoShow: true,
              frame: true,
              fdc3InteropApi: "2.0",
            });
          }
        }

        // Filter existing handlers by window type
        private filterHandlersByType(
          handlers: Map<
            string,
            OpenFin.ClientIdentity & { windowType?: WindowType }
          >,
          windowType: WindowType,
        ): Array<OpenFin.ClientIdentity & { windowType?: WindowType }> {
          return Array.from(handlers.values()).filter((handler) => {
            // Determine type based on window name pattern
            const name = handler.name || "";
            if (windowType === "platform-view") {
              return name.includes("receiver-view") || name === "receiver-view";
            } else {
              return name.includes("core-receiver");
            }
          });
        }

        // Called when fdc3.addIntentListener() is invoked by a client
        async intentHandlerRegistered(
          payload: { handlerId: string },
          clientIdentity: OpenFin.ClientIdentity,
        ) {
          const { handlerId } = payload;
          // handlerId format is "intent-handler-{intentName}"
          const intent = handlerId.replace("intent-handler-", "");
          const clientKey = `${clientIdentity.uuid}-${clientIdentity.name}`;

          if (!this.intentHandlers.has(intent)) {
            this.intentHandlers.set(intent, new Map());
          }
          this.intentHandlers.get(intent)!.set(clientKey, clientIdentity);

          console.log(
            `[InteropBroker] Registered handler for "${intent}" from:`,
            clientIdentity,
          );

          // Check if there's a pending intent waiting for this window
          const windowName = clientIdentity.name;
          if (windowName) {
            const pending = this.pendingIntents.get(windowName);
            if (pending && pending.intent.name === intent) {
              console.log(
                `[InteropBroker] Found pending intent for window: ${windowName}`,
              );
              try {
                await super.setIntentTarget(pending.intent, clientIdentity);
                pending.resolve({
                  source: { appId: fin.me.uuid },
                  intent: pending.intent.name,
                  version: "2.0",
                });
              } catch (error) {
                pending.reject(
                  error instanceof Error ? error : new Error(String(error)),
                );
              }
              this.pendingIntents.delete(windowName);
            }
          }

          return super.intentHandlerRegistered(payload, clientIdentity);
        }

        // Called when a client disconnects
        async clientDisconnected(clientIdentity: OpenFin.ClientIdentity) {
          const clientKey = `${clientIdentity.uuid}-${clientIdentity.name}`;

          // Remove from all intent handler maps
          for (const [intent, handlers] of this.intentHandlers) {
            if (handlers.has(clientKey)) {
              handlers.delete(clientKey);
              console.log(
                `[InteropBroker] Removed handler for "${intent}" from:`,
                clientIdentity,
              );
            }
          }

          return super.clientDisconnected(clientIdentity);
        }

        async handleFiredIntent(
          intent: OpenFin.Intent,
          clientIdentity: OpenFin.ClientIdentity & {
            entityType: OpenFin.EntityType;
          },
        ) {
          console.log(
            "[InteropBroker] Intent fired:",
            intent,
            "from:",
            clientIdentity,
          );

          // Extract routing metadata from context
          const context = intent.context as Fdc3ContextWithRouting | undefined;
          const routingMetadata = context?._routingMetadata;
          const windowType = routingMetadata?.windowType ?? "platform-view";
          const createNew = routingMetadata?.createNew ?? false;

          // Strip routing metadata from context before forwarding
          if (context?._routingMetadata) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _routingMetadata: _metadata, ...cleanContext } = context;
            intent = { ...intent, context: cleanContext };
          }

          const handlers = this.intentHandlers.get(intent.name);

          // If not creating new and there are existing handlers of the right type, route to them
          if (!createNew && handlers && handlers.size > 0) {
            const matchingHandlers = this.filterHandlersByType(
              handlers,
              windowType,
            );
            if (matchingHandlers.length > 0) {
              console.log(
                `[InteropBroker] Routing to existing ${windowType} handler`,
              );
              for (const target of matchingHandlers) {
                await super.setIntentTarget(intent, target);
              }
              return {
                source: { appId: fin.me.uuid },
                intent: intent.name,
                version: "2.0",
              };
            }
          }

          // Need to create a new window
          const windowName = this.generateWindowName(windowType);
          console.log(
            `[InteropBroker] Creating new ${windowType} window: ${windowName}`,
          );

          // Create promise for pending intent
          return new Promise((resolve, reject) => {
            // Store pending intent
            this.pendingIntents.set(windowName, {
              intent,
              windowName,
              resolve,
              reject,
            });

            // Set up timeout
            const timeoutId = setTimeout(() => {
              if (this.pendingIntents.has(windowName)) {
                this.pendingIntents.delete(windowName);
                reject(
                  new Error(
                    `Timeout: Window "${windowName}" did not register handler within 10s`,
                  ),
                );
              }
            }, 10000);

            // Create the window
            this.createReceiverWindow(windowType, windowName).catch((error) => {
              clearTimeout(timeoutId);
              this.pendingIntents.delete(windowName);
              reject(error instanceof Error ? error : new Error(String(error)));
            });

            // Update resolve to clear timeout
            const originalResolve =
              this.pendingIntents.get(windowName)!.resolve;
            this.pendingIntents.get(windowName)!.resolve = (value) => {
              clearTimeout(timeoutId);
              originalResolve(value);
            };
          });
        }
      }
      return new CustomBroker(...args);
    },
  });

  const platform = fin.Platform.getCurrentSync();

  // Only create the sender view - receiver windows are created dynamically
  await platform.createWindow({
    defaultLeft: 100,
    defaultTop: 100,
    defaultWidth: 400,
    defaultHeight: 850,
    layout: {
      content: [
        {
          type: "stack",
          content: [
            {
              type: "component",
              componentName: "view",
              componentState: {
                name: "sender-view",
                url: `${BASE_URL}/sender.html`,
              },
            },
          ],
        },
      ],
    },
  });
};
