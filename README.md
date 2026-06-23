# dominickvarano.io

Personal portfolio for Dominick Varano — Web / Mobile / AI-system development.

Built with **Next.js (App Router)**, **JavaScript**, **Tailwind CSS**, **React Three Fiber**, and **Motion** (`motion` + `motion-plus`). Deployed on **Vercel**.

## Getting started

`motion-plus` is a paid package pulled from Motion's private registry. `.npmrc`
reads the token from a `MOTION_TOKEN` environment variable (the token itself is
never committed), so export it before installing:

```bash
export MOTION_TOKEN=...   # from https://plus.motion.dev
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
npm test         # run the status-resolver unit tests
```

## Project structure

```
app/                     # App Router entry (layout, page, global styles)
  layout.jsx             # <html> shell + SEO/OG metadata
  page.jsx               # composes the page sections
  globals.css            # Tailwind + the color tokens (CSS variables)
components/
  hero/                  # Hero section + liquid-glass panel
  status/                # "What I'm doing right now" status bar
  portfolio/             # Project carousel + cards
  about/                 # About + scroll-revealed portrait (PortraitReveal)
  contact/               # Contact CTA + footer + idle glyph orbit (ContactOrbit)
  three/                 # React Three Fiber scenes & lazy wrappers
  ui/                    # Shared UI: Reveal, ScrambleText, CursorTrail
  index.jsx              # barrel export of section components
content/                 # ← all editable copy/data lives here
  site.jsx               # name, tagline, email, domain, social
  projects.jsx           # portfolio entries
  about.jsx              # bio + portrait path
  statuses.jsx           # status-bar schedule
lib/
  status.jsx             # pure getCurrentStatus(date) resolver
  status.test.jsx        # unit tests for the resolver
  useReducedMotion.jsx   # prefers-reduced-motion hook
  useScrollTriggerActive.jsx  # scroll-direction-gated in-view trigger
public/                  # images (portrait.webp, og, favicon, projects/)
```

All files use the `.jsx` extension. Imports use the `@/` path alias (repo root).

## Editing content

Everything you'd normally want to change lives in **`content/`** — no code changes needed.

- **Name / tagline / email / social:** `content/site.jsx`
- **About text + portrait:** `content/about.jsx` (drop a real photo at `public/portrait.webp` or change the path — a transparent-background cutout reads best with the scroll reveal; keep it optimized, ~1000px wide is plenty)
- **Status schedule:** `content/statuses.jsx` (see below)

### Adding a project

Add an object to the array in `content/projects.jsx`:

```js
{
  title: "Project name",
  blurb: "One or two sentences.",
  tags: ["Next.js", "AI"],
  accent: "cobalt",            // magenta | purple | cobalt | ember | lime
  image: "/projects/my-shot.webp",
  links: [{ label: "Visit", href: "https://..." }],
}
```

Put the image in `public/projects/`.

### The status bar

`content/statuses.jsx` defines rules matched by **day of week** and **time of day**
(first match wins). `lib/status.jsx`'s pure `getCurrentStatus(date)` resolves them —
it's covered by `lib/status.test.jsx` (`npm test`). This is **not** live data yet;
swapping in a real source (calendar, presence API) later only touches `lib/status.jsx`.

## Tuning colors

The palette is defined once as CSS variables in **`app/globals.css`** (`:root`) and
exposed to Tailwind as tokens in **`tailwind.config.js`** (e.g. `bg-ink`,
`text-neon-magenta`). Change a hex in `globals.css` and it updates site-wide.

The 3D scene reads the same hex values from its own `DEFAULTS.colors` array in
`components/three/AuroraScene.jsx` — keep those in sync if you re-theme.

## The hero animation

`components/three/AuroraScene.jsx` is a GPU aurora: a full-screen shader that
domain-warps fractal noise over time to paint flowing, constantly shifting
curtains of neon light, ramped through the site palette. Every knob (`speed`,
`scale`, `intensity`, `bandLow`/`bandHigh`, `colors`, etc.) lives in `DEFAULTS`
and is overridable via props on `<AuroraCanvas />`. It renders on demand at a
capped framerate and pauses while scrolled off-screen, and respects
`prefers-reduced-motion` (a single static frame, no motion).

The hero copy sits inside a `.liquid-glass` panel (see `app/globals.css`) — an
iOS-style frosted-glass pane that blurs and refracts the aurora behind it so
text stays legible while the color still reads through.

> **TODO:** additional 3D animations will be added as separate scene components
> under `components/three/`.
