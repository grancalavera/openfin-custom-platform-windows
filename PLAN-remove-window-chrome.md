# Plan: Remove OpenFin Window Chrome (Top Header Only)

## Goal

Remove the top window chrome (title bar with minimize/maximize/close buttons) while keeping the view tab headers. No dragging or custom window controls required.

## Current State

- `public/app.json` already has `"frame": false` in `defaultWindowOptions`
- The platform uses a `providerUrl` pointing to `provider.html`
- However, despite `frame: false`, OpenFin Platform windows still show a default header

## Why the Default Header Still Appears

Even with `frame: false`, OpenFin Platform windows render their own internal window chrome unless you provide a **Custom Window URL**. The current setup doesn't have a custom window HTML file with a `layout-container` div.

## Solution

Create a **Custom Platform Window** that:

1. Has `frame: false` (already set)
2. Provides a custom window HTML file with **only a `layout-container` div** (no title bar)
3. Calls `fin.Platform.Layout.init()` to initialize the layout system

## Files to Create/Modify

| File                      | Action     | Purpose                                                      |
| ------------------------- | ---------- | ------------------------------------------------------------ |
| `platform-window.html`    | **Create** | Minimal custom window HTML with just `layout-container`      |
| `src/platform-window.ts`  | **Create** | Initialize layout (call `fin.Platform.Layout.init()`)        |
| `public/app.json`         | **Modify** | Add `url` to `defaultWindowOptions` pointing to custom window |
| `vite.config.ts`          | **Modify** | Add `platform-window.html` as an entry point                 |

## Implementation Details

### 1. Create `platform-window.html`

Minimal, no-chrome window with only the layout container:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
      #layout-container {
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="layout-container"></div>
    <script type="module" src="/src/platform-window.ts"></script>
  </body>
</html>
```

### 2. Create `src/platform-window.ts`

Layout initialization script:

```typescript
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof fin !== 'undefined') {
    await fin.Platform.Layout.init()
  }
})
```

### 3. Modify `public/app.json`

Add the `url` property to `defaultWindowOptions`:

```json
"defaultWindowOptions": {
  "url": "http://192.168.68.65:5173/platform-window.html",
  "defaultWidth": 1280,
  "defaultHeight": 800,
  "defaultCentered": true,
  "autoShow": true,
  "frame": false,
  "resizable": true,
  "contextMenu": true
}
```

### 4. Modify `vite.config.ts`

Add `platform-window.html` as a build entry point so Vite processes it:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        provider: resolve(__dirname, 'provider.html'),
        platformWindow: resolve(__dirname, 'platform-window.html')
      }
    }
  }
})
```

## Expected Result

After implementation:

- The top window chrome (title bar with min/max/close) will be completely removed
- The view tab headers will remain (showing "openfin-custom-pla...", "Google", etc.)
- Views will fill the entire window from edge to edge
- Window cannot be dragged (as requested)
- Window can still be resized from edges (resizable: true is set)

## Testing

1. Run `npm run dev` to start the Vite dev server
2. Run `npm run openfin` to launch OpenFin
3. Verify the window has no top chrome
4. Verify tab headers still work for switching between views in stacks
