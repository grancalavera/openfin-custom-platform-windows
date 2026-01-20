# Customizing OpenFin Platform Window Frames with Layouts

**Yes, you can use frameless windows with custom HTML headers for Platform windows that contain layouts.** The approach is nearly identical to plain OpenFin windows, with one critical requirement: your custom window HTML must include a `<div id="layout-container"></div>` element where the Platform Layout system injects the tabbed/split views.

OpenFin provides two distinct approaches: **Default Windows** (standard frame with CSS customization via `stylesheetUrl`) and **Custom Windows** (complete frame control via a custom HTML file). For full custom chrome similar to plain windows, use the Custom Window approach.

## The Custom Platform Window approach explained

To create Platform windows with custom frames, you specify a `url` property in `defaultWindowOptions` that points to your custom window HTML. This HTML file contains your custom title bar, window controls, and crucially, a `layout-container` div where OpenFin injects the layout content.

**Manifest configuration (manifest.fin.json):**

```json
{
  "platform": {
    "uuid": "my-platform",
    "providerUrl": "http://localhost:5000/provider.html",
    "defaultWindowOptions": {
      "url": "http://localhost:5000/platform-window.html",
      "frame": false,
      "shadow": true,
      "resizeRegion": { "size": 4, "bottomRightCorner": 8 },
      "cornerRounding": { "width": 5, "height": 5 },
      "autoShow": true,
      "defaultWidth": 800,
      "defaultHeight": 600
    }
  }
}
```

**Custom Platform Window HTML (platform-window.html):**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body style="height: 100%;">
    <div id="of-frame-main">
      <!-- Custom Title Bar -->
      <div id="title-bar">
        <div class="title-bar-draggable" style="-webkit-app-region: drag;">
          <div id="title">My Custom Frame</div>
        </div>
        <div id="buttons-wrapper" style="-webkit-app-region: no-drag;">
          <div class="button" id="minimize-button"></div>
          <div class="button" id="expand-button"></div>
          <div class="button" id="close-button"></div>
        </div>
      </div>

      <!-- CRITICAL: Layout container where Platform injects tabs/splits -->
      <div id="layout-container"></div>

      <script src="./custom-frame.js"></script>
    </div>
  </body>
</html>
```

Three requirements are non-negotiable: the `layout-container` div with that exact ID, the body element set to `height: 100%`, and calling `fin.Platform.Layout.init()` in your JavaScript. The `-webkit-app-region: drag` CSS property enables window dragging on your custom title bar.

## JavaScript initialization for custom windows

Your custom window must initialize the layout and implement window control buttons manually:

```javascript
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize layout into the layout-container div
  await fin.Platform.Layout.init();

  // Set up window controls
  const win = fin.Window.getCurrentSync();

  document.getElementById("minimize-button").onclick = () => win.minimize();
  document.getElementById("expand-button").onclick = async () => {
    const state = await win.getState();
    state === "maximized" ? win.restore() : win.maximize();
  };
  document.getElementById("close-button").onclick = () => win.close();
});
```

## Platform API options for window customization

The `defaultWindowOptions` object supports extensive frame-related settings:

| Option             | Type    | Description                                                         |
| ------------------ | ------- | ------------------------------------------------------------------- |
| `url`              | string  | Custom HTML file—setting this enables Custom Window mode            |
| `frame`            | boolean | Set `false` to remove OS chrome entirely                            |
| `stylesheetUrl`    | string  | CSS injection for Default Windows only (ignored for Custom Windows) |
| `shadow`           | boolean | Display drop shadow on frameless windows                            |
| `cornerRounding`   | object  | `{ width: number, height: number }` for rounded corners             |
| `resizeRegion`     | object  | Defines resize interaction areas for frameless windows              |
| `roundedCorners`   | boolean | Controls frameless window rounded corners                           |
| `disableAppRegion` | boolean | Prevents `-webkit-app-region` CSS from working                      |

The `stylesheetUrl` option applies only to Default Windows using OpenFin's built-in frame—it has no effect on Custom Windows with your own HTML.

## How this differs from plain OpenFin windows

The customization approach is conceptually identical: set `frame: false`, provide custom HTML with a title bar, use `-webkit-app-region: drag` for draggable areas, and implement your own window controls. The key differences:

| Feature            | Plain Window          | Platform Window                            |
| ------------------ | --------------------- | ------------------------------------------ |
| Creation method    | `fin.Window.create()` | `platform.createWindow()`                  |
| Layout management  | Manual                | Automatic via `layout-container` div       |
| Views/tabs support | Manual embedding      | Native multi-view with tabs, stacks, grids |
| JavaScript init    | None required         | Must call `fin.Platform.Layout.init()`     |
| Snapshot support   | None                  | Built-in save/restore for layouts          |

Platform windows automatically manage layout state, view creation, and snapshot persistence—features you'd have to implement manually with plain windows.

## Layout CSS classes for styling tabs and content

When styling Platform layouts, target these GoldenLayout CSS classes:

- **`.lm_root`** — Top-level container of all layout elements
- **`.lm_stack`** — Container for a stack of tabs (holds `.lm_header` and `.lm_items`)
- **`.lm_header`** — Tab navigation bar area
- **`.lm_tabs`** — Parent container for tab elements
- **`.lm_tab`** — Individual tab containing title and close button
- **`.lm_items`** — Parent container for all view content
- **`.lm_item_container`** — Placeholder where actual Views render

## Example repositories and resources

The **container-starter** repository contains examples in `how-to/use-window-options/` and `how-to/create-window/` directories. However, the most comprehensive Platform window customization examples are in the archived but still relevant **platform-api-project-seed** repository at `https://github.com/openfin/platform-api-project-seed`.

Key files in platform-api-project-seed include `platform-window.html` (custom window with layout-container), `js/platform-window.js` (window control logic), and `styles/frame-styles.css` (visual customization).

Additional resources include the **layouts-v2-style-examples** repository at `https://github.com/openfin/layouts-v2-style-examples` for CSS customization patterns.

## Conclusion

Custom window frames work with Platform layouts through a Custom Window approach that parallels plain OpenFin window customization. The critical addition is the `layout-container` div and the `fin.Platform.Layout.init()` call—these connect your custom frame to OpenFin's layout management system while preserving full control over window chrome, styling, and behavior. This architecture lets you maintain consistent visual branding across both simple windows and complex multi-view Platform windows.
