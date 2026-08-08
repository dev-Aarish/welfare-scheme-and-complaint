# Design System — "SevaNest"-style Wellness Dashboard

> Reverse-engineered from two UI screenshots (dashboard / "MyNest" home view).
> This document is a complete visual spec intended to be handed to a design/frontend agent for pixel-faithful implementation in a new project.

---

## 1. Brand Personality

- **Vibe:** calm, warm, organic, trustworthy wellness/health-tech. Soft pastel "editorial" feel rather than clinical/sterile.
- **Keywords:** gentle, human, tactile, breathable whitespace, rounded everything, hand-drawn accent lines, muted earthy palette (no saturated primary colors).
- **Illustration style:** thin single-weight line-art doodles (concentric spiral, loose squiggle threads) layered into flat-color card backgrounds — never photographic, never heavy.

---

## 2. Color Palette

### Core neutrals
| Token | Hex | Usage |
|---|---|---|
| `bg-canvas` | `#EAE7E0` | outer page background |
| `bg-canvas-alt` | `#DEDBD3` | gradient shade of outer background |
| `surface-white` | `#FFFFFF` | sidebar, card containers, input fields |
| `ink-900` | `#201C2A` | primary headings / body text |
| `ink-700` | `#3A3644` | secondary dark text |
| `ink-400` | `#8A8790` | muted/placeholder text, inactive nav labels |
| `border-subtle` | `#E7E4DD` | hairline borders (e.g. "Add New" card) |

### Brand / accent
| Token | Hex | Usage |
|---|---|---|
| `brand-navy` | `#211D2C` | active nav pill, primary CTA button ("Save as a new task") |
| `brand-orange` | `#E38F55` | logo mark, avatar ring dot, progress-tracker dot, illustration accents |
| `brand-mint` | `#6FBBA6` | decorative squiggle line-art, small status dot |

### "Due now" card palette (flat pastel fields, one per card)
| Token | Hex | Card |
|---|---|---|
| `card-lavender` | `#A6B1D6` | Determine Benchmark |
| `card-olive` | `#A79C74` | Choose your Subscription |
| `card-terracotta` | `#DD8F5C` | Add Allergies |
| `card-sage` | `#8CA89B` | Choose Pharmacy |
| `card-mauve` | `#AFA6AC` | Add Current Medication |
| `card-khaki` | `#C3BC82` | Upload Driving Licence |
| `card-outline` | `#FFFFFF` + `border-subtle` | Add New (white, bordered, toggle control) |

Inside each colored card, a **lighter tint** or near-white illustration (spiral, blob, wave) sits bottom-right at low contrast — roughly the base color mixed with +40–60% white, used purely as decorative line/flat art, never as text-bearing.

### Section backgrounds
| Token | Hex | Usage |
|---|---|---|
| `hero-sage-start` | `#D2D8CB` | top-left of greeting/hero band gradient |
| `hero-sage-end` | `#FFFFFF` | fades to white toward bottom/right of hero band |

**Gradient direction:** hero band is a soft diagonal (top-left sage → bottom-right white), roughly 135°.

---

## 3. Typography

Two-font system: a **rounded geometric display face** for the logo + large greetings, and a **clean neutral sans** for everything else (nav, body, labels, buttons).

| Role | Font stack | Weight | Size (desktop) | Notes |
|---|---|---|---|---|
| Logo wordmark ("Mindnest") | `'Quicksand', 'Poppins', sans-serif` | 700 | 22–24px | rounded terminals, tight tracking |
| H1 greeting ("Hi, Julie! 👋") | `'Quicksand', 'Poppins', sans-serif` | 600–700 | 34–40px | ink-900, includes emoji inline |
| H2 section headers ("Due now", "Completed") | `'Inter', sans-serif` | 600 | 20–22px | ink-900 |
| Card labels ("Determine Benchmark" etc.) | `'Inter', sans-serif` | 500–600 | 15–16px | white/near-white text on colored cards |
| Nav items | `'Inter', sans-serif` | 500 | 15px | ink-400 default, white on active pill |
| Body / subtext ("Let's help you stay on top of your health") | `'Inter', sans-serif` | 400 | 15–16px | ink-700 |
| Small meta ("Female, 21 years old") | `'Inter', sans-serif` | 400 | 13px | ink-400 |
| Button label ("SAVE AS A NEW TASK") | `'Inter', sans-serif` | 600 | 13px, uppercase, letter-spacing 0.04em | white on brand-navy |

Recommended free Google Font swap if unavailable: **Quicksand** (display) + **Inter** (body) — this is the closest accessible match to the rounded/neutral pairing seen in the screenshots.

---

## 4. Spacing & Sizing Scale

Use an 4px base unit:

```
2xs: 4px   xs: 8px   sm: 12px   md: 16px   lg: 24px   xl: 32px   2xl: 48px   3xl: 64px
```

- Card internal padding: `24px` (lg)
- Grid gap between "Due now" cards: `16–20px`
- Sidebar width: `~260px`
- Sidebar item vertical padding: `12px`, horizontal `16px`
- Main content max-width container padding: `40–48px`

