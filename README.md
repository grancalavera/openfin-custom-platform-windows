# OpenFin Custom Platform Windows

An OpenFin application built with Vite, React 19, and TypeScript featuring a custom frameless platform window.

## Architecture

```mermaid
flowchart TB
    subgraph Runtime["OpenFin Runtime"]
        direction TB
        
        subgraph Launch["Launch Process"]
            L1["scripts/launch.mjs"]
            L2["manifestUrl: http://192.168.68.65:5173/app.json"]
        end
        
        subgraph Manifest["public/app.json"]
            M1["Platform Configuration"]
            M2["providerUrl: /provider.html"]
        end
        
        subgraph Provider["Provider Window (Hidden)"]
            P1["provider.html"]
            P2["provider.tsx → ProviderApp.tsx"]
            P3["fin.Platform.init()"]
            P4["platform.createWindow()"]
        end
        
        subgraph PlatformWindow["Platform Window (Visible, Frameless)"]
            PW1["platform-window.html"]
            PW2["platform-window.tsx"]
            PW3["PlatformHeader Component"]
            PW4["#layout-container"]
            PW5["fin.Platform.Layout.init()"]
        end
        
        subgraph Layout["Layout (2x2 Grid)"]
            direction LR
            subgraph Row1["Row 1"]
                S1["Stack 1"]
                S2["Stack 2"]
            end
            subgraph Row2["Row 2"]
                S3["Stack 3"]
                S4["Stack 4"]
            end
        end
        
        subgraph Views["Views"]
            V1["view-1<br/>index.html → App.tsx"]
            V1_1["view-1-1<br/>index.html → App.tsx"]
            V2["view-2<br/>google.com"]
            V3["view-3<br/>github.com"]
            V4["view-4<br/>openfin.co"]
        end
    end

    L1 -->|"reads"| L2
    L2 -->|"fetches"| M1
    M1 -->|"specifies"| M2
    M2 -->|"loads"| P1
    P1 -->|"runs"| P2
    P2 --> P3
    P3 -->|"then"| P4
    P4 -->|"creates window with<br/>url + layout config"| PW1
    PW1 -->|"runs"| PW2
    PW2 --> PW3
    PW2 --> PW5
    PW5 -->|"initializes into"| PW4
    PW4 -->|"renders"| Layout
    
    S1 -->|"contains"| V1
    S1 -->|"contains"| V1_1
    S2 -->|"contains"| V2
    S3 -->|"contains"| V3
    S4 -->|"contains"| V4

    style Provider fill:#f9f,stroke:#333,stroke-width:2px
    style PlatformWindow fill:#bbf,stroke:#333,stroke-width:2px
    style Views fill:#bfb,stroke:#333,stroke-width:2px
```

## URL Relationships

| Component | URL | Role |
|-----------|-----|------|
| **Manifest** | `http://192.168.68.65:5173/app.json` | Entry point for OpenFin runtime |
| **Provider** | `/provider.html` | Hidden window that initializes the platform |
| **Platform Window** | `/platform-window.html` | Visible frameless window with custom chrome |
| **Local Views** | `/index.html` (root) | React app content loaded in views |
| **External Views** | google.com, github.com, openfin.co | External sites loaded in views |

## Loading Flow

1. **Launch** - `launch.mjs` tells OpenFin to fetch `app.json`
2. **Manifest** - OpenFin creates hidden provider window from `providerUrl`
3. **Provider** - Calls `fin.Platform.init()` then `platform.createWindow()` with layout config
4. **Platform Window** - Loads `platform-window.html`, runs `Layout.init()` into `#layout-container`
5. **Views** - Layout system loads each view URL into its designated stack

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript compile + Vite build
npm run lint         # Run ESLint
npm run start        # Dev server + OpenFin together
npm run openfin      # Launch OpenFin only
```

## Project Structure

```
src/
├── main.tsx           # React entry point
├── App.tsx            # Main component
├── provider.tsx       # Provider entry point
├── ProviderApp.tsx    # Platform initialization
├── platform-window.tsx # Layout initialization for custom window
├── types/openfin.d.ts # Global fin type declaration
public/
├── app.json           # OpenFin manifest
scripts/
└── launch.mjs         # OpenFin launcher
platform-window.html   # Custom platform window (frameless)
provider.html          # Provider window
index.html             # View content (React app)
```
