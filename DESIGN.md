---
name: leonimust.com
description: A dark, monospace terminal that boots up before it lets you in — music, drifting code symbols, and a ring cursor standing in for a portfolio.
colors:
  bg-void: "#1a1a1a"
  text-dim: "#444444"
  text-bright: "#ffffff"
  border-subtle: "rgba(255, 255, 255, 0.08)"
  card-surface: "rgba(255, 255, 255, 0.02)"
  card-surface-hover: "rgba(255, 255, 255, 0.05)"
  glow-white: "rgba(255, 255, 255, 0.15)"
  status-up: "#4caf50"
  status-down: "#ff5555"
  wip-amber: "#b8963e"
  dapp-teal: "#31a79a"
typography:
  display:
    fontFamily: "'Courier New', Courier, monospace"
    fontSize: "2em"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "'Courier New', Courier, monospace"
    fontSize: "1.1em"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "'Courier New', Courier, monospace"
    fontSize: "1em"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "'Courier New', Courier, monospace"
    fontSize: "0.8em"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  full: "50%"
spacing:
  xs: "6px"
  sm: "12px"
  md: "20px"
  lg: "28px"
  xl: "32px"
components:
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.sm}"
    padding: "9px 18px"
  nav-item-hover:
    backgroundColor: "{colors.card-surface-hover}"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.sm}"
  project-card:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.md}"
    padding: "22px 18px"
  project-card-hover:
    backgroundColor: "{colors.card-surface}"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.md}"
  modal-close:
    backgroundColor: "transparent"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.sm}"
    padding: "7px 20px"
  modal-close-hover:
    backgroundColor: "transparent"
    textColor: "{colors.text-bright}"
    rounded: "{rounded.sm}"
---

# Design System: leonimust.com

## Overview

**Creative North Star: "The Signal in the Dark"**

Almost the entire interface sits just above invisible: a near-black void, dim gray type, borders you can barely see. Nothing decorative is allowed to compete for attention — so when something does light up (white on hover, a green "up" pulse, a red "down" flicker, the amber WIP tag), it reads as a signal, not styling. The site opens on a loading gate and autoplay music before any content exists, so the first thing a visitor does is *tune in* rather than *land on a page*. Everything after that — the randomized entrance animation, the drifting background code symbols, the ring cursor that only fills in on hover — keeps that same posture: quiet by default, alive on contact.

This is explicitly not a corporate SaaS portfolio. No gradients, no card shadows at rest, no rounded pill buttons, no trust-badge polish. It is a terminal that happens to render a portfolio, built by one person with a dry, self-aware sense of humor ("i could pwned you but would i?", "catjpg still watching").

**Key Characteristics:**
- Monochrome-first: color exists only as functional signal, never as decoration
- Flat at rest, alive on interaction: shadow, lift, and brightness are all earned by hover
- Hierarchy through color/opacity (dim → bright), not through font-size — most type sits at browser-default sizes
- Entry is a ritual (loading → music gate → randomized entrance), not a landing

## Colors

Almost entirely grayscale; every non-gray hue in the system is load-bearing (state, not mood).

### Primary
- **Void Black** (`#1a1a1a`): the site's only background. Used everywhere — `html`, `body`, nothing else competes.
- **Signal White** (`#ffffff`): the "activated" state. Text, links, and the header brighten to this on hover/focus; it never appears at rest.

### Neutral
- **Dim Gray** (`#444444`): the resting color for nearly all text — headers, body copy, nav links, project labels. This is the site's default voice; white is the exception, not the norm.
- **Border Whisper** (`rgba(255,255,255,0.08)`): the only border color in the system — nav-item outlines, card borders, legal-section borders.
- **Card Surface** (`rgba(255,255,255,0.02)`): near-invisible background wash for cards and panels; barely distinguishes a card from the void until it's touched.
- **Card Surface Hover** (`rgba(255,255,255,0.05)`): the touched state of Card Surface — still subtle, never a solid fill.
- **Glow White** (`rgba(255,255,255,0.15)`): legacy/general-purpose accent glow, used sparingly for hover outlines and gradients.

