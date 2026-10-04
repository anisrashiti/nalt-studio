"use client";

import { useLayoutEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { NaltMark } from "@/components/NaltMark";
import { createNaltIntro } from "@/lib/animations/naltIntro";

export function NaltIntroHero() {
  const scene = useRef<HTMLElement>(null);
  const intro = useRef<ReturnType<typeof createNaltIntro> | null>(null);

  useLayoutEffect(() => {
    if (!scene.current) return;
    intro.current = createNaltIntro(scene.current);
    return () => {
      intro.current?.destroy();
      intro.current = null;
    };
  }, []);

  return (
    <main id="main">
      <section ref={scene} className="intro-hero" aria-labelledby="hero-heading" data-intro-state="pending">
        <div className="coordinate-system" aria-hidden="true">
          <div className="coordinate-grid" />
          <div className="guide guide-horizontal" />
          <div className="guide guide-vertical" />
          <div className="reticle"><span /><span /></div>
          <i className="technical-marker marker-nw" /><i className="technical-marker marker-ne" />
          <i className="technical-marker marker-sw" /><i className="technical-marker marker-se" />
        </div>

        <div className="identity-fragments" aria-hidden="true">
          <div className="letter-mask letter-n-mask"><div className="intro-letter letter-n" /></div>
          <div className="letter-mask letter-l-mask"><div className="intro-letter letter-l" /></div>
          <div className="letter-mask letter-t-mask"><div className="intro-letter letter-t" /></div>
        </div>

        <div className="mark-ghost ghost-one" aria-hidden="true"><NaltMark outline /></div>
        <div className="mark-ghost ghost-two" aria-hidden="true"><NaltMark outline /></div>
        <div className="hero-mark" aria-hidden="true"><NaltMark /></div>
        <div className="scan-line" aria-hidden="true" />

        <Navigation />

        <div className="hero-content">
          <p className="eyebrow mono content-reveal"><span className="index">01</span><span className="eyebrow-rule" aria-hidden="true" />SOFTWARE STUDIO</p>
          <h1 id="hero-heading" className="hero-heading">
            <span className="line-mask"><span className="headline-line">Software</span></span>
            <span className="line-mask"><span className="headline-line">for what’s next.</span></span>
          </h1>
          <div className="hero-support">
            <p className="services mono content-reveal">STRATEGY / DESIGN / ENGINEERING</p>
            <p className="description content-reveal">We design and build digital systems<br className="desktop-break" /> for ambitious companies.</p>
            <div className="content-reveal">
              <button className="work-cta mono" type="button" disabled title="Selected work coming soon">
                SEE OUR WORK<span className="cta-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        <div className="global-metadata interface-reveal mono">
          <span className="global-label">[ GLOBAL ]</span>
          <span className="studio-label">PRODUCT<br />STUDIO</span>
        </div>
        <div className="viewport-metadata interface-reveal mono">
          <span>PRISHTINA, KOSOVO</span>
          <span>2026</span>
        </div>
        <button className="skip-intro mono" type="button" onClick={() => intro.current?.skip()}>
          SKIP INTRO<span aria-hidden="true">↗</span>
        </button>
      </section>
    </main>
  );
}
