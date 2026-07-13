# Alternatefact Studios — Website

Portfolio site for Alternatefact Studios: AI short films, UGC, concept art and content production.

## Design

Light, editorial "designer" aesthetic on a warm paper background:

- **Fonts** — Fraunces (display serif, with italic accents) + Manrope (body/UI), self-hosted.
- **Watch-movement background** — a wristwatch calibre drawn as SVG in a fixed
  layer behind the page: toothed train wheels with crescent cutouts and ruby
  jewel bearings, a mainspring barrel with a coiled spring, a bridge plate with
  screws, and a full escapement (escape wheel ticking in discrete steps, pallet
  fork rocking, balance wheel oscillating with a breathing hairspring). Wheels
  also spin with scroll; meshed pairs turn in opposite directions. Configured
  via `data-part` JSON on the `.gear-slot` elements inside `#machine-layer` in
  `index.html` (`speed` = degrees per scrolled pixel, `idle` = degrees per
  second, `freq` = escapement beats per second).
- **Hero collage** — the studio's real artwork as tilted, overlapping cards with
  per-card scroll parallax (`data-parallax` on `.collage-float`).
- **Pinterest-style portfolio** — masonry columns (`columns-*` utilities) with
  natural image heights, pill filters, and soft-shadow cards.
- Scroll-reveal animations, animated counters, marquee strip, and pastel
  tilted cards throughout. All motion respects `prefers-reduced-motion`.

## Fully self-contained

No CDNs. Tailwind is compiled into `assets/tailwind.css`; fonts and Font Awesome
are self-hosted under `assets/`. Pure static HTML/CSS/JS — host anywhere
(GitHub Pages, Netlify, Vercel, any web server).

### Rebuilding the Tailwind CSS

Only needed if you add new Tailwind utility classes to `index.html`:

```bash
npm install tailwindcss@3
npx tailwindcss -i tw-input.css -o assets/tailwind.css --content index.html --minify
```

where `tw-input.css` contains:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