### Named Rules
**The Grayscale-First Rule.** Color is reserved for state, never decoration. The only hues that exist outside black/white/gray are functional: Status Up green, Status Down red, WIP Amber, and the single dApp-Store Teal. If a new element wants color and isn't communicating state, it doesn't get one.

**Semantic / Status colors**
- **Status Up** (`#4caf50`, glow `rgba(76,175,80,0.4)`): a monitored game server is reachable (`/games`). Paired with a soft text-shadow glow, never animated.
- **Status Down** (`#ff5555`): a monitored server is unreachable. Pulses (`pulse-red`, 2s ease-in-out) — the only color in the system that animates on its own, because "something is actually wrong" earns the extra attention.
- **WIP Amber** (`#b8963e`): marks an unfinished project or app (dashed card border, `[ wip ]` corner tag, blinking cursor glyph). Signals "real, but not ready" — never used for anything else.
- **dApp-Store Teal** (`#31a79a`): appears exactly once, naming "Solana Mobile" inside the dApp Store explainer modal. A single-use brand citation, not a system accent — do not reuse it elsewhere.

## Typography

**Display Font:** 'Courier New', Courier, monospace
**Body Font:** 'Courier New', Courier, monospace
**Label/Mono Font:** same — the system has exactly one typeface.

**Character:** One monospace face, everywhere, no exceptions. There is no serif/sans pairing to speak of — the terminal identity comes from *never breaking character*, not from a font pairing decision.

### Hierarchy
- **Display** (700, `2em`, 1.2): the page title (`leonimust.com`, `projects`, `games`, `apps`) — browser-default `<h1>` sizing, intentionally unstyled beyond color.
- **Title** (700, `1.1em`, 1.3): section headers inside legal pages (`h2.textiboi`) — the one place the system nudges size up from body text.
- **Body** (400, `1em`, 1.75): paragraph copy, project descriptions, legal content, nav links — the workhorse size for nearly everything on screen.
- **Label** (400, `0.8em`, 1.4, `0.04em` tracking): small state text — `/games` up/down status, the `[ wip ]` corner tag, the volume percentage readout.

### Named Rules
**The No-Scale-Hierarchy Rule.** Reach for color/opacity before font-size. Dim gray → bright white communicates "primary vs. secondary" more than the type scale does; the scale itself barely moves (three real steps: label, body, display).

## Layout

Two structural modes. The **landing mode** (`/`, home) centers a single fixed block at the viewport's exact center (`position: fixed; top/left 50%`) with no scroll — the page *is* the viewport, nothing more exists until the user interacts. The **content mode** (`/projects`, `/games`, `/mobile`, `/legal/*`) switches to a normal top-down flow with generous top padding (`60px 20px 40px`) and natural scroll, because these pages hold a variable number of cards.

Cards lay out in a wrapping flex row (`.container-flex`, `gap: 20px`), collapsing to a single centered column under 768px (`gap: 14px`). Legal content constrains to a readable `max-width: 760px` column. Nav items form their own wrapping flex row with tighter `6px` gaps and staggered fade-in delays (100ms increments) so navigation feels assembled rather than dumped on screen.

At the 768px breakpoint: the custom ring cursor is dropped in favor of the native cursor (touch has no hover to animate), and card widths go fluid (`calc(100% - 16px)`, capped at 340px).

## Elevation & Depth

