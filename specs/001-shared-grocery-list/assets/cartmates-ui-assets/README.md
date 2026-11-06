# CartMates UI asset pack

Implementation assets recreated as clean vectors from the supplied three-screen CartMates mockup, including the per-item “Added by” labels. The drawings preserve the visual direction of the mockup; they are vector reconstructions, not pixel-extracted originals.

## Quick start

1. Copy `public/assets/` into your Vite project's `public/assets/`.
2. Copy `design/tokens.css` into the app's source styles and import it.
3. Open `design/preview.html` locally to see the three screen compositions. It has no dependencies or network requests. This is a static reference, not a functional app.
4. Give Codex `CODEX-HANDOFF.md` and `design/mobile-screens.png` together with the app specification.

## What's included

- **30 SVG sources**: brand mark and outlined wordmark, 8 illustrations, lavender waves, 16 interface/identity icons, and 3 app/favicon designs.
- **66 transparent/opaque PNG exports**: 1× and 2× for every SVG, plus app-icon sizes 180 and 192, maskable 192, and favicons 16/32/48. Illustration PNGs have real alpha transparency.
- A monochrome icon sprite, ICO favicon, install-icon manifest snippet, CSS tokens, complete asset manifest, visual contact sheet, and phone-screen references.
- An export script for rebuilding PNGs after editing SVGs.

## Main asset mapping

| Use | Asset under `public/assets/` | Suggested display size |
| --- | --- | --- |
| Sign-in hero | `illustrations/cart-mascot.svg` | 210–230 px wide |
| Login decorative groceries | `illustrations/grocery-footer.svg` | Full viewport width |
| Login lavender waves | `backgrounds/login-waves.svg` | Full viewport width, behind groceries |
| Header mark | `brand/cartmates-mark.svg` | 36–40 px square |
| Optional complete brand lockup | `brand/cartmates-logo.svg` | 180–200 px wide |
| Bulk bought confirmation | `illustrations/cart-bought.svg` | 104 px square |
| Empty list | `illustrations/cart-empty.svg` | 170 px wide |
| Heading accent | `illustrations/celebration-rays.svg` | 32–40 px wide |
| Avatar | Live initials, CSS circle | 42–44 px square |
| Standard interface icons | `icons/*.svg` | 20–26 px inside ≥44 px target |
| Google identity mark | `icons/google-g.svg` | 20–28 px square |
| Browser favicon | `app/favicon.svg`, `app/favicon.ico` | Browser controlled |
| Apple touch icon | `app/app-icon-180.png` | 180×180 |
| Install icons | `app/app-icon-192.png`, `app/app-icon.png` | 192×192 and 512×512 |

The individual tomato, greens, and milk carton are optional composable versions of the footer artwork. Use the combined footer to reproduce the mockup.

## UI construction

Render text, inputs, rows, buttons, avatar initials, confirmation scrim, and bottom sheet with HTML/CSS. Keep grocery names and “Added by {displayName}” as live text. No rasterized text is required. The optional wordmark is outlined, so it requires no installed font.

Use `design/tokens.css` for the suggested palette, rounded shapes, shadows, and spacing. Values are inferred from the mockup. The confirmation-button green is slightly darker to keep white normal-size text above a 4.5:1 contrast ratio. Use the provided rounded system-font stack; no font download is required. Typography varies slightly by platform. The static PNG screen reference uses DejaVu Sans for portability.

The screen reference uses a 390×844 CSS-pixel content frame. The original device frame, camera cutout, OS time, cellular/Wi-Fi indicators, and home bar are not app assets. The HTML preview includes a faint bottom marker only to show the safe-area boundary; do not implement it in the app.

## Icon coloring

SVG is preferred over PNG for interface controls. Use the supplied sprite for inherited color:

```html
<button aria-label="Mark Milk bought" class="icon-button">
  <svg width="24" height="24" aria-hidden="true">
    <use href="/assets/icons/sprite.svg#check"></use>
  </svg>
</button>
```

```css
.icon-button { color: var(--cm-success-ink); min-width: 44px; min-height: 44px; }
```

Standalone SVG icons have a default muted color. Override the root `color` when inlining them, or use a CSS mask for external monochrome files. An `<img>` cannot inherit the surrounding CSS color. Keep the Google G multicolored and outside the monochrome sprite.

The Google G is a third-party identity mark. Do not recolor it. The production sign-in integration should use the identity provider's supported button component and current branding requirements. The included button is a design reference.

## Asset loading

```tsx
<img src="/assets/illustrations/cart-mascot.svg"
  width="230" height="176" alt="Smiling cart filled with groceries" />
<img src="/assets/illustrations/grocery-footer.svg" alt=""
  aria-hidden="true" className="login-groceries" />
```

```css
.login-groceries { position: absolute; width: 100%; left: 0; bottom: 0; pointer-events: none; }
```

Give content meaningful alternative text and decorative artwork empty alt text. Use accessible labels on icon-only buttons, visible focus rings, and sufficient contrast for small text. Make the complete 44×44 px area tappable, not only the visible checkbox. Respect reduced motion. Confirmations need dialog semantics and focus management in the actual app.

## PNG regeneration

```sh
npm install --no-save sharp
node scripts/export-png.cjs
```

The SVGs contain no remote image URLs, scripts, or embedded fonts. PNG exports are generated from those exact sources. `asset-manifest.json` maps their paths and dimensions. The monochrome sprite and screen references are supporting files, not additional runtime image requirements.

## Licensing

Original CartMates artwork and support code in this pack are provided under the included MIT license. The Google logo and Google name remain third-party marks and are excluded from that license grant. No third-party font files or photographic avatars are bundled.