---

## 5. Radius & Elevation

| Element | Radius |
|---|---|
| Large content cards (Due now, wellness guide) | `20–24px` |
| Sidebar active-nav pill | `14px` |
| Small buttons / toggle chip ("+/-") | `10px` |
| Input bar / task bar | `16px` (often paired into one pill with the dark CTA button flush on the right) |
| Avatar | full circle |
| Outer app shell / browser frame | `28–32px` (only relevant if mimicking the mockup frame) |

**Shadows:** very soft, low-opacity, large blur — e.g. `0 12px 32px rgba(32,28,42,0.06)`. No hard drop shadows anywhere. Cards read as flat color blocks more than elevated surfaces.

---

## 6. Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│  [decorative bg line-art, full page, low opacity]           │
│  ┌───────────┐ ┌──────────────────────────────────────────┐│
│  │  Sidebar   │ │  Header: logo (left) — avatar+name (rt)  ││
│  │  (white)   │ ├──────────────────────────────────────────┤│
│  │ - MyNest●  │ │  Hero band (sage→white gradient)         ││
│  │ - Chat     │ │   H1 "Hi, Julie! 👋"  +  wellness card ↗ ││
│  │ - My prof. │ ├──────────────────────────────────────────┤│
│  │ - Docs     │ │  "Due now" (H2)                          ││
│  │ - Contact  │ │   [3-col grid of colored task cards]     ││
│  │            │ │   [Add New Task input] [Save CTA]        ││
│  │ [promo     │ ├──────────────────────────────────────────┤│
│  │  card]     │ │  "Completed" (H2) — list/cards below     ││
│  └───────────┘ └──────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

- **Sidebar:** fixed left, white background, logo + user chip at top, vertical nav list, promo/upsell card pinned near bottom with soft illustration.
- **Hero band:** full-width, rounded-bottom or bleeds into white; contains H1 + subtext left, a floating white "Your wellness guide" info card right (with a thin line "progress path" ending in an orange dot).
- **Due now grid:** responsive grid, roughly 3 columns × 2–3 rows on desktop, 1 column on mobile. Each card: colored fill, label bottom-left, chevron (`›`) top-right, faint decorative illustration bottom-right corner, entire card clickable.
- **Add New Task bar:** a white pill input spanning most of the width, with a dark navy "SAVE AS A NEW TASK" button fused to its right edge (no gap, shared rounded container).
- **Completed section:** header only visible in the crop; treat as a second grid/list section following the same card system, likely with muted/desaturated or checked-off styling.

---

## 7. Components

### Sidebar nav item
- Default: transparent bg, gray icon + gray-black text, icon left (20px), 12px gap to label.
- Active state: `brand-navy` background, fully rounded (`14px`), white icon + white text, occupies full sidebar width minus side padding.

### Colored task card
- Fixed-ish aspect (wider than tall), flat background color from palette above.
- Top-right: circular/plain chevron icon (`›`) in white at ~70% opacity.
- Bottom-left: label text, white, 1–2 lines, medium weight.
- Bottom-right: decorative line-art illustration bleeding off the card edge, tinted lighter version of the card color.
- Hover (implement): slight lift (`translateY(-2px)`) + shadow increase.

### "Add New" utility card
- White background, thin `border-subtle` outline, no illustration.
- Label top-left ("Add New"), circular toggle button top-right containing a `–` (minus) glyph, implying expand/collapse or add/remove state.

### Wellness guide card
- White/off-white rounded card floating over the hero gradient (looks inset, slight shadow).
- Contains: title "Your wellness guide", subtitle meta ("Female, 21 years old"), and a thin horizontal line with a spiral flourish on the left and a filled orange dot marking progress position on the line — reads as a stylized progress/timeline indicator.

### Primary CTA button ("SAVE AS A NEW TASK")
- `brand-navy` fill, white uppercase text, letter-spacing, no border-radius on the shared edge with the input (radius only on the outer/right corners), medium horizontal padding (`24–32px`).

### Promo/upsell card (sidebar bottom)
- White card, rounded, contains short two-line headline ("Let's upgrade your plan"), chevron top-right, and a small flat-illustration character (seated, meditating pose) bottom, using `brand-orange` + neutral tones.

### Avatar / user chip (top right of sidebar header)
- Circular avatar image, small `brand-mint` online-status dot bottom-right of avatar, name label + caret dropdown to the right.

---

## 8. Decorative System

- Thin (1–1.5px) single-color line-art doodles scattered on the **outer page background only** (never inside white content areas): concentric spiral in top-left corner, a loose ribbon/squiggle top-right, and a small squiggle bottom-left — all in `brand-mint` or neutral gray at low opacity (~15–25%).
- These are ambient/atmospheric, not functional — implement as fixed-position SVGs behind the app shell, `pointer-events: none`.
- Same thin-line language repeats *inside* UI elements at small scale (wellness card progress line, card corner illustrations) to keep the doodle motif consistent between background and components.