Flat by default, hybrid on demand. Nothing carries a resting shadow — cards, nav items, and headers all sit perfectly flat against the void. Depth appears in exactly two situations: as a **response to hover** (a project card lifts `-8px` and gains `box-shadow: 0 16px 40px rgba(0,0,0,0.5)` only while hovered), or as a property of things that are **literally floating above the page** (the volume control panel, the WIP/dApp-Store modals — both carry a permanent soft shadow because they're overlays by nature, not resting content).

### Shadow Vocabulary
- **Hover Lift** (`box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5)`): project cards on hover only, paired with `translateY(-8px)`.
- **Floating Panel** (`box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4)`): the volume control popover — present whenever it's visible, since it's an overlay.

### Named Rules
**The Flat-Until-Touched Rule.** Static content never carries a shadow. If something has depth at rest, it had better be an overlay (modal, floating panel) — not a card, section, or button sitting in the normal flow.

## Shapes

Small, soft radii throughout — enough to soften edges without ever reading as "rounded/friendly" web-app chrome. `4px` on interactive chips (nav items), `8px` on containers (project cards, legal sections, the volume panel), `10px` on modals. The one true circle in the system is the music indicator button — everything else stays rectangular-with-soft-corners. Borders, where they exist, are hairline and barely-there (`rgba(255,255,255,0.08)`) except the WIP dashed border, which is deliberately visible so "in progress" reads as a distinct object class from a finished project.

## Components

### Buttons
Not a native button-driven UI — the closest analog is `.nav-item` (a link styled as a chip) and modal close buttons.
- **Shape:** `4px` radius, transparent background, hairline `1px` border only on hover.
- **Nav item:** dim gray text at rest; on hover, brightens to white, gains a soft `card-surface-hover` fill, a visible border, and an animated underline that grows from 0 to 100% width (`0.3s ease`).
- **Modal close:** transparent fill, `1px` border in `#333`, dim gray label, brightens border + text to white on hover. Same understated-until-touched logic as everything else.

### Cards / Containers
- **Corner Style:** `8px` radius.
- **Background:** `card-surface` (`rgba(255,255,255,0.02)`) at rest.
- **Shadow Strategy:** none at rest; `Hover Lift` shadow + `-8px` translate on hover (see Elevation).
- **Border:** hairline `border-subtle`, brightening to `rgba(255,255,255,0.18)` on hover. WIP variant swaps to a dashed amber border instead.
- **Internal Padding:** `22px 18px` (project cards), `28px 32px` (legal sections — a wider read surface for prose).
- **Signature behavior:** a diagonal gradient sheen (`linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)`) fades in on hover, and the card's image desaturates 15% at rest, going full color + slight zoom on hover — the "coming alive on contact" rule applied to imagery.

### Status Indicators (signature component)
Small label text below a project card stating live up/down state, pulled from a real network check, never static copy. **Up** renders in Status Up green with a soft glow; **Down** renders in Status Down red and pulses continuously — the system's only self-animating color, reserved for genuinely-wrong states.

### WIP Badge (signature component)
A dashed amber card border plus a `[ wip ]` corner tag (uppercase-free, lowercase, `0.68em`) and, inline in copy, a blinking `_` cursor glyph (`step-end`, 1.1s) — a literal terminal cursor standing in for "still typing this one."

### Navigation
Chips in a wrapping flex row, staggered fade-in on entrance (100ms increments per item). Dim gray label at rest, brightens fully on hover with underline growth and background fill — see Buttons above. Mobile: same treatment, tighter gap.

### Custom Cursor (signature component)
Replaces the system cursor above 768px: a `22px` ring (`1px` border, `rgba(255,255,255,0.35)`) that soft-follows the pointer (easing 0.12). Expands to `38px` with a faint white fill over anything interactive (`a, button, .textiboi, .project, .nav-item, #overlay`), and shrinks to `16px` with a stronger fill on click. Disabled entirely on touch/mobile.

## Do's and Don'ts

### Do:
- **Do** keep new UI grayscale by default; earn any color by tying it to a real state (up/down, WIP, a named external brand).
- **Do** let hover be where the site "wakes up" — brightness, lift, and shadow are interaction rewards, not resting decoration.
- **Do** keep the one monospace face for everything; don't introduce a second font for "emphasis."
- **Do** keep status indicators (`/games`) and store badges (`/mobile`) wired to real state — they are proof-of-life, not copy.
- **Do** stagger multi-item entrances (nav, cards) rather than having them appear all at once.

### Don't:
- **Don't** add gradients, drop shadows at rest, rounded pill buttons, or any "trust us" SaaS polish — that's the explicit anti-reference.
- **Don't** give any element a resting shadow unless it's a genuine overlay (modal, floating panel).
- **Don't** reach for font-size to build hierarchy before reaching for color/opacity.
- **Don't** reuse dApp-Store Teal outside the Solana Mobile citation, or WIP Amber outside marking unfinished work — both are single-purpose signal colors, not a starter palette.
- **Don't** fabricate uptime, availability, or store-badge state — if it isn't live-checked or real, it doesn't ship as if it were.
