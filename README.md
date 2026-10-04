# NALT Studio — Intro → Hero

This iteration contains only the opening and the first hero viewport. There are no later homepage sections or destination pages. The navigation labels and work CTA are intentionally inactive until their destinations are built.

## Run

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000. For a production preview:

```powershell
npm.cmd run build
npm.cmd run start -- --port 3400
```

In another terminal, run `npm.cmd run qa` to verify the production preview with the installed Chrome browser. `NALT_QA_URL` can point the check at another local port.

## Opening

One master GSAP timeline, in `lib/animations/naltIntro.ts`, animates the same `.hero-mark > svg` from the centered outline into the cropped hero A. The two brief ghost outlines are decorative copies; neither becomes the hero mark.

| Label | Desktop time | Action |
| --- | --- | --- |
| `locate` | 0.15s | Faint grid, center guides, reticle |
| `draw` | 0.35s | Outline traces for 0.60s; fill begins at 0.90s |
| `identify` | 0.85s | Masked N from left, L/T from right |
| `break` | 1.15s | Two ghost outlines, scan, outward markers, letters exit |
| `expand` | 1.50s | Same A scales and travels right for 1.02s |
| `typography` | 1.75s | Two masked headline lines, staggered by 0.10s |
| `resolve` | 2.00s | Navigation and metadata; supporting text overlaps |
| `live` | 3.00s | Clear temporary transforms and guides |

Mobile uses a 1.18 timeline time scale, completing in approximately 2.54s. Reduced motion shows the complete hero immediately. A document-scoped flag skips the opening on client-side remounts; full reloads replay it. No persistence is added. Resizing during the intro settles the same SVG into its CSS position.

The mark expands with GSAP CustomEase `0.76,0,0.18,1`. There are no timers in the opening choreography, layout-property tweens, WebGL, canvas, or continuously running animation after resolution.

## Brand sources and typography

Only PNG brand files were supplied. `scripts/prepare-brand.mjs` converts the favicon's source silhouette into an SVG contour. All vertices come from that source contour; a two-source-pixel tolerance (0.3% of the mark width) removes raster texture and staircase artifacts. This is a faithful PNG trace, **not the unavailable original brand SVG**. The originals are preserved under `public/brand/originals/`. When the original vector source becomes available, replace `NALT_A_PATH` and `NALT_A_VIEWBOX` in `lib/brand/naltGeometry.ts`, update the exported SVG assets, and keep the single-element animation structure.

The temporary N/L/T and navbar wordmark use crops of the supplied wordmark, with the dark background made transparent. No new letterforms are designed.

Geist Sans is the available display/body fallback for the Neue Montreal direction; a licensed Neue Montreal font file was not supplied. Geist Mono is used for interface and metadata. Both fonts are local package assets, with no Google Fonts build request.

## Files created

The workspace was empty; no existing source files were replaced.

| Purpose | Files |
| --- | --- |
| App | `app/layout.tsx`, `app/page.tsx`, `app/globals.css` |
| Components | `components/NaltIntroHero.tsx`, `components/NaltMark.tsx`, `components/Navigation.tsx` |
| Animation and geometry | `lib/animations/naltIntro.ts`, `lib/brand/naltGeometry.ts` |
| Scripts | `scripts/prepare-brand.mjs`, `scripts/hero-qa.mjs` |
| Brand assets | `public/brand/nalt-a.svg`, `public/brand/nalt-icon.svg`, `public/brand/apple-touch-icon.png`, `public/brand/nalt-wordmark.png`, `public/brand/nalt-n.png`, `public/brand/nalt-l.png`, `public/brand/nalt-t.png`, `public/brand/coordinate-grid.svg` |
| Original assets | `public/brand/originals/wordmark_nalt.png`, `public/brand/originals/facivon_nalt.png` |
| Configuration and documentation | `package.json`, `package-lock.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `eslint.config.mjs`, `.gitignore`, `README.md` |

Next.js also generates `.next/` and TypeScript cache files. Browser verification creates ignored screenshots and `qa/results.json` under `qa/`.

## Verification

- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run qa` against the production preview

Browser checks cover the same SVG before/after expansion, desktop and mobile layouts, mobile timing, reduced motion, keyboard focus and skip, reload, resize, client home navigation, menu Escape/focus, no JavaScript, a single homepage section, horizontal/vertical overflow, metadata/supporting-copy contrast against the actual SVG geometry, and browser errors.

No Git repository, commit, push, or hosted deployment has been created.

Implementation references: [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [GSAP CustomEase](https://gsap.com/docs/v3/Eases/CustomEase/), [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation).
