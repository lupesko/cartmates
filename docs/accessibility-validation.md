# Accessibility Validation

## Recorded engineering validation

**Date**: 2026-11-06  
**Runner**: Connected Chromium browser, deterministic API fixture, no personal or production data

- Keyboard: Mark All opened with Enter, the primary confirmation received focus, Escape closed the
  native modal, and focus returned to the Mark All trigger.
- Responsive widths: 320, 390, 768, and 1440 CSS pixels had no horizontal overflow. The add field
  remained visible and list-wide actions remained reachable in the short mobile viewport.
- Targets: the per-item bought control measured 44 by 44 CSS pixels; list-wide controls measured at
  least 58 CSS pixels high at every checked width.
- Long content: a wrapping grocery name and mixed Latin/Hebrew creator name retained readable text
  and reachable controls.
- Reduced motion: nonessential transitions resolved to 0.01 ms under `prefers-reduced-motion`.
- Failure behavior: a disconnected mutation produced an assertive error with retry and did not
  remove the item or report false success.
- Visual review: app-only baselines cover sign-in, loading, populated, empty, recoverable error,
  fatal error, item menu, Clear, and Mark All states, with active-list layouts at all four widths.

Component semantics and the full axe/keyboard suite are part of `npm run test` and
`npm run test:e2e`. The connected runner confirmed browser interaction because this managed shell
does not permit local Chromium's Mach process registration.

## Release-device checks

Before a public release, a human release operator must verify and record the date/browser/device for
each item below without including private list content. These device and assistive-technology checks
cannot be truthfully replaced by automation.

- Current VoiceOver/Safari or NVDA/Chrome: sign in, hear list heading/count/creator, add, buy, remove,
  open/cancel/confirm both dialogs, recover from an error, and sign out.
- Keyboard only: logical focus order, visible focus, menu Escape, modal containment, close/cancel, and
  focus restoration.
- Touch only at 320px and 390px: comfortable targets and reachable controls with the virtual keyboard.
- Browser zoom at 200% and 400%: reflow without clipped actions, hidden meaning, or horizontal scroll.
- `prefers-reduced-motion`: no nonessential motion while state feedback remains clear.
- Slow and interrupted connection: pending, failure, retry, and authoritative reconciliation remain
  truthful and announced.
- Tablet 768px and desktop 1440px: all functionality remains readable and reachable.
- Decorative asset failure: core information and controls remain understandable.

Automated results do not by themselves establish complete WCAG conformance.
