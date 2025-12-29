# Vibe Planner — Design Standards

> Purpose: A single-source-of-truth design standard to keep UI consistent across the product. Includes color tokens, typography, spacing system, components, accessibility rules, motion, and example CSS variables.

---

## 1. Brand Colors (tokens)

Use CSS variables (global :root). All values are hex unless otherwise noted.

```css
:root {
  /* Primary Gradient */
  --brand-cyan: #00D2FF;          /* Electric Cyan (top/start) */
  --brand-blue: #3A7BD5;          /* Vibrant Blue (middle) */
  --brand-violet: #6A00F4;        /* Deep Violet (bottom/end) */
  --brand-gradient: linear-gradient(135deg, var(--brand-cyan) 0%, var(--brand-blue) 50%, var(--brand-violet) 100%);

  /* Neutrals */
  --white: #FFFFFF;
  --offwhite: #F8F9FA;
  --slate-grey: #CBD5E1;

  /* Typography colors */
  --heading: #1E293B; /* Dark Navy/Charcoal */
  --body: #64748B;    /* Cool Grey */

  /* Semantic */
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;

  /* Elevation */
  --elevation-1: rgba(30,41,59,0.04);
  --elevation-2: rgba(30,41,59,0.06);
}
```

**Usage guidance:**

* Always reference variables (e.g., `color: var(--heading)`) instead of raw hex across the codebase.
* Use `--brand-gradient` for primary CTA backgrounds and hero graphics.

---

## 2. Typography

**Base font stack (web-safe + modern):**

* Primary display: `Inter` (preferred) or `Inter var`
* Fallbacks: `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`

```css
:root {
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}
html { font-family: var(--font-sans); }
```

**Type scale (8pt base grid).** Use rem units (1rem = 16px):

| Role            |   px |       rem | weight | line-height |
| --------------- | ---: | --------: | -----: | ----------: |
| Display / H1    | 40px |    2.5rem |    700 |        1.08 |
| H2              | 32px |    2.0rem |    600 |        1.15 |
| H3              | 24px |    1.5rem |    600 |        1.25 |
| H4              | 20px |   1.25rem |    600 |         1.3 |
| H5              | 16px |    1.0rem |    600 |         1.4 |
| Body (base)     | 16px |    1.0rem |    400 |         1.5 |
| Small / Caption | 13px | 0.8125rem |    400 |         1.4 |
| Tiny / Micro    | 11px | 0.6875rem |    400 |         1.3 |

**CSS snippet:**

```css
.h1 { font-size: 2.5rem; font-weight: 700; line-height: 1.08; color: var(--heading); }
.h2 { font-size: 2rem; font-weight: 600; line-height: 1.15; color: var(--heading); }
.p { font-size: 1rem; font-weight: 400; line-height: 1.5; color: var(--body); }
.small { font-size: .8125rem; color: var(--body); }
```

**Weights**

* Regular: 400
* Medium: 500
* Semibold: 600
* Bold: 700

**Text casing & style**

* Headings: Sentence case (capitalize first letter only), maintain consistent sentence casing across UI.
* Buttons: Title Case for primary CTAs, UPPERCASE for small uppercase badges.

---

## 3. Spacing & Layout System

**Base grid:** 8px. Multiples: 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, etc.

**Container widths** (responsive):

* Small (mobile): max-width: 100% (padding: 16px)
* Tablet: 720px
* Desktop: 1120px
* Wide: 1400px

```css
.container { margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem; }
@media(min-width: 768px){ .container { max-width: 720px; } }
@media(min-width: 1024px){ .container { max-width: 1120px; } }
@media(min-width: 1440px){ .container { max-width: 1400px; } }
```

**Spacing tokens (examples):**

* `--spacing-xs: 4px;`
* `--spacing-sm: 8px;`
* `--spacing-md: 16px;`
* `--spacing-lg: 24px;`
* `--spacing-xl: 32px;`

---

## 4. Shapes, Corners & Elevation

**Border radius:**

* `--radius-sm: 6px;` (inputs, small chips)
* `--radius-md: 12px;` (cards, modals)
* `--radius-lg: 20px;` (large hero containers)

**Elevation (shadows)** — subtle and consistent:

* `elevation-0: none`
* `elevation-1: 0 1px 2px var(--elevation-1)`
* `elevation-2: 0 6px 18px var(--elevation-2)`

---

## 5. Iconography & Imagery

* Use a single icon set (e.g., Tabler Icons / Heroicons) with 24px baseline for most UI icons.
* Primary icons: use `--brand-blue` or `--heading` depending on state.
* Avoid mixing multiple styles (outline + filled) in the same view.
* Avatar sizes: 24px (xs), 40px (sm), 56px (md), 88px (lg)

---

## 6. Buttons

**Principles:** Distinguish primary/actionable CTAs from secondary/tertiary actions. Use gradient only for primary emphasis.

**Tokens / CSS:**

