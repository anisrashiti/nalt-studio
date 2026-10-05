# NALT Studio — Intro → Hero → Selected Work

This iteration extends the existing Next.js application. The homepage contains the opening, the hero, and exactly four horizontal Selected Work rows. Capabilities, Experimental NALT, About, a footer/final CTA, and project detail pages are outside this iteration.

Read [docs/visual-identity.md](docs/visual-identity.md) before making future design decisions. NALT Studio is a software development company; its identity combines Technical Craft with dominant Bold Experimental expression.

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

In another terminal, run `npm.cmd run qa` against that preview with the installed Chrome browser. Set `NALT_QA_URL` to check another local port:

```powershell
$env:NALT_QA_URL = "http://localhost:3400"
npm.cmd run qa
```

## Opening choreography

One master GSAP timeline in `lib/animations/naltIntro.ts` animates the same `.hero-mark > svg` from the centered A outline into the cropped hero A. The brief ghost outlines are decorative copies; neither replaces the hero mark.

| Label | Desktop time | Action |
| --- | --- | --- |
| `locate` | 0.12s | Brief, faint grid, center guides, and reticle |
| `draw` | 0.28s | A outline traces for 0.48s; fill begins at 0.73s, then the outline clears and A rises slightly |
| `identify` | 1.00s | Large NALT assembles: N from the left, L from below, T from the upper right |
| `massive` | 1.43s | Wordmark scales over 0.28s, from 62% to 72% of desktop viewport width |
| `break` | 1.95s | N exits left, L drops, T exits upper right; the A survives |
| `expand` | 2.40s | The same A scales and travels into its cropped hero position over 1.08s |
| `typography` | 2.70s | Masked headline lines rise, staggered by 0.10s, while the A is still expanding |
| `resolve` | 3.10s | Navigation, supporting copy, CTA, and metadata resolve |
| `live` | 4.05s | Temporary guides and fragments are hidden; pointer and scroll interaction become available |

Mobile assembles at 76% and expands to 86% of viewport width. It uses a `1.2` timeline time scale, completing in approximately **3.375s**. The desktop massive wordmark holds for approximately **240ms** before breaking apart.

The original N/L/T crops and the continuing A share one geometry system: the complete wordmark spans approximately `3.48 × A width`. The A anchor sits at viewport center minus `0.30 × A width`, centering the full wordmark while keeping A as the reference for every letter. Individual masks give the letters distinct entry and exit directions. The letter wrappers and the continuing A scale together during the massive reveal; the letters do not simply fade out.

The A expansion uses GSAP CustomEase `0.76,0,0.18,1`. The first headline enters 300ms after expansion begins, and the second follows 100ms later. Temporary registration details, ghost outlines, the scan line, and N/L/T disappear before the resolved interface takes over. The final hero uses the existing copy with `SOFTWARE / DEVELOPMENT` replacing `PRODUCT / STUDIO`.

Reduced motion shows the resolved hero immediately. A document-scoped flag skips the opening on client-side remounts; a full reload replays it. No persistent storage is added. Resizing during the opening settles the same SVG into its responsive CSS position. The Skip Intro control also resolves that existing SVG and restores focus when needed.

## Hero interaction and transition

After LIVE, mouse movement on a fine-pointer, non-touch desktop moves the A by at most ±4px and the typography in the opposite direction by at most ±1.5px. Eased `quickTo` tweens respond to pointer input and return to rest on pointer exit or window blur. There is no idle animation. Touch and reduced-motion users receive a stationary composition.

Scrolling remains native. A single hero ScrollTrigger moves the headline upward slightly, drifts the A farther right and upward, and reduces the prominence of supporting metadata. A separate, one-shot Selected Work ScrollTrigger reveals its label, count, horizontal rules, and rows. There is no pinning or scroll interception. Reduced motion bypasses these animated scroll treatments. GSAP media contexts, resize observation, pointer listeners, and interaction tweens are cleaned up on unmount.

`WORK` in navigation and `SEE OUR WORK` now link to the real `#work` section. Capabilities, About, and Contact remain inactive labels because their destinations have not been built.

## Selected Work

`lib/data/projects.ts` supplies four rows through `SelectedWork` and `ProjectRow`. A project entry supports `id`, `title`, `category`, `year`, `image` with `src`/`alt`, an optional real `href`, and optional secondary metadata. Replace the data when approved project material is available.

The current rows are intentionally neutral: **Project 01–04**, with `CONTENT PENDING`, `YEAR TBD`, and no project destination or supplied project image. The geometric preview surfaces are explicitly marked `PREVIEW PENDING`; they are temporary interface placeholders, not client screenshots. No client claims, achievements, descriptions, or fabricated project years are included.

