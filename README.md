# Alternatefact Studios — Website

"A workshop of alternate realities, engineered by hand." Portfolio site for
Alternatefact Studios: AI short films, concept art and scroll-stopping content.

## Architecture

- **`index.html`** — page structure and copy.
- **`styles.css`** — the workshop/editorial styling (Fraunces + Manrope + IBM Plex Mono).
- **`machine.js`** — the scroll-linked **3D machinery** (Three.js/WebGL): a brass
  steam engine with working piston, crank and steam particles (hero), a clockwork
  with pendulum and interlocking gears (mid-page), and a floating gear assembly
  (bottom). The camera dollies down through the machines as you scroll.
- **`main.js`** — Lenis smooth scrolling, GSAP/ScrollTrigger reveals, scroll
  progress rail, chapter tracker, work-card spotlight.

## Fully self-contained

All dependencies are vendored — no CDNs:

- `assets/vendor/three/` — Three.js (ES module) + RoomEnvironment addon,
  wired via the import map in `index.html`
- `assets/vendor/gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js`
- `assets/fonts.css` + `assets/fonts/` — Fraunces, Manrope, IBM Plex Mono
- `assets/*.jpg` — studio artwork, web-optimized

Host anywhere that serves static files (GitHub Pages, Netlify, Vercel, …).

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Serving over HTTP is required — `machine.js` is an ES module, which browsers
refuse to load from `file://` URLs.
