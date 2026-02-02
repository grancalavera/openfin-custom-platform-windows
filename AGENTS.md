# Agent Instructions

This is an **OpenFin application** built with **Vite**, **React 19**, and **TypeScript**. All code must be written in TypeScript, including OpenFin API usage.

## Development Environment

- Developed on **Mac**, tested on **Windows via Parallels**
- Run `npm run dev` to start the dev server (uses `--host` flag for network access)
- Vite will display available Network URLs in the terminal:

  ```
  VITE v7.3.1  ready in 279 ms

    ➜  Local:   http://localhost:5173/
    ➜  Network: http://10.20.0.224:5173/
  ```

- Use one of the **Network IPs** (not `localhost`) since testing is on another machine
- **Note:** IPs shown in this doc and code are for **illustration only** - they will vary based on your network

### Updating the Dev Server IP

When your network IP changes, update these files:

| File              | Lines  | What to update                               |
| ----------------- | ------ | -------------------------------------------- |
| `public/app.json` | 8, 10  | `providerUrl` and `defaultWindowOptions.url` |
| `src/platform.ts` | 20, 41 | View URLs for dynamically created windows    |

## Commands

```bash
npm run dev      # Start Vite dev server (with --host for network access)
npm run build    # TypeScript compile + Vite build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## OpenFin Integration

The `fin` global may or may not be available depending on runtime. Always check before using:

```typescript
if (typeof fin !== "undefined") {
  const app = await fin.Application.getCurrent();
  // OpenFin-specific code here
}
```

The `fin` type is declared globally in `src/types/openfin.d.ts`. All OpenFin code must be properly typed.

## Code Style

- **No semicolons**
- **Single quotes** for strings
- Use **function declarations** for React components (not arrow functions)
- Use **explicit TypeScript generics** when type isn't inferred:
  ```typescript
  const [data, setData] = useState<string | null>(null);
  ```
- Use `import type` for type-only imports:
  ```typescript
  import type { Fin } from "@openfin/core";
  ```

## Project Structure

```
src/
├── main.tsx             # React entry point (main app)
├── App.tsx              # Main app component
├── provider.tsx         # Provider entry point
├── ProviderApp.tsx      # Provider React component
├── platform.ts          # Platform initialization logic
├── platform-window.tsx  # Platform window with React header
├── types/openfin.d.ts   # Global fin type declaration
public/
├── app.json             # OpenFin manifest
provider.html            # Provider HTML
platform-window.html     # Custom platform window (frameless)
```

## Custom Platform Window

This project uses a **custom platform window** to remove the default OpenFin window chrome. The standard OpenFin `platform-api-project-seed` includes these components in `platform-window.html`:

| Component          | Description                                                                                                               | Status                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `<title-bar>`      | Custom element with draggable area, theme toggle, menu toggle, layout lock, and window controls (minimize/maximize/close) | **Replaced with React** |
| `<left-menu>`      | Sidebar with view management, layout save/restore, snapshot controls, and preset arrangements                             | **Removed**             |
| `<layout-form>`    | Form for layout configuration                                                                                             | **Removed**             |
| `<snapshot-form>`  | Form for snapshot management                                                                                              | **Removed**             |
| `frame-styles.css` | Styling for custom chrome components                                                                                      | **Removed**             |
| `light-theme.css`  | Light theme styling                                                                                                       | **Removed**             |

Our `platform-window.html` loads a React app (`src/platform-window.tsx`) that provides:

- **Custom React header** - draggable area (uses `-webkit-app-region: drag`) with a Close button
- **Layout container** - the `#layout-container` div required by OpenFin's Platform Layout system
- **View tab headers** - tabs for switching between views in stacks still work

The `src/platform-window.tsx` component initializes the layout system via `fin.Platform.Layout.init()` in a `useEffect` hook.
