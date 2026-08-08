# Animation Implementation Plan — SevaNest

> **Status:** Draft · **Scope:** `frontend/` (Vite + React 19 + TS + Tailwind v4) · **Goal:** add soft, orchestrated motion in the brand language of design.md §11.5.

**Table of contents**

1. [Motion principles](#1-motion-principles-the-brief-wins)
2. [Stack decision](#2-stack-decision)
3. [Animation inventory](#3-animation-inventory)
4. [Phased roadmap](#4-phased-roadmap)
5. [Key code patterns](#5-key-code-patterns)
6. [Performance & guardrails](#6-performance--guardrails)
7. [Where it lives](#7-where-it-lives)

---

## 1. Motion principles (the brief wins)

Your **design.md §11.5** already sets the rules: *soft, 150–200ms ease-out for micro-interactions, no bounce/elastic*. The frontend-design skill adds: *an orchestrated moment lands harder than scattered effects*.

- **One signature sequence** — the Overview hero entrance (eyebrow → greeting → subtext → stats count-up → guide card, ~700ms orchestrated).
- **Ambient everywhere else** — staggered reveals, scroll-triggered section entrances, chat bubble pops, progress bars drawing in.
- **Always GPU-friendly** — animate only `transform` and `opacity` (the current hover micro-interactions already follow this).
- **Always respectful** — `prefers-reduced-motion` disables every timeline (there is already a CSS fallback in `index.css`), and dark mode must work because all colors are CSS variables (**animations must never hardcode colors**).

---

## 2. Stack decision

| Option | Bundle (gzip) | Best at | Verdict for SevaNest |
|---|---|---|---|
| **GSAP + `@gsap/react` (useGSAP) + ScrollTrigger** | ~34 KB (23 core + 11 scroll) | Timelines, scroll reveals, count-ups, SVG path drawing, `gsap.matchMedia()` reduced-motion / responsive gating | ✅ **Recommended primary** — one library covers every item below; framework-agnostic, React 19 ready |
| **Motion** (rebranded `framer-motion`, pkg `motion`) | ~35 KB | Declarative `motion.div`, `AnimatePresence` tab transitions, `layoutId` nav-pill slide | Solid alternative if you prefer a declarative React style; `useReducedMotion` built in |
| **CSS + IntersectionObserver** | 0 KB | Simple reveals | Good for the ~30% of cases that don't need a library |
| **Three.js / react-three-fiber** | 150 KB+ | True 3D | ❌ Overkill for this calm aesthetic — see [Phase 3](#phase-3--webgl-optional) |

**Recommendation:** `gsap` + `@gsap/react` + `gsap/ScrollTrigger` as the single source of truth.

- Use `useGSAP` with a scoped `gsap.context()` so React 19 **StrictMode double-mounts** are handled and timelines **auto-cleanup**.
- Use the cleanup returned by `useGSAP` for anything imperative.

---

## 3. Animation inventory

### 3.1 Overview tab

| Element | Animation | Duration / easing |
|---|---|---|
| Hero: eyebrow chip, H1, subtext, stat pills | Staggered fade-up (`y: 16 → 0`, opacity) | 400–600ms, `power2.out`, stagger 80ms |
| Hero stats (6 · 4 · 4.2 days) | Count-up number tween (decimals for 4.2) | 1.2s `power2.out`, triggers after H1 lands |
| GuideCard | Fade + scale-in (0.96 → 1) with soft shadow bloom | 500ms |
| GuideCard spiral + progress line | SVG stroke draw (`stroke-dashoffset`) with the orange dot easing along to ~40% | 900ms, `power3.inOut` |
| Scheme cards grid | Staggered fade-up on scroll into view (`ScrollTrigger.batch` or `.start`) | 60ms stagger, 500ms each |
| Complaint rows | Same stagger reveal; resolved rows dim with a check "pop" | 80ms stagger |
| AddNewCard minus/plus | Already has rotate — keep; add subtle icon flip | — |
| Search bar focus / success pill | Focus ring pulse; success banner slides down (`y: -8 → 0`) | 200ms ease-out |

### 3.2 Other tabs

| Element | Animation |
|---|---|
| Tab switches (all pages) | Page transition: re-mount `<main>` content keyed on `tab` with fade + 12px slide-up (a ~12-line hook, or Motion `AnimatePresence mode="wait"`) |
| Chat bubbles (user + bot) | iMessage-style pop: scale `0.92 → 1` + fade, 180ms, stagger 40ms on multi-message; embedded scheme card slides up after its text |
| Chat mic "listening" | Already pulsing — keep |
| Profile: document / income progress bars | Width `0 → pct` on first view, 700ms `power2.out`; cards stagger |
| Catalog: filter / search changes | FLIP-style transition on the grid (`gsap/Flip` → `Flip.fit` / `Flip.from`) so cards fluidly move when filtering |
| Catalog / Helpline: active chip selection | One-shot 200ms "press" scale on the newly selected pill |
| Helpline: submit success banner | Slide-down + mint fade-in (reuse the ComplaintBar pattern) |
| Sidebar / mobile active nav pill | Optional: `layoutId`-style sliding indicator (needs Motion) — GSAP alternative: tween the pill background in via `clip-path` |

### 3.3 Ambient layer

- The three mint background doodles (`DecorativeBackground.tsx`) get a **very slow drift** — 25–40s looping CSS keyframes (`translate` ±8px, `rotate` ±3°) — pure CSS, zero JS. This is the "breathing" quality of the brand.

---

## 4. Phased roadmap

### Phase 0 — Foundation (~30 min)

- [ ] Add deps: `npm i gsap @gsap/react`
- [ ] Create `src/lib/animations.ts` — register `ScrollTrigger` once
- [ ] Build `useReveal(ref, options)` — IntersectionObserver wrapper for simple fade-ups (or defer to ScrollTrigger entirely)
- [ ] Build `useReducedMotion()` — reads `matchMedia('(prefers-reduced-motion: reduce)')`
- [ ] Establish the GSAP + React pattern (see [§5](#5-key-code-patterns)) and gate every timeline with `gsap.matchMedia`

### Phase 1 — Quick wins (~half day)

> This phase alone transforms the feel.

- [ ] Hero entrance sequence (stagger + stats count-up + guide-line draw)
- [ ] Section scroll reveals (`ScrollTrigger`)
- [ ] Scheme card grid stagger
- [ ] Complaint rows stagger
- [ ] Chat bubble entrance pops
- [ ] Tab fade transitions (`key={tab}` + `.page-enter`)

**Definition of done:** overview + chat feel noticeably alive; `npm run build` passes; reduced-motion QA (see [§6](#6-performance--guardrails)).

### Phase 2 — Polish (~half day)

- [ ] Catalog FLIP filtering (`gsap/Flip`)
- [ ] Nav-pill indicator (sidebar + mobile header)
- [ ] Profile progress bar draws
- [ ] Success banners slide-in (Helpline + ComplaintBar)
- [ ] Ambient doodle drift (CSS keyframes)
- [ ] Theme-switch crossfade — a `.theme-fade` utility adding `transition: background-color .3s, border-color .3s, color .3s` on the app shell so dark-mode flips are smooth

### Phase 3 — WebGL (optional)

> Only if you want the "wow". A Canvas 2D ambient layer is the lightweight first step.

- [ ] Canvas 2D field of drifting thin line-arcs/particles behind the hero (~40 lines, 0 KB deps)
- [ ] Only if real depth/bloom is wanted: lazily `import('three')` inside `useEffect` so it never blocks first paint

---

## 5. Key code patterns

### The canonical GSAP-in-React pattern (used everywhere)

```tsx
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function Hero() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // Kill all animation for reduced-motion users
      mm.add('(prefers-reduced-motion: reduce)', () => {})

      mm.add(
        '(min-width: 640px) and (prefers-reduced-motion: no-preference)',
        () => {
          const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.5 } })
          tl.from('[data-hero="eyebrow"]', { y: 16, opacity: 0 })
            .from('[data-hero="title"]', { y: 16, opacity: 0 }, '-=0.3')
            .from('[data-hero="sub"]', { y: 12, opacity: 0 }, '-=0.35')
            .from('[data-hero="stat"]', { y: 12, opacity: 0, stagger: 0.06 }, '-=0.3')
            .from('[data-hero="guide"]', { scale: 0.96, opacity: 0 }, '-=0.25')

          // Count-up the stat numbers (illustrative pseudo-code)
          gsap.to(counter, {
            value: 4.2,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = counter.value.toFixed(1)
            },
          })
        },
      )
    },
    { scope },
  )

  return <section ref={scope}>…</section>
}
```

`useGSAP` runs in a scoped context, auto-cleans on unmount, and is StrictMode-safe.

### Tab transition (plain React, no library needed)

```tsx
<main key={tab} className="page-enter">
  …
</main>
```

```css
/* index.css */
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.page-enter {
  animation: page-enter 220ms ease-out;
}
```

---

## 6. Performance & guardrails

- **Bundle budget:** +~34 KB gzip for GSAP (app is currently ~77 KB gz → lands ~110 KB, still light). Three.js stays a lazy `import()` if ever used.
- **Animate `transform` / `opacity` only**; `will-change` on at most the hero + doodles; no layout-thrash loops.
- **`gsap.matchMedia()`** handles both reduced-motion **and** breakpoint differences (mobile: skip the hero stagger, keep reveals).
- **Dark mode:** all animations use CSS-variable-driven colors or no colors — nothing to special-case.

### QA checklist

- [ ] Test in light mode **and** dark mode
- [ ] Test narrow (mobile) **and** desktop widths
- [ ] DevTools → "Emulate `prefers-reduced-motion: reduce`" — everything must render statically
- [ ] Lighthouse performance pass after Phase 1

---

## 7. Where it lives

| File | Purpose |
|---|---|
| `frontend/src/lib/animations.ts` | **New** — GSAP plugin registration + shared tween helpers |
| `frontend/src/hooks/useReveal.ts` | **New** — reveal-on-scroll hook |
| `frontend/src/hooks/useReducedMotion.ts` | **New** (or fold into `useReveal.ts`) — reduced-motion detection |
| `frontend/index.css` | Keyframes (`page-enter`, doodle drift, `.theme-fade`) |
| `frontend/src/App.tsx` | Tab transition (`key={tab}`) + theme crossfade shell |
| `frontend/src/components/Hero.tsx` | Hero entrance sequence + stat count-up |
| `frontend/src/components/GuideCard.tsx` | Progress-line stroke draw + orange dot |
| `frontend/src/components/SchemesSection.tsx` | Grid stagger + search-focus pulse |
| `frontend/src/components/ResolvedSection.tsx` | Row stagger + resolved check "pop" |
| `frontend/src/components/ComplaintBar.tsx` | Success pill slide-in |
| `frontend/src/components/DecorativeBackground.tsx` | Ambient doodle drift |
| `frontend/src/pages/ChatPage.tsx` | Bubble entrance pops |
| `frontend/src/pages/ProfilePage.tsx` | Progress bar draws + card stagger |
| `frontend/src/pages/CatalogPage.tsx` | FLIP filtering + chip press |
| `frontend/src/pages/HelplinePage.tsx` | Chip press + success banner |

---

*Generated from the SevaNest animation plan. Libraries to evaluate before install: `gsap`, `@gsap/react`, optionally `motion`.*
