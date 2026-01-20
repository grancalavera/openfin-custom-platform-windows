# Agent Instructions

This is an **OpenFin application** built with **Vite**, **React 19**, and **TypeScript**. All code must be written in TypeScript, including OpenFin API usage.

## Development Environment

- **Dev Server URL**: `http://192.168.68.65:5173`
- Do NOT use `localhost` - always use the network IP above
- Testing is done on another machine in the same network

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript compile + Vite build
npm run lint         # Run ESLint
npm run start        # Dev server + OpenFin together
npm run openfin      # Launch OpenFin only
```

## OpenFin Integration

The `fin` global may or may not be available depending on runtime. Always check before using:

```typescript
if (typeof fin !== 'undefined') {
  const app = await fin.Application.getCurrent()
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
  const [data, setData] = useState<string | null>(null)
  ```
- Use `import type` for type-only imports:
  ```typescript
  import type { Fin } from "@openfin/core"
  ```

## Project Structure

```
src/
├── main.tsx           # React entry point
├── App.tsx            # Main component
├── types/openfin.d.ts # Global fin type declaration
public/
├── app.json           # OpenFin manifest
scripts/
└── launch.mjs         # OpenFin launcher
```
