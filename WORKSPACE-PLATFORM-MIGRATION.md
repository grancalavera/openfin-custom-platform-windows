# Migration Guide: @openfin/core → @openfin/workspace-platform

This guide covers migrating the platform initialization from `@openfin/core` to `@openfin/workspace-platform`, **without interop**. For FDC3/interop configuration, see [FDC3-INTENT-GUIDE.md](./FDC3-INTENT-GUIDE.md).

## Overview

| Aspect | Before (`@openfin/core`) | After (`@openfin/workspace-platform`) |
|--------|--------------------------|---------------------------------------|
| Package | `@openfin/core` (dependency) | `@openfin/workspace-platform` (dependency) + `@openfin/core` (devDependency for types) |
| Init | `fin.Platform.init({})` | `WorkspacePlatform.init({})` |
| Import | Global `fin` object | Explicit import |
| Manifest | `app.json` | `manifest.fin.json` (convention) |
| Browser UI | Manual platform windows | Built-in Browser component (optional) |

## Step 1: Update Dependencies

```bash
npm install @openfin/workspace-platform
```

**package.json changes:**

```diff
  "dependencies": {
+   "@openfin/workspace-platform": "^23.0.0",
    "@openfin/node-adapter": "^42.103.2",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
+   "@openfin/core": "^43.101.2",
    ...
  }
```

> **Note:** `@openfin/core` moves to **devDependencies** — it provides TypeScript types only. The `fin` global is injected by the OpenFin runtime at execution time.
>
> Check [npm @openfin/workspace-platform](https://www.npmjs.com/package/@openfin/workspace-platform) for the latest version. Reference: [workspace-platform-starter-basic](https://github.com/built-on-openfin/workspace-starter/tree/main/how-to/workspace-platform-starter-basic)

## Step 2: Update Platform Initialization

### Current: `src/platform.ts`

```typescript
export const initializePlatform = async () => {
  await fin.Platform.init({});
  const platform = fin.Platform.getCurrentSync();
  // ... createWindow calls
};
```

### Migrated: `src/platform.ts`

```typescript
import * as WorkspacePlatform from "@openfin/workspace-platform";

export const initializePlatform = async () => {
  // Initialize without Browser UI (headless mode)
  // Use browser: null when you want custom platform windows
  await WorkspacePlatform.init({
    browser: null,
  });

  // fin.Platform still available for window operations
  const platform = fin.Platform.getCurrentSync();

  await Promise.all([
    platform.createWindow({
      defaultLeft: 100,
      defaultTop: 100,
      layout: {
        content: [
          {
            type: "stack",
            content: [
              {
                type: "component",
                componentName: "view",
                componentState: {
                  name: "main-view-1",
                  url: "http://192.168.68.58:5173",
                },
              },
            ],
          },
        ],
      },
    }),
    platform.createWindow({
      defaultLeft: 760,
      defaultTop: 100,
      layout: {
        content: [
          {
            type: "stack",
            content: [
              {
                type: "component",
                componentName: "view",
                componentState: {
                  name: "main-view-2",
                  url: "http://192.168.68.58:5173",
                },
              },
            ],
          },
        ],
      },
    }),
  ]);
};
```

### Key Difference: `browser: null`

Setting `browser: null` initializes the platform **without** the Workspace Browser component. This is appropriate when:

- You have custom platform windows (like this project)
- You don't need the built-in tabbed browser UI
- You want to maintain your existing window management

Reference: [WorkspacePlatformInitConfig](https://developer.openfin.co/workspace/docs/platform/latest/interfaces/WorkspacePlatformInitConfig.html)

## Step 3: Update Manifest (Optional)

The workspace-platform convention uses `manifest.fin.json`, but `app.json` still works. If you rename:

**Current: `public/app.json`**

```json
{
  "runtime": {
    "version": "stable"
  },
  "platform": {
    "uuid": "openfin-custom-platform",
    "autoShow": false,
    "providerUrl": "http://192.168.68.58:5173/provider.html",
    "defaultWindowOptions": {
      "url": "http://192.168.68.58:5173/platform-window.html",
      "defaultWidth": 640,
      "defaultHeight": 800,
      "defaultCentered": true,
      "autoShow": true,
      "frame": false,
      "resizable": true,
      "contextMenu": true
    }
  }
}
```

No structural changes required for basic migration. The manifest structure remains compatible.

## Step 4: Update Type Definitions

### Current: `src/types/openfin.d.ts`

Keep existing `fin` declarations. Add workspace-platform types:

```typescript
// Existing fin declarations...

// WorkspacePlatform module is typed via the package itself
// No additional declarations needed if using:
// import * as WorkspacePlatform from "@openfin/workspace-platform";
```

## Step 5: Verify Provider Entry Point

**`src/provider.tsx`** — No changes required:

```typescript
import { initializePlatform } from "./platform";

const platformInitialized = initializePlatform();
// ... rest unchanged
```

## File Changes Summary

| File | Change |
|------|--------|
| `package.json` | Add `@openfin/workspace-platform` to dependencies; move `@openfin/core` to devDependencies |
| `src/platform.ts` | Add import, change `fin.Platform.init({})` → `WorkspacePlatform.init({ browser: null })` |
| `public/app.json` | No changes (optionally rename to `manifest.fin.json`) |
| `src/provider.tsx` | No changes |
| `src/ProviderApp.tsx` | No changes |

## Using Browser UI (Alternative)

If you want to use the built-in Workspace Browser instead of custom windows:

```typescript
import * as WorkspacePlatform from "@openfin/workspace-platform";

export const initializePlatform = async () => {
  await WorkspacePlatform.init({
    browser: {
      title: "My Platform",
      defaultWindowOptions: {
        // Browser window options
      },
    },
  });

  // Browser handles window creation automatically
  // Or use WorkspacePlatform.Browser.createWindow()
};
```

This provides the tabbed browser UI with built-in window management.

## Next Steps

1. **For FDC3/Interop**: See [FDC3-INTENT-GUIDE.md](./FDC3-INTENT-GUIDE.md) for adding intent handling with `interopOverride`
2. **For Workspace Components**: Consider adding Home, Store, Dock, Notifications
3. **For Theming**: Add `theme` to `WorkspacePlatform.init()` config

## References

- [WorkspacePlatformInitConfig](https://developer.openfin.co/workspace/docs/platform/latest/interfaces/WorkspacePlatformInitConfig.html)
- [BrowserInitConfig](https://developer.openfin.co/workspace/docs/platform/latest/interfaces/BrowserInitConfig.html)
- [workspace-starter examples](https://github.com/built-on-openfin/workspace-starter)
- [@openfin/workspace-platform on npm](https://www.npmjs.com/package/@openfin/workspace-platform)
