# DMCGRID BRAND GUIDELINES + DESIGN SYSTEM — MASTER BUILD (Figma+ quality)

## Your Mission
Build the definitive DMCGrid brand guidelines + design system as a SINGLE self-contained `index.html`, modeled on the Opexminds design system's depth and structure (read `/home/ubuntu/opexminds-designsystem/design-system.html` as the structural benchmark — 21 sections, ~2,950 lines, working theme toggle, inline SVG symbol logo, 216px sidebar nav, hairline grids). Do NOT copy its content or visual identity — DMCGrid has its own brand (below). Match the DEPTH: every section fully worked, real rendered components, working interactions.

## MANDATORY: Read these FIRST
1. `/home/ubuntu/dmcgrid/design/DESIGN_PRINCIPLES.md` — quality rules + exact brand tokens. Follow them.
2. `/home/ubuntu/opexminds-designsystem/design-system.html` — structural benchmark for section depth, sidebar nav pattern, theme toggle, grid treatment.
3. `/home/ubuntu/dmcgrid/design/dmcgrid-design-system.html` — existing v1.0 token layer + components (supersede it, absorb it).
4. `/home/ubuntu/dmcgrid/reference/prototype-v62.html` — the product prototype; source for Product Components section (78 component classes: wizard, RFQ progress, calendar range picker, year/month tabs, counters, chips, compare tables, time-wise table, deal sheet, tax tracker, version tags, side panel, day editor, timeline rows, drag/move actions).
5. `/home/ubuntu/dmcgrid/design/assets/` — fonts (self-hosted woff2) + logo crops (stopgap PNGs from style guide).

## BRAND (non-negotiable)
- Fonts: use the Opexminds-proven pattern — Fontshare CDN `<link>` for Outfit + Plus Jakarta Sans + JetBrains Mono (`https://api.fontshare.com/v2/css?f[]=outfit@300,400,500,600,700&f[]=plus-jakarta-sans@300,400,500,600,700&f[]=jetbrains-mono@400,500,600&display=swap`) PLUS local @font-face fallback comments referencing assets/fonts/. Font-family stacks must declare 'Lufga' first, 'Outfit' second (Lufga renders automatically once the licensed woff2 drops in).
- Colors (dark-first): Midnight #0B0F14 bg · Slate #1F2937 surfaces · Sand Gold #D4B483 accent (ONE accent, everywhere) · Stone #9CA3AF secondary text · Earth #3A3F36 muted · Ivory #F7F3E9 light-theme bg · semantic: Success #10B981, Warning #F59E0B, Error #EF4444, Info #3B82F6, Travel Teal #0EA5A3, Sunset #F97316.
- Logo: inline SVG `<symbol id="dmc">` — use the stopgap mark path traced from design/assets/mark-from-guide.png (curved path forming a D with a journey arc + gold dot). NEVER external files. If an SVG is provided later it drops into this symbol 1:1.
- Tagline: "From request to reality. On one platform." Descriptor: "Travel commerce infrastructure." Pillars: GLOBAL · CONNECTED · EFFICIENT · BUILT FOR PARTNERS.
- Theme: `data-theme="dark"|"light"` on `<html>`, CSS variables swap (dark default). Light theme: Ivory #F7F3E9 bg, Slate cards, same gold accent.

## REQUIRED SECTIONS (18 — DMCGrid's own structure, sidebar-grouped)
Cover · Brand Purpose · Logo Deep Dive (construction from geometry: curved path → D + journey) · Do & Don'ts · Color System (primary + semantic + gradients + usage rules) · Typography (Lufga scale + PJS + JetBrains Mono, live specimens, do/don't) · Iconography (2px stroke set, gold active) · Imagery & Tone of Voice · Design System Overview · Global Tokens (full table) · Key Elements & Atoms (buttons incl. all states, badges, inputs, chips, pills, avatars, toggles, checkboxes, radios, sliders, tooltips, progress) · Components (cards, tables incl. tabular numerals, tabs, modals, toasts, dropdowns, side panels, empty/loading/error states) · Product Components (from V62 prototype: RFQ wizard + progress stepper, calendar range picker, year/month tabs, counters, requirement chips, compare table + time-wise table, connect flow, deal sheet + TDS tracker, version tags, day editor + timeline, proposal hero, manager-approval gate) · Admin Deep States · Theming Architecture (dark/light tokens side by side) · Design Patterns (RFQ lifecycle, quote versioning, approval chain) · Code Snippets (tokens.css + component CSS) · Motion & Timing Curves · Depth & Elevation.

## QUALITY BAR (from DESIGN_PRINCIPLES.md — enforce all)
- Working theme toggle (dark/light), persisted in localStorage.
- Working interactions: copy-token-on-click, tab switching, modal open/close, toast demo, accordion Do/Don'ts.
- Sidebar: 216px fixed desktop with grouped nav + active state; mobile 52px top bar + drawer.
- All tables use JetBrains Mono tabular numerals, right-aligned amounts, ₹ with NO space.
- Zero em-dashes in UI copy. Stagger animations 30–80ms. Focus-visible gold ring everywhere.
- Single file, no external requests (fonts inline). 

## ANTI-COMPRESSION (non-negotiable — the #1 quality failure)
- Expected size: 90–150KB of rich content. Do NOT compress content to save size.
- Every section must have FULL, RICH content. Do not abbreviate. Complete copy, complete data, complete component states.
- Minimum depth per section type: every palette swatch = 110px color block + 3 tint strips + HEX/RGB + usage note; ALL icons rendered as inline SVGs (no placeholders); every button/badge/input shown in ALL its states (default/hover/active/disabled/focus); every Do & Don't pair = visual example + explanation.
- JS-generated markup is allowed but every section must render complete content at runtime — terse fragments get rejected.

## VISUAL DEPTH (match/exceed the Opexminds benchmark)
- Subtle film grain overlay (SVG feTurbulence, fixed, opacity .03, mix-blend overlay).
- Ambient warm mesh in dark cover: radial-gradient gold at low opacity (rgba(212,180,131,.05) class).
- Cards: layered shadows `0 1px 3px rgba(0,0,0,.12), 0 0 0 1px rgba(255,255,255,.06)` dark mode; gradient borders on key cards via background-clip trick.
- Scroll-reveal via IntersectionObserver: `.reveal` opacity 0/translateY(16px) → in, 0.6s cubic-bezier(0.23,1,0.32,1), stagger 60ms via --i. Respect prefers-reduced-motion.
- Buttons: transform 160ms, :active scale(0.97). Cards hover: translateY(-2px) + elevated shadow.
- Easing vars everywhere: --ease-out cubic-bezier(0.23,1,0.32,1); --ease-in-out cubic-bezier(0.77,0,0.175,1).
- Layout variation (4+ families): quote-led (brand purpose), asymmetric split (logo dive), bento grid (tokens/atoms), full-bleed (color system, data tables), stacked layers (elevation), two-column sticky-left (theming, principles). Alternate section bg var(--bg)/var(--alt), one theme, no mid-page flip.

## Deliverable
`/home/ubuntu/dmcgrid/design/brand-guidelines.html` — one self-contained file. Then verify: load in browser, theme toggle works, zero console errors, all 18 sections render, all interactions work.