---

## 9. Iconography

- Style: outline/stroke icons, ~1.5px stroke weight, no fill, rounded joins.
- Set needed: home, chat bubble, person/profile, document/file, phone, chevron-right, plus/minus, dropdown caret.
- Suggested icon library: **Lucide** (`lucide-react`) — stroke style and proportions are the closest open-source match.

---

## 10. Suggested Tailwind Config Tokens

```js
// tailwind.config.js (excerpt)
theme: {
  extend: {
    colors: {
      canvas: { DEFAULT: '#EAE7E0', alt: '#DEDBD3' },
      surface: '#FFFFFF',
      ink: { 900: '#201C2A', 700: '#3A3644', 400: '#8A8790' },
      brand: { navy: '#211D2C', orange: '#E38F55', mint: '#6FBBA6' },
      card: {
        lavender: '#A6B1D6',
        olive: '#A79C74',
        terracotta: '#DD8F5C',
        sage: '#8CA89B',
        mauve: '#AFA6AC',
        khaki: '#C3BC82',
      },
    },
    fontFamily: {
      display: ['Quicksand', 'Poppins', 'sans-serif'],
      sans: ['Inter', 'sans-serif'],
    },
    borderRadius: {
      xl: '20px',
      '2xl': '24px',
      pill: '9999px',
    },
    boxShadow: {
      soft: '0 12px 32px rgba(32,28,42,0.06)',
    },
  },
}
```

---

## 11. Implementation Notes for the Design Agent

1. Build the sidebar and hero band first — they establish the color/radius language everything else inherits.
2. Task cards should be a single reusable component parameterized by `{ label, colorToken, illustrationSvg }` — 6–8 variants is enough to look "designed," don't hand-author each one from scratch.
3. Keep all illustration/decorative SVGs monochrome-tinted (single hue, varying opacity) — never introduce new saturated colors beyond the palette in Section 2.
4. Maintain generous negative space; this system reads as "airy," not dense — avoid tightening padding below the `lg` (24px) card padding.
5. Motion (not visible in static screenshots but consistent with the style): keep transitions soft — 150–200ms ease-out, subtle scale/shadow on hover, no bounce/elastic easing.

## 12. Dark Mode Palette

Same design language, inverted for low-light — kept warm/muted rather than pure black, and cards are deepened rather than glowing.

### Core neutrals
| Token | Light | Dark |
|---|---|---|
| `bg-canvas` | `#EAE7E0` | `#16151B` |
| `bg-canvas-alt` | `#DEDBD3` | `#1D1C24` |
| `surface-white` | `#FFFFFF` | `#211F29` |
| `ink-900` | `#201C2A` | `#F2F0EC` |
| `ink-700` | `#3A3644` | `#C9C6D1` |
| `ink-400` | `#8A8790` | `#8B8893` |
| `border-subtle` | `#E7E4DD` | `#33313D` |

### Brand / accent
| Token | Light | Dark |
|---|---|---|
| `brand-navy` | `#211D2C` | `#F2F0EC` bg / `#16151B` text *(inverts — was the darkest tone, now needs to be the lightest to stay dominant)* |
| `brand-orange` | `#E38F55` | `#F0A468` |
| `brand-mint` | `#6FBBA6` | `#7FD1BB` |

### Hero band gradient
| Token | Light | Dark |
|---|---|---|
| `hero-sage-start` | `#D2D8CB` | `#232A25` |
| `hero-sage-end` | `#FFFFFF` | `#1D1C24` |

### "Due now" card palette
| Token | Light | Dark |
|---|---|---|
| `card-lavender` | `#A6B1D6` | `#5C6690` |
| `card-olive` | `#A79C74` | `#6E6448` |
| `card-terracotta` | `#DD8F5C` | `#B36A3C` |
| `card-sage` | `#8CA89B` | `#556E63` |
| `card-mauve` | `#AFA6AC` | `#5F5761` |
| `card-khaki` | `#C3BC82` | `#7A744F` |
| `card-outline` | white + `border-subtle` | `#211F29` + `border-subtle` (dark) |

### Shadows & decoration
| Token | Light | Dark |
|---|---|---|
| `shadow-soft` | `0 12px 32px rgba(32,28,42,0.06)` | `0 12px 32px rgba(0,0,0,0.35)` |
| decorative line-art opacity | 15–25% | 10–15% |

### Tailwind extension
```js
darkMode: 'class',
theme: {
  extend: {
    colors: {
      canvas: { DEFAULT: '#16151B', alt: '#1D1C24' }, // dark
      surface: '#211F29',
      ink: { 900: '#F2F0EC', 700: '#C9C6D1', 400: '#8B8893' },
      brand: { navy: '#F2F0EC', orange: '#F0A468', mint: '#7FD1BB' },
      card: {
        lavender: '#5C6690',
        olive: '#6E6448',
        terracotta: '#B36A3C',
        sage: '#556E63',
        mauve: '#5F5761',
        khaki: '#7A744F',
      },
    },
  },
}
```