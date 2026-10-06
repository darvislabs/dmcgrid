# DMCGrid Design Principles (adapted from Opexminds governance)

## From design-taste-frontend (anti-slop)
- Never default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism, Inter + slate-900. Reach past them.
- One design system per project. One accent (Sand Gold #D4B483), used identically everywhere. One corner-radius system (cards 14, buttons/inputs 9, pills 999).
- Hero: headline max 2 lines, subtext max 20 words, CTA visible without scroll.
- ZERO em-dashes in UI copy. Hyphen or restructure.
- No decorative section-number eyebrows on every section — max 1 per 3 sections.
- Cards only when elevation communicates hierarchy; otherwise borders/negative space.
- No fake screenshots from divs — real rendered content only.
- Buttons: WCAG AA 4.5:1 text contrast; CTA labels never wrap.
- Motion must be motivated: hierarchy, storytelling, feedback, state transition.
- Respect prefers-reduced-motion.

## From emil-design-eng (polish)
- Buttons: transform scale(0.97) on :active; transition transform 160ms ease-out.
- Never animate from scale(0) — start scale(0.95) + opacity 0.
- Easing: --ease-out cubic-bezier(0.23,1,0.32,1); strong ease-in-out cubic-bezier(0.77,0,0.175,1).
- UI animations < 300ms: press 100–160ms, tooltips 125–200ms, dropdowns 150–250ms, modals 200–500ms.
- CSS transitions over keyframes (interruptible). Only animate transform/opacity (GPU).
- Popovers scale from trigger, not center. Stagger entries 30–80ms.
- Focus states always visible (gold ring 3px rgba(212,180,131,.15)).

## From ui-ux-pro-max
- Breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536. Touch targets ≥ 44x44.
- min-height:100dvh, never 100vh. Grid over flex-math.
- EVERY interactive component ships loading + empty + error states.

## From ckm:brand / brand-guidelines
- Logo clear space 2x mark height each side; min digital size 24px mark height.
- Dark-first: Midnight #0B0F14 base, high contrast, premium.
- Every color has one semantic role, documented.

## DMCGrid brand (from Dhrumil's style guide, Oct 5 2026)
- Fonts: Lufga PRIMARY (declared; Adam Ladd paid — Outfit ships as stand-in via fonts.css fallback until licensed), Plus Jakarta Sans SECONDARY, JetBrains Mono for numerals/data.
- Colors: Midnight #0B0F14 (brand bg) · Slate #1F2937 (surfaces/sidebars) · Sand Gold #D4B483 (brand accent) · Ivory #F7F3E9 (light theme bg/clean surfaces) · Stone #9CA3AF (secondary text) · Earth #3A3F36 (muted UI) · semantic: Success #10B981, Warning #F59E0B, Error #EF4444, Info #3B82F6, Travel Teal #0EA5A3 (travel highlights/Verified), Sunset #F97316 (illustrations/gradients).
- Iconography: 2px stroke outline, rounded corners, consistent geometry; brand gold accent for active state.
- Gradients: Sunrise #F7F3E9→#D4B483 · Midnight #0B0F14→#1F2937 · Atmosphere #1F2937→#3A3F36.
- Voice: trade-professional, terse, confident. Toasts read like "Time-wise line deleted ✓", "Moved up ✓", "Day sorted chronologically ✓" — action + result + check, never exclamation marks.
- Tagline: "From request to reality. On one platform." Descriptor: "Travel commerce infrastructure."
- Pillars: GLOBAL · CONNECTED · EFFICIENT · BUILT FOR PARTNERS.