```css
.button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 0.6rem 1rem; border-radius: 12px; font-weight: 600; cursor: pointer;
}
.button-primary {
  background: var(--brand-gradient);
  color: var(--white);
  box-shadow: 0 6px 18px rgba(58,123,213,0.12);
}
.button-primary:active { transform: translateY(1px); }
.button-secondary {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid var(--slate-grey);
  color: var(--heading);
}
.button-ghost {
  background: transparent; color: var(--brand-blue); border: none;
}
```

**Sizes:**

* Large: 56px height, font-size: 1rem
* Default: 44px height, font-size: 1rem
* Small: 36px height, font-size: .875rem

**Icon buttons:** square with equal height and width, center icon.

---

## 7. Forms & Inputs

**Input styling:**

* Background: `--white` or `--offwhite` for subtle variant
* Border: 1px solid `--slate-grey` (or `rgba(30,41,59,0.06)` on light)
* Placeholder color: `--slate-grey` with 60% opacity
* Border radius: `--radius-sm`
* Focus state: 2px outline with `--brand-cyan` (use box-shadow for focus ring to maintain layout)

```css
.input { padding: 12px 14px; border-radius: 6px; border: 1px solid var(--slate-grey); font-size: 1rem; }
.input:focus { outline: none; box-shadow: 0 0 0 4px rgba(0,210,255,0.12); border-color: var(--brand-blue); }
```

**Validation states:**

* Error: border `--danger`, error text small and placed beneath input.
* Success: subtle `--success` 1px border and check icon.

---

## 8. Cards & Panels

* Card background: `--white` with `--radius-md` and `elevation-1`.
* Card padding: `--spacing-lg` (24px) inside.
* Use subtle dividing lines `1px solid rgba(30,41,59,0.04)`.

---

## 9. Lists, Tables & Data

* Row height: 56px for tables; compact variant 40px.
* Table headers: use `--heading` with font-weight 600.
* Use zebra background with `--offwhite` for readability only when necessary.

---

## 10. Grid & Breakpoints

**Breakpoints (min-width):**

* `sm`: 640px
* `md`: 768px
* `lg`: 1024px
* `xl`: 1280px

Use CSS Grid for dashboard layouts and Flexbox for small components.

---

## 11. Motion & Interaction

**Principles:** Keep motion subtle — use it to show hierarchy not to distract.

* Duration tokens:

  * `--motion-fast: 120ms`
  * `--motion-medium: 200ms`
  * `--motion-slow: 360ms`
* Easing: `cubic-bezier(0.2, 0.9, 0.15, 1)` for most UI transitions.
* Use transform + opacity for enter/exit to avoid layout thrashing.

**Reduce motion:** honour `prefers-reduced-motion` by disabling non-essential animations.

---

## 12. Accessibility

* Contrast: headings must meet at least WCAG AA (4.5:1) against background. Body text must meet WCAG AA (4.5:1) for normal text where possible. Use `--heading` and `--body` token values provided.
* Interactive targets: minimum touch target 44x44px.
* Keyboard focus: visible focus states for all actionable elements.
* Screen reader: use ARIA roles and aria-live for live-updating conversational responses.

---

## 13. Theming & Variants

**Light (default)** — uses tokens above.
**Dark (future)** — define `--bg: #0F1724`, `--surface: #0B1220`, invert text colors appropriately. Keep gradient accents the same,
but consider desaturated variants for accessibility.

---

## 14. Component Library (short catalogue & examples)

### Primary components to standardize

* `Button` (primary, secondary, ghost)
* `Input` / `Textarea`
* `Card` (primary, small)
* `Modal`
* `Toast` (success/warn/error)
* `Avatar`
* `IconButton`
* `VoiceWidget` (microphone + waveform + state)

**VoiceWidget example (high level)**

* Microphone circle: gradient border using `--brand-gradient`.
* Idle state: 56px circle, `--offwhite` background, `--brand-blue` icon.
* Recording: pulse animation, show waveform with slates.

---

## 15. Example CSS utilities

```css
/* Spacing utilities */
.u-mt-sm { margin-top: 8px; }
.u-px-md { padding-left: 16px; padding-right: 16px; }

/* Text utilities */
.u-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Flex helpers */
.row { display:flex; gap: 12px; align-items: center; }
```

---

## 16. Tokens (full quick reference)

* Colors: `--brand-cyan`, `--brand-blue`, `--brand-violet`, `--white`, `--offwhite`, `--slate-grey`, `--heading`, `--body`
* Spacing: `--spacing-xs` .. `--spacing-xl`
* Radius: `--radius-sm`, `--radius-md`, `--radius-lg`
* Motion: `--motion-fast`, `--motion-medium`, `--motion-slow`
* Shadows: `--elevation-1`, `--elevation-2`

---

## 17. Implementation notes for devs

* Expose tokens as CSS variables and in the design system package (e.g., `@vibe/ui-tokens`).
* Keep tokens atomic and avoid hardcoded hex in components.
* Use storybook and visual regression testing for components.
* Create a Figma file that mirrors the tokens and includes component variants.

---

## 18. Deliverables checklist

* [ ] CSS tokens file (variables)
* [ ] Tailwind/utility config (if used)
* [ ] Storybook with component stories
* [ ] Figma design file with color & typography tokens
* [ ] Accessibility checklist integrated into CI

---

*End of design standards.*
