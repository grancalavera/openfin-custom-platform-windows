# Implementation Plan: Parameterizable Dev Server IP

## Problem

The dev server IP (`192.168.68.65`) is hardcoded in multiple files. When someone else runs the project, they need to manually update all these locations with their own IP address.

## Solution

Use an environment variable (`VITE_DEV_HOST`) and generate `app.json` from a template at dev time.

---

## Files to Create

### 1. `app.json.template` (project root)

Template file with `{{HOST}}` placeholder:

```json
{
  "runtime": {
    "version": "stable"
  },
  "platform": {
    "uuid": "openfin-custom-platform",
    "autoShow": false,
    "providerUrl": "http://{{HOST}}:5173/provider.html"
  }
}
```

### 2. `scripts/generate-manifest.mjs`

Script to generate `public/app.json` from template:

```javascript
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

const host = process.env.VITE_DEV_HOST || 'localhost'

const template = readFileSync(resolve(projectRoot, 'app.json.template'), 'utf-8')
const manifest = template.replace(/\{\{HOST\}\}/g, host)

writeFileSync(resolve(projectRoot, 'public/app.json'), manifest)
console.log(`Generated public/app.json with host: ${host}`)
```

### 3. `.env.example`

Example env file for developers:

```
# Your machine's network IP address for Parallels/remote testing
# Find it with: ipconfig getifaddr en0
VITE_DEV_HOST=192.168.x.x
```

---

## Files to Modify

### 4. `vite.config.ts`

Change hardcoded IP to use environment variable:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_DEV_HOST || '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        provider: resolve(__dirname, 'provider.html'),
        platformWindow: resolve(__dirname, 'platform-window.html'),
      },
    },
  },
})
```

### 5. `scripts/launch.mjs`

Use environment variable for manifest URL:

```javascript
import { launch } from "@openfin/node-adapter"

async function launchOpenFin() {
  const host = process.env.VITE_DEV_HOST || 'localhost'

  try {
    const fin = await launch({
      manifestUrl: `http://${host}:5173/app.json`,
    })

    console.log(`OpenFin application launched successfully (host: ${host})`)

    fin.on("disconnected", () => {
      console.log("OpenFin runtime disconnected")
      process.exit(0)
    })
  } catch (error) {
    console.error("Failed to launch OpenFin:", error)
    process.exit(1)
  }
}

launchOpenFin()
```

### 6. `package.json`

Update scripts to generate manifest before dev/start:

```json
{
  "scripts": {
    "generate-manifest": "node scripts/generate-manifest.mjs",
    "dev": "npm run generate-manifest && vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "openfin": "node scripts/launch.mjs",
    "start": "npm run generate-manifest && concurrently \"vite\" \"npm run openfin\""
  }
}
```

Note: Removed `--host` from vite command since we handle it in config now.

### 7. `.gitignore`

Add generated manifest to gitignore:

```
# Generated OpenFin manifest
public/app.json
```

### 8. `AGENTS.md`

Update the Development Environment section:

```markdown
## Development Environment

- **Dev Server Port**: `5173`
- **Host Configuration**: Set `VITE_DEV_HOST` environment variable to your machine's network IP
- Testing is done on another machine in the same network (Parallels)

### Setup

1. Copy `.env.example` to `.env.local`
2. Set `VITE_DEV_HOST` to your machine's IP (find it with `ipconfig getifaddr en0`)
3. Run `npm run dev` or `npm run start`
```

### 9. `README.md`

Add a new section for development setup. Insert after the existing content or in an appropriate location:

```markdown
## Development Setup

This project is designed to be developed on macOS and tested on Windows via Parallels. The dev server needs to be accessible over the network.

### First-time Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Find your Mac's network IP address:
   ```bash
   ipconfig getifaddr en0
   ```

3. Edit `.env.local` and set your IP:
   ```
   VITE_DEV_HOST=192.168.x.x
   ```

### Running the Project

```bash
npm run dev      # Start Vite dev server only
npm run start    # Start dev server + OpenFin together
```

The `app.json` manifest is automatically generated with your configured IP when you run these commands.

### If Your IP Changes

1. Get your new IP: `ipconfig getifaddr en0`
2. Update `.env.local` with the new IP
3. Restart the dev server
```

---

## Files to Delete

### 10. `public/app.json`

This file will be generated from the template, so the original should be removed from version control.

```bash
rm public/app.json
```

---

## Developer Workflow (After Implementation)

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env.local`
4. Set `VITE_DEV_HOST` to their machine's IP
5. Run `npm run dev` or `npm run start`

The manifest is regenerated on every `dev`/`start`, so if their IP changes they just update `.env.local` and restart.

---

## Summary of Changes

| Action | File |
|--------|------|
| Create | `app.json.template` |
| Create | `scripts/generate-manifest.mjs` |
| Create | `.env.example` |
| Modify | `vite.config.ts` |
| Modify | `scripts/launch.mjs` |
| Modify | `package.json` |
| Modify | `.gitignore` |
| Modify | `AGENTS.md` |
| Modify | `README.md` |
| Delete | `public/app.json` |
