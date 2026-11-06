# Implementation instruction for Codex

Implement the approved CartMates UI using this asset pack. Follow the project's constitution, current SpecKit feature specification, and existing architecture. This pack describes presentation only; it does not change authentication, persistence, synchronization, or concurrency requirements.

1. Copy `public/assets/` to the application's public directory. Use the supplied SVG files directly; do not regenerate illustrations or substitute emoji.
2. Review `design/mobile-screens.png`, `design/preview.html`, and `design/tokens.css`. Match the three compositions: sign-in, active shopping list, and the confirmation bottom sheet for buying all items.
3. Use a pale lavender page, deep navy headings, white rounded rows, purple add action, soft green bought action, and soft red clear action. Use actual HTML/CSS for controls and all text. Keep the layout responsive beyond the 390×844 reference.
4. The login screen has the smiling-cart illustration, live CartMates title, subtitle, Google sign-in button, and decorative wave/produce footer. Prevent artwork from overlapping the button or text on short screens. Respect device safe areas.
5. The list header contains the cart brand mark, live app title, and the signed-in user's initials or existing profile image. Below it, show the group name and current item count.
6. Every list row has a comfortable checkbox-style bought button, item name, and small `Added by {displayName}` label beneath it. Use the authenticated creator's display name supplied by the server; sample names in the reference are illustrative. Keep item identity separate from its text and creator label. Derive creator identity server-side and treat display names as plain text.
7. The trailing ellipsis opens the existing Remove action in a small accessible menu. Do not add new list features. All members can buy or remove any item.
8. The add-item input and purple circular Add button sit near the bottom of the list screen, above Mark all bought and Clear list. Give the list its own scroll space and keep it usable with the mobile keyboard open. Use dynamic viewport sizing and safe-area insets rather than fixed screenshot coordinates.
9. Mark all bought opens the white bottom sheet with `cart-bought.svg`, live item count, confirm button, Cancel, and Close. Reuse the dialog pattern with appropriate text for Clear list. Dismissal must not mutate data. Keep keyboard focus inside an open modal and restore it after closing.
10. Use `cart-empty.svg` for a friendly empty state. Build loading and connectivity/error feedback with live text and the supplied spinner/refresh/offline/alert icons. Retain entered item text after failed submissions.
11. Keep buying and clearing behavior consistent with the approved spec. Provide pending feedback; update from the server's authoritative response. Do not invent history, categories, assignment, or offline editing.
12. Give icon controls minimum 44×44 CSS-pixel targets, accessible names, visible focus states, keyboard support, and reduced-motion support. Use live text for all member labels, counts, and dialog copy.

Asset mapping and usage examples are in `README.md`. Runtime paths begin `/assets/`. Choose SVG by default; use PNGs only when needed. Do not draw the phone frame, camera cutout, status bar, or home indicator from the original mockup inside the application.

For Google authentication, use the supported provider integration and applicable button branding. Keep identity-provider marks unmodified. Do not turn this static preview into an authentication implementation.
