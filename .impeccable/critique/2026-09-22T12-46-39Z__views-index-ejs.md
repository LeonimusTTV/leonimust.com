---
target: "leonimust.com (whole site: /, /projects, /games, /mobile, /legal)"
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
timestamp: 2026-09-22T12-46-39Z
slug: views-index-ejs
---
Method: dual-agent (A: ac1f5249c43a65b5e · B: a5acd346bbdfb4bf5)

> Note on evidence: no browser-automation tool was available to either sub-agent in this environment. Both substituted source-code reading + `curl` status checks for live-page inspection, and explicitly avoided fabricating screenshots, console output, or visual/keyboard findings. This is a documented fallback per the critique flow's "mutation unavailable → skip browser presentation, report fallback signal" rule, not a dual-agent degradation — Assessment A and B still ran as two fully isolated sub-agents.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Music-gate redirect on `/projects`, `/games`, `/mobile` fires silently with zero explanation |
| 2 | Match System / Real World | 3 | Terminal metaphor reads clearly for the target dev/friend audience |
| 3 | User Control and Freedom | 2 | No skip-intro or pre-mute affordance before autoplay music; volume control only appears after music is already playing |
| 4 | Consistency and Standards | 2 | Tagline text and "github"/"GitHub" capitalization diverge between initial SSR render and client re-render |
| 5 | Error Prevention | 3 | Solid overall; one dead code path (contact POST route has no form pointing at it) but no user-facing error risk |
| 6 | Recognition Rather Than Recall | 3 | Nav stays at a consistent 4 items, consistent placement |
| 7 | Flexibility and Efficiency | n/a | Single-session novelty site for a known audience; no power-user path expected per PRODUCT.md |
| 8 | Aesthetic and Minimalist Design | 4 | Textbook "flat until touched" execution, no clutter |
| 9 | Error Recovery | 2 | The silent gate-redirect is effectively an unhandled error state with no explanation |
| 10 | Help and Documentation | n/a | Portfolio for people who already know the person; no help affordance expected |
| **Total** | | **21/32** | **Acceptable (66%)** |

## Design Specificity Verdict

**LLM assessment**: Mostly authored, not templated. The void-black / monospace / ring-cursor / ritual-entry system is distinctive and clearly built for one specific person — the drifting code glyphs, the `"catjpg still watching"` comment in `public/javascripts/index.js:39`, the dry lowercase voice. But it isn't uniformly authored: the typewriter string pool (`public/javascripts/index.js:20-40`) swings between real voice (*"i could pwned you but would i?"*) and generic freelancer-portfolio boilerplate (*"crafting digital experiences with a spark"*, *"minimalism is the ultimate sophistication"*, *"where creativity meets code"*, *"unlock your project's full potential"*). That cluster directly contradicts PRODUCT.md's own principle that the voice stays "casual and inside-baseball," and it's the clearest templated tell in an otherwise bespoke build.

**Deterministic scan**: `detect.mjs --json` on `views/`, `public/stylesheets/`, `public/javascripts/` exited **2** (findings present) — 25 total: 12 `bounce-easing` (warning), 3 `design-system-font` (warning), 2 `layout-transition` (warning), 5 `design-system-color` (advisory), 3 `design-system-radius` (advisory).

- **Not a false positive**: all 12 `bounce-easing` hits are in `public/stylesheets/animate.css`, but they're wired directly into the live randomized-entrance pool in `views/index.ejs` (`["bounce","bounce"]`, `["wobble","wobble"]`, `["bounceIn","bounceIn"]`, etc.) — this is the site's actual entrance system, in active use, not dead vendor CSS.
- **False positive**: the 3 `design-system-font` + 1 `design-system-radius` hits are all `public/stylesheets/font.css:5`, which is bundled, vendor-minified Font Awesome (icon glyphs, not body text). DESIGN.md's typography section only documents the readable typeface and doesn't mention icon fonts — a category mismatch the detector can't distinguish, not real drift.
- **Real drift**: `layout-transition` at `style.css:259` and `:671` transitions `width`/`height` directly — genuine layout-thrash, not a design-system violation but a performance smell. `design-system-radius` at `style.css:483` (`1px`) and `:540` (`2px`) sit outside DESIGN.md's documented `4/8/10px` scale. `design-system-color` (`rgba(0,0,0,0.4/0.5)`, `#aaa`, `#666`) are grayscale/black-alpha values on-brand in hue but off the documented token list — legitimate token drift, low-stakes given the whole system is grayscale-first.

