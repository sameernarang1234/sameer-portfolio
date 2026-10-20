# Sameer Narang — Portfolio

Single-page, WebGL-powered portfolio. **Three.js** (46k-particle GPU shader field that morphs per section),
**GSAP + ScrollTrigger** (reveals, counters, scroll-driven walkthroughs), **Lenis** (smooth scroll), and
self-hosted variable fonts. Vanilla JS + Vite — no framework.

## Run
```bash
npm install --legacy-peer-deps
npm run dev        # http://localhost:5173
npm run build      # outputs ./dist (static, relative paths — host anywhere)
npm run preview    # serve the production build on :4173
```

## Edit content
- Text sections (hero, about, experience, skills, education, contact): `index.html`
- Project walkthrough captions & screenshot order: `src/projects.js`
- Colours / typography / layout: `src/style.css` (design tokens at the top)
- Particle shapes, per-section palette & placement: `src/scene.js` (`STATE`, `PALETTE`)
- Screenshots: `public/img/*.webp`

## Screenshots & sample data
All screenshots of **Sewadaar Directory** and the **Monastery/Ashram Expense Manager** were captured from the
running apps using fully synthetic sample data (no production data). The generators/seeders and the Playwright
capture scripts live in `demo-tooling/` (they expect the demo Docker stacks to be running).

## Deploy
`dist/` is a plain static site: Netlify / Vercel / Cloudflare Pages / GitHub Pages / S3 + CloudFront all work.
