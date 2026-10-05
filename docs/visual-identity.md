# NALT Studio visual identity

**Read this file before making design decisions in future NALT work.** Continue the existing identity and architecture. Treat the current brief as an iteration unless the user explicitly requests a rebuild.

## Brand

NALT Studio is a **software development company**. “Studio” is part of its name, not an architectural or interior-design positioning.

Its identity is **Technical Craft + Bold Experimental**, with **Bold Experimental dominant**. The site should feel premium, confident, cinematic, modern, software-native, memorable, and technically precise. Expressive composition should be supported by carefully engineered implementation and usable interaction.

## Color

| Token | Value | Role |
| --- | --- | --- |
| Near-black | `#080808` | Primary background |
| Warm off-white | `#F4EFE7` | Primary typography and structural contrast |
| Muted off-white | `#AAA69F` | Supporting text and technical metadata |
| Signal orange | `#FF4B00` | Signature accent |

Orange belongs primarily to the NALT A, tiny active indicators, and occasional interaction details. It must not become the default color for every divider, hover, label, or button. Keep selected project titles warm off-white; establish emphasis through image, movement, and hierarchy.

## Typography

The intended primary/display direction is **Neue Montreal**. Because a licensed font file has not been supplied, the current implementation uses **local Geist Sans** as its fallback. Continue that implementation; do not download, fabricate, or imply the presence of Neue Montreal.

Use **local Geist Mono** for navigation details, project indices, categories, years, metadata, and small technical/interface labels. Large typography should remain controlled, readable, and decisive. Technical labels provide a quiet contrast rather than dominating the page.

## Composition

Use editorial, asymmetric composition with large typography, generous negative space, precise alignment, and deliberate grids. Allow scale and cropping to create confidence. Preserve the visual relationship between the headline and giant A without adding decorative clutter.

Horizontal work rows should be spacious and sharp, with strong rules and metadata positioned consistently. Their previews interrupt the row visually while keeping the title and key information readable. Avoid portfolio cards, rounded containers, tiled grids, masonry, and full-screen case-study panels for this section.

## Motion

Motion is cinematic and engineered. Its complexity comes from **choreography, masking, scale, transformation, overlap, and controlled easing**. Use decisive entries and clean resolutions. The settled interface should be calmer than the transition that introduces it.

The opening uses one continuing A SVG element. N, L, and T have distinct masked paths: N enters and leaves horizontally, L rises and drops, and T approaches and leaves toward the upper right. Hero typography enters while A expansion is still in progress. Brief calibration elements belong to the opening and disappear from the final hero.

Use transforms and opacity where possible, clip-path carefully, and GSAP where it materially improves the result. Pointer responses must be subtle and input-driven. Keep native scrolling, avoid excessive pinning, and clean up animation contexts and listeners. Support touch, keyboard focus, resizing, and reduced motion as part of the design.

Avoid bounce, elastic movement, idle floating, excessive blur, RGB splitting, glitch effects, particles, explosions, random distortion, and fake terminal/HUD decoration. Do not add WebGL, Three.js, canvas, or additional large motion libraries to achieve effects the current architecture can express.

## Interface

Use sharp, minimal controls with clear semantics, generous hit areas, visible keyboard focus, and sufficient contrast. Interface elements should help the user understand or act.

Avoid generic SaaS cards, rounded visual language, glassmorphism, gradients, shadows as decoration, pill controls everywhere, and borders around every object. Keep metadata concise and purposeful. Never invent project achievements, client claims, statistics, screenshots, reviews, or credentials to fill a layout.

## Logo

The **A is the hero symbol** and represents elevation. Use it intelligently as a recognizable brand anchor. Do not make every section revolve around A or repeat the hero composition throughout the site.

The repository currently contains the original supplied PNGs, the existing traced A SVG geometry, a processed wordmark PNG, and N/L/T PNG crops. Preserve these sources. This iteration does not reconvert, redraw, or reinterpret the brand assets. The trace is a PNG-derived contour, not an original brand vector. Maintain compatibility with replacing it with proper supplied vector originals later, including the single-element A animation.

## Rhythm across the site

Sections should share one identity while changing visual pace:

- **Hero:** cinematic and expressive.
- **Selected Work:** visual, interactive, and immersive.
- **Capabilities:** one evolving digital system, expressive typography with precise structure.
- **Experimental section, later:** bold and proprietary.
- **About, later:** calmer and human.
- **Final CTA, later:** iconic and a strong finish.

These future directions are design references, not authorization to build later sections. The current homepage ends after **Intro → Hero → Selected Work → Capabilities**, with **exactly four horizontal project rows and four capabilities**. Manifesto, Experimental NALT, About, Process, a footer/final CTA, and project detail pages remain outside this iteration.

## Capabilities: one system, four forms

Websites, E-commerce, Digital Products, and Custom Platforms are four states of one NALT design and engineering system. A vertical registration spine continues from the last Work divider. Restrained orange marks its scroll progress, current node, and one small system signal; titles remain warm off-white.

Compose the stages with deliberate typographic variation on one underlying grid. The same three desktop SVG primitives evolve continuously: layered interface planes become commerce modules, rounded component states, then connected platform layers. Transforms, shared geometry, and overlapping detail changes create continuity. Keep native scrolling with a light CSS sticky visual and minimal ScrollTrigger usage. This is neither service cards nor a generic process infographic.

Tablet and mobile use a clear left spine with inline visuals below readable title, copy, and tags. Reduced motion and no JavaScript show one resolved static visual per capability with all content available. The SVGs are decorative; all meaningful capability information lives in semantic HTML.

## Avoid

Do not drift toward architecture, interior design, generic AI-agency/site aesthetics, gaming, cyberpunk, Web3, generic startups, template portfolios, or a decorative concept that cannot work as a real site. Judge the result as a premium software development company's usable website.
