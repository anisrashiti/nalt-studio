@AGENTS.md

# NALT Studio site

Single-page marketing site for NALT, a software studio in Prishtina. Built from the Figma file `lPaE1Pgxs1xIkInsgEhJUe` ("nalt-studio").

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4. Tokens live in `@theme` in `src/app/globals.css`; there is no `tailwind.config`.
- Fonts through `next/font/google` in `src/app/layout.tsx`
- Framer Motion for scroll animation

## Commands

- `npm run dev`, `npm run lint`, `npm run build`
- `npx tsc --noEmit` needs a prior `npm run build` or `npm run dev`, which generates the route types such as `LayoutProps`.

## Folder structure

```
public/brand/        Logo SVGs exported from Figma. Do not edit.
src/app/             layout, page, globals.css, icon.svg
src/components/
  brand/             Wordmark, LogoSymbol
  layout/            Nav, pill, clock, progress bar, footer
  sections/          One file per homepage section
  work/              Parts of the pinned work section
  ui/                Small shared pieces (media placeholder, table row, tag)
src/hooks/           Scroll, media query and playback hooks
src/content/site.ts  Placeholder copy and links as typed data
```

One component per file, small and readable. Named exports.

## Design tokens

The default Tailwind palette, type scale and radii are cleared, so only these exist. Do not add arbitrary colors or font sizes.

| Token | Value | Use | Figma variable |
|---|---|---|---|
| `ink` | `#0A0A09` | Background of the whole site | `color/background` |
| `graphite` | `#1B1A17` | Cards, media, surfaces | `color/surface` |
| `rule` | `#2B2925` | Dividers, borders, raised chips (nav pill, tags) | `color/line` |
| `cream` | `#EFECE5` | Main text and the wordmark | `color/text` |
| `stone` | `#8A867D` | Secondary text, labels, dates | `color/text-muted` |
| `signal` | `#FF4D00` | Only live, active, progress, hover | `color/signal` |

| Class | Font | Size / line height | Tracking | Use |
|---|---|---|---|---|
| `text-title` | Archivo | 48 / 50px | -2% | Section titles. Nothing on the site is bigger. |
| `text-intro` | Archivo | 32 / 42px | -1% | The intro paragraph |
| `text-lede` | Archivo | 20 / 1.4 | -0.5% | Lead sentences |
| `text-body` | Archivo | 16 / 1.5 | 0 | Body, stories, table rows. `font-medium` for buttons and rare emphasis. |
| `type-label` | JetBrains Mono | 12 / 16px, uppercase | 6% | Clock, dates, index, tags, small links |

Archivo Regular and Medium only. Archivo Black is not used: the wordmark is a drawn SVG.

Spacing: `gutter` 28 (text margin), `inset` 16 (card margin), `stack` 12 (gap between cards), `project` 72 (gap between projects), `nav` 140 (where pinned content and scroll targets sit below the top of the screen).

Radius: `rounded-card` 8, `rounded-pill` 6, `rounded-logo` 4, `rounded-tag` 3, `rounded-chip` 12.

## Orange signal rules

Orange (`signal`) only appears where something is live, active, or yours to act on. Roughly 3–5% of any screen. Never backgrounds, body text, or decoration. Never two competing on one screen.

Allowed uses, and nothing else:

- **The mark:** the logo Λ, the nav pill symbol, the cursor
- **Live:** the clock dot
- **Progress:** scroll, reel, timer
- **Where you are:** the active project number
- **Hover / focus:** cream at rest, orange on hover. Use the `link-signal` utility.
- **Text selection:** orange background, ink text (set globally)
- **Confirmation:** the "Copied" chip after copying the email
- **One word:** "somewhere to go". At most one per page.

In Figma, the "HOVER" tags, the orange "Digital products" row and the orange "[ VIEW ALL PROJECTS ]" show hover states. They are cream at rest on the site. The trigger line in frame D2 is not visible on the site.

## Logo rules

- Use `Wordmark` and `LogoSymbol`. Never stretch, outline or recolor the letters.
- The Λ is always Signal. Letters are Cream on dark, Ink on light.
- Minimum size: 12px tall (wordmark), 16px (symbol). The nav pill symbol is the one exception in the design, at 10×7.7.
- Clear space of one N-width on every side.
- The chevron stays small: logo, nav pill, cursor, favicon. No giant shapes.

## Placeholders

Frames labeled `[VIDEO]` and `[IMAGE]` are styled placeholder boxes with the design's size and ratio. They must stay easy to swap for real media. Videos play only when in view.

## Responsive

The Figma frames are 1440 wide, and there are no mobile frames. Layouts below 1280 are our own, in the same style.

| Width | Behavior |
|---|---|
| Under 768 (phone) | Tokens drop to `gutter` 16, `inset` 8, Title 32, Intro 20, so the five sizes hold. Nav is always the pill and the clock shows the time only. The hero is a static card with no scroll effect. Project text stacks above its own cards. |
| 768 and up (tablet) | Full nav collapsing into the pill, hero shrink on scroll. Work is still stacked. |
| 1024 and up | Work switches to the pinned column with text swaps. Services and Contact are still stacked. |
| 1280 and up | Services and Contact use the split layout. At 1440 everything matches frame C. |

Viewport checks in JavaScript use `useMediaQuery` with the same breakpoints, and any markup that differs by width is switched in CSS, so hydration stays consistent.

## Motion

Respect `prefers-reduced-motion` in everything: use `usePrefersReducedMotion`, which is safe during hydration. Text swaps in the work section use `MaskSwap`: they slide and clip in about 400ms, with no fades between.