**Visual overlays**: unavailable — no browser-automation tool was exposed in this environment, so no injected overlay or `[Human]` tab exists to point you to. Both sub-agents confirmed this explicitly and reported fallback signal (source read + `curl`) instead of fabricating visual evidence.

## Overall Impression

This is a genuinely well-crafted, on-brand execution of its own stated design system — the "Signal in the Dark" idea (flat until touched, color as pure state-signal, one monospace face) is actually followed in the code, which is rarer than it sounds. The biggest opportunity isn't visual polish, it's that the site's own core mechanic — the music-gate that defines "entered the site" — has a silent failure mode: any deep link to `/projects`, `/games`, or `/mobile` bounces back to `/` with zero explanation whenever autoplay is blocked (the common case on a fresh tab). That undermines the one thing this portfolio is supposed to do reliably: let a friend follow a link and see the work.

## What's Working

1. **The WIP badge system** (dashed amber border, `[ wip ]` corner tag, blinking `_` cursor glyph) — a real, specific metaphor ("still typing this one") instead of a generic "coming soon" ribbon; it encodes the terminal identity directly into a state indicator.
2. **`/games` status indicators** — genuinely live-pinged via axios with a 5s timeout, pulsing red only on real failure. This is "proof of life" done exactly as PRODUCT.md demands ("never fake liveness"), and it's the one place color is unambiguously earned.
3. **Dev-background glyphs + ring cursor** — cheap, tasteful ambient motion that reinforces the terminal identity without competing with content, and it's correctly disabled under the 768px breakpoint where hover has no meaning.

## Priority Issues

**[P0] Deep links to `/projects`, `/games`, `/mobile` silently dead-end at `/`**
- **Why it matters**: `views/layout.ejs:116-121` redirects any of those three routes back to `/` whenever `music.paused` is true — and browsers commonly block audio autoplay without a prior user gesture, so this is the *default* state for a fresh tab, not an edge case. A friend following a shared link straight to `/games` lands on the homepage with no message explaining why. This is the single most consequential UX gap on a site whose entire purpose is "someone I know clicks a link and sees my work."
- **Fix**: Preserve the intended destination through the gate (e.g. `?next=/games`, continue there once the user interacts) or drop the hard redirect in favor of rendering the target page behind its own lightweight "tap to enter" prompt, so the destination is never lost.
- **Suggested command**: `/impeccable harden`

**[P1] Resting body-text contrast (~1.8:1) fails WCAG AA, with no rescue on mobile**
- **Why it matters**: `--text-dim: #444` on `--bg: #1a1a1a` is, per DESIGN.md itself, "the resting color for nearly all text." On desktop this is offset by hover-to-white, but the custom-cursor/hover system is explicitly disabled under 768px ("hover has no meaning on touch") — so mobile visitors, who can't hover, read body copy permanently at ~1.8:1 against a 4.5:1 requirement. The brand rule and mobile accessibility directly conflict.
- **Fix**: Raise the resting text color specifically inside the sub-768px media query (e.g. `#444` → `#777`+) without touching the desktop hover-driven aesthetic.
- **Suggested command**: `/impeccable audit`

**[P1] Typewriter copy swings into generic template voice**
- **Why it matters**: Lines like *"crafting digital experiences with a spark"* and *"unlock your project's full potential"* sit in the same rotation as *"i could pwned you but would i?"* — the tonal whiplash is the clearest templated tell in an otherwise bespoke build, and it directly contradicts the "casual and inside-baseball, not sales-oriented" voice principle.
- **Fix**: Cut or rewrite the ~6 sales-y lines in `public/javascripts/index.js:20-40` to match the dry register of the rest of the pool.
- **Suggested command**: `/impeccable clarify`

