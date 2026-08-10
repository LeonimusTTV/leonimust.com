# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Fellow devs and internet friends who already know LeonimusT's work — people dropping by to poke around, see what's new, and play the browser games. Not primarily optimized for recruiters/clients or for end users of the individual apps (subscriptions management, focus, delay-your-purchases) discovering them cold.

## Product Purpose

leonimust.com is LeonimusT's mini portfolio: a single personal site showing off web projects, browser games, and mobile apps (web stuff, games, mobile apps — "not always good at all three"). Success is a fun, memorable visit for people who already know the person, not conversion or lead-gen.

## Positioning

Not a conventional portfolio. The entry sequence itself is the pitch: a loading gate, autoplay music, and randomized CSS entrance animations before content even appears — the personality of the build is the demonstration of skill, more than the project list underneath it.

## Operating Context

- Express 5 + EJS server-rendered app (`views/*.ejs`, `routes/index.js`), built/served via `bun run build` → `dist/`.
- Pages: `/` (animated landing with music-gated intro), `/projects`, `/games` (live-pings three subdomains — supercold, doom, earthwalker — and shows up/down status), `/mobile` (Solana Mobile dApp Store-only apps, with WIP and dApp Store explainer modals), `/legal/*` (per-app copyright/licensing/privacy pages for subscriptions-management, package-tracking, delay-your-purchases, focus).
- Contact form (`POST /contact/send`) emails leo@leonimust.com via Proton SMTP.
- Client-side page transitions (`loadPage`) and a persistent floating music volume control live across routes.

## Capabilities and Constraints

- Terminal-styled UI: Courier New monospace, dark near-black background, custom hidden cursor (`cursor: none`), animate.css-driven entrance/interaction animations.
- Background music autoplays on landing and gates the intro copy/animation sequence; a floating volume control persists site-wide once music is playing. `/projects`, `/games`, `/mobile` redirect back to `/` if music isn't playing (music state is treated as the "entered the site" signal).
- `/games` status pings are live network calls (axios, 5s timeout) against real subdomains, not static copy.
- `/mobile` apps are Solana Mobile dApp Store exclusives (Saga / Chapter 2) — not available via normal app stores; a modal explains this.
- Single dev/maintainer; per the README this project "will probably not get any update whatsoever" and is shared for others to reuse.

## Brand Commitments

- Name/handle: LeonimusT (github.com/LeonimusTTV). Site voice is lowercase, dry, casual ("i build web stuff, games and mobile apps. not always good at all three.").
- Autoplay music on entry and the terminal/monospace aesthetic (no-cursor, Courier New, dark background, animate.css entrances) are core identity, confirmed binding — not incidental implementation to redesign away.
- Live status checks on `/games` and dApp-Store-only badges on `/mobile` are functional and must keep working, not just decorative.

## Evidence on Hand

- Real, working project links: spoticraft (Modrinth), leo ai (ai.leonimust.com), zero two fan site, valentine, discord bait, "teams but (actually) good" — all live external links, not placeholders.
- Real game subdomains with live uptime checks: supercold, doom, earthwalker.
- Real mobile apps (dApp Store-gated): subscriptions management, focus, delay-your-purchases; package tracker is explicitly WIP.
- No testimonials, case studies, press, or usage metrics exist or should be fabricated.

## Product Principles

1. The experience is the portfolio — entry ritual (music, animation, terminal feel) carries as much weight as the project list.
2. Built for people already in on the joke (devs, friends), not for cold conversion of recruiters or app users — keep the voice casual and inside-baseball rather than sales-oriented.
3. Never fake liveness — status indicators and store availability must reflect real state, not decorative claims.
4. Minimal and low-maintenance by design; avoid additions that create ongoing upkeep burden for a single-maintainer, "won't get updated" project.