On desktop, hover or keyboard focus activates a row. Its preview opens from a clipped central slice, with image scale settling from `1.08` to `1`. The title moves 16px and metadata moves 6px in the opposite direction. A tiny orange marker and a brighter rule identify the active row; other rows remain readable. Fine-pointer image parallax is limited to ±10px horizontally and ±7px vertically. Each row owns a reversible animation, so moving directly between rows overlaps the outgoing and incoming states.

Without a real `href`, rows are semantic disclosure buttons with `aria-expanded` and `aria-controls`. On touch, the first tap opens a preview below its title and metadata; another tap closes it, and choosing another row switches the active preview. Enter/Space work through native button behavior, focus activates the equivalent state, and Escape clears the active preview. Reduced motion changes preview states immediately without animated translation or pointer parallax.

Adding an approved real `href` changes the row into a semantic link. The routing structure supports first-tap preview and second-tap navigation on touch without adding any project pages now. When real images are supplied, the existing `next/image` branch uses responsive sizes and meaningful alt text; current placeholders add no raster image downloads.

## Brand sources and typography

Only PNG brand files were originally supplied. The existing `scripts/prepare-brand.mjs` traced the favicon silhouette into an SVG contour using source vertices and a two-source-pixel simplification tolerance (approximately 0.3% of mark width). This is a faithful PNG trace, **not the unavailable original brand SVG**. The originals remain under `public/brand/originals/`.

This iteration does not run another conversion, redraw the A, or change any brand asset. The temporary N/L/T and navbar wordmark continue using crops of the supplied wordmark with their dark background made transparent. When original vector sources become available, replace `NALT_A_PATH` and `NALT_A_VIEWBOX` in `lib/brand/naltGeometry.ts`, update the exported SVG assets, and preserve the single-element animation structure.

Geist Sans remains the local display/body fallback for the Neue Montreal direction; a licensed Neue Montreal file has not been supplied. Geist Mono serves navigation, technical labels, project numbers, and metadata. Both fonts use local package assets without Google Fonts build requests. Neue Montreal is not downloaded or fabricated.

## Files in this iteration

| Change | Files |
| --- | --- |
| Created: work components | `components/SelectedWork.tsx`, `components/ProjectRow.tsx`, `components/SelectedWork.module.css` |
| Created: work animation and data | `lib/animations/selectedWork.ts`, `lib/data/projects.ts` |
| Created: internal design reference and agent guidance | `docs/visual-identity.md`, `AGENTS.md` |
| Modified: homepage and hero styling | `app/page.tsx`, `app/globals.css` |
| Modified: hero, navigation, and opening | `components/NaltIntroHero.tsx`, `components/Navigation.tsx`, `lib/animations/naltIntro.ts` |
| Modified: documentation | `README.md` |
| Modified: browser verification | `scripts/hero-qa.mjs` |
| Generated by the production build | `next-env.d.ts` (Next.js type imports) |

The existing `NaltMark`, traced geometry, brand assets, font setup, and application configuration are retained. Next.js generates `.next/` and TypeScript cache files. Browser verification writes ignored screenshots and results under `qa/`; these are not source changes.

## Verification

Run these checks sequentially:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Then start the production preview and run `npm.cmd run qa`. Review desktop and mobile opening phases, the continuing A element, masked letter exits, overlapping hero text, clean final state, pointer limits, native scrolling into Work, exactly four rows, switching active rows, keyboard and touch disclosure, reduced motion, responsive layouts down to 320px, horizontal overflow, browser errors, and cleanup on unmount. Also confirm that no later homepage sections or project pages were added.

For this iteration, TypeScript, lint, and the production build passed. Chrome production-preview QA passed **20 scenarios**, with **zero console, page, or HTTP errors**. Checks covered desktop and mobile choreography, measured 72%/86% wordmark sizing, directional exits, headline entry during expansion, SVG continuity, pointer bounds, native Work anchors, row switching, keyboard/touch interaction, reduced-motion changes, skip/resize behavior, no-JavaScript rendering, and nine responsive viewports from 320px to 1920px. Evidence is written to ignored `qa/results.json`, `qa/opening-desktop.json`, `qa/opening-mobile.json`, and screenshots under `qa/`.

No push or hosted deployment is part of this iteration.

Implementation references: [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [GSAP CustomEase](https://gsap.com/docs/v3/Eases/CustomEase/), [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation).