**[P2] Legal pages are orphaned from the IA**
- **Why it matters**: 12 substantial `/legal/*` routes exist (per-app copyright/licensing/privacy) but nothing in nav, footer, or the `/mobile` app cards links to any of them. They're reachable only to someone who already has the exact URL — fine if that's intentional (store-listing-only links), but worth confirming rather than leaving as a silent IA dead zone.
- **Fix**: Either link them from the relevant `/mobile` app card (they're app-specific already) or confirm store-only is intentional and note it in DESIGN.md so it isn't re-flagged.
- **Suggested command**: `/impeccable layout`

**[P2] Width/height transitions cause layout thrash**
- **Why it matters**: `style.css:259` and `:671` animate `width`/`height` directly (sound-bar visualizer, volume-control expand). These properties trigger layout recalculation on every frame rather than compositing on the GPU — cheap to fix, and exactly the kind of jank that undercuts an otherwise snappy, minimal interface.
- **Fix**: Swap to `transform: scale()` / `clip-path` equivalents where the visual result can match.
- **Suggested command**: `/impeccable optimize`

## Persona Red Flags

**Jordan (First-Timer)**: Hits the P0 redirect trap on any shared deep link, and separately faces a four-stage entry ritual (loading → click-to-enter → music → randomized animation) with zero context for why a personal portfolio needs music and a loading gate before any content appears.

**Sam (Accessibility-Dependent)**: The ~1.8:1 resting contrast (P1) is a hard blocker — low-vision or screen-magnifier users get no readable text until hover, which doesn't exist on mobile. Separately, `<audio autoplay>` with no pre-interaction mute control conflicts with WCAG 1.4.2 (audio control).

**Casey (Mobile)**: Inherits Sam's contrast problem structurally, since no hover state exists to rescue it on touch. The click-to-enter-plus-autoplay-audio pattern is also rougher on mobile Safari, where autoplay policies are stricter than desktop — meaning the P0 redirect trap is *more* likely to fire on mobile, not less.

## Minor Observations

- Keyboard-only desktop users tabbing through links get only a faint ~1px outline at a similarly dim color (`style.css:207-210`) — they never receive the brightening reward that mouse/hover users get. A smaller version of the P1 contrast issue.
- `renderHomePageContent()` (`index.js:169-203`) duplicates markup/logic already in `effects.js`'s `addStuff()` — two divergent sources of truth for the same home content, which is how the tagline-text inconsistency (heuristic #4) happened.
- WIP and dApp-Store modals duplicate ~40 lines of near-identical CSS (`layout.ejs:183-255`) — low priority given the single-maintainer, low-upkeep intent, but trivially mergeable.
- Design-token drift flagged by the detector: `style.css:483` (`1px` radius), `:540` (`2px` radius), and ad-hoc grays/black-alphas (`#aaa`, `#666`, `rgba(0,0,0,0.4/0.5)`) sit outside DESIGN.md's documented scale — on-brand in hue, off the documented list. Worth a quick token pass, not urgent.
- Global `body { cursor: none }` (`style.css:30`) is unconditional; the replacement ring cursor is only instantiated by JS above 768px. If that script errors or is slow to init, desktop users are briefly (or permanently, on failure) left with no cursor at all.

## Questions to Consider

- What if the music/loading gate remembered a returning visitor (e.g. `sessionStorage`) and skipped straight to content on repeat visits — would that resolve "the entry ritual pays the same toll every time" without diluting the first-visit pitch?
- What if the redirect-to-`/` on an ungated deep link were replaced by rendering the destination page itself behind a lightweight "tap to enter" overlay — same gate, but the destination is never lost?
- Would trimming the typewriter pool from ~19 lines to the ~8 that actually sound like the same person make the voice feel more deliberate rather than diluted?
