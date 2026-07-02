# Alternatefact Studios — Website

Dynamic portfolio site for Alternatefact Studios: AI short films, UGC, concept art and content production.

## The particle journey

The top of the site is a scroll-driven particle experience. Each artwork is sampled
into ~14,000 colored particles on a `<canvas>`. As you scroll down, the current
artwork disintegrates into drifting dust and the next one assembles; scrolling up
plays it in reverse, re-forming the previous image. After the last artwork, the
particles dissolve into an ambient starfield behind the rest of the page.

Scenes are configured on the `#journey` element in `index.html`:

```html
<div id="journey" style="height: 700vh;" data-scenes='[
    {"src":"assets/awakening.jpg"},
    {"src":"assets/beyond-lagos.jpg"},
    {"src":"assets/concept-art.jpg"},
    {"src":"assets/one-choice.jpg"}
]'>
```

To add or swap artwork: drop an image in `assets/`, add it to `data-scenes`,
add a matching `.chapter` caption block (with the next `data-chapter` number),
and increase the `height` (roughly +140vh per scene).

Dark, cinematic images work best — near-black pixels are skipped during sampling
so the subject forms out of the void.

## Fully self-contained

No CDNs. Tailwind is compiled into `assets/tailwind.css`, fonts (Inter, Space
Grotesk, Playfair Display) and Font Awesome are self-hosted under `assets/`.
The site is pure static HTML/CSS/JS — host it anywhere (GitHub Pages, Netlify,
Vercel, any web server).

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

(Serving over HTTP is required — the particle engine reads image pixels, which
browsers block on `file://` URLs.)
