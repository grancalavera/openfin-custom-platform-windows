# Implementation Plan: Programmatic Window Creation from Provider

## Current State

- **app.json** uses a `snapshot` to declaratively create windows with layouts at startup
- **ProviderApp.tsx** initializes the platform with `fin.Platform.init({})` and just shows a quit button
- **platform-window.html** + **platform-window.tsx** provide the custom frameless window UI with header and layout container

## Goal

Remove the `snapshot` and `defaultWindowOptions` from app.json and instead create windows programmatically from the provider after `fin.Platform.init()` completes, with full dynamic control over all window options.

---

## Step 1: Update `public/app.json`

Remove both `snapshot` and `defaultWindowOptions`, leaving only the minimal platform configuration:

```json
{
  "runtime": {
    "version": "stable"
  },
  "platform": {
    "uuid": "openfin-custom-platform",
    "autoShow": false,
    "providerUrl": "http://192.168.68.65:5173/provider.html"
  }
}
```

---

## Step 2: Update `src/ProviderApp.tsx`

Modify the `initPlatform()` function to create the window programmatically after platform initialization, passing all window options directly:

```typescript
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
```

**Note:** All window options are passed directly to `createWindow()`, giving full dynamic control at runtime. This allows computing options based on conditions, user preferences, screen size, etc.

---

## Summary of Changes

| File | Change |
|------|--------|
| `public/app.json` | Remove `snapshot` and `defaultWindowOptions`, keep only runtime and platform basics |
| `src/ProviderApp.tsx` | Add `platform.createWindow()` call with both window options and layout definition |

---

## Result

- Platform starts with provider only (hidden)
- Provider initializes and programmatically creates the window with all options defined in code
- Window uses `platform-window.html` as specified in the `url` option
- Layout is defined in the provider code, giving you full programmatic control
- Window options can be dynamically computed based on runtime conditions
