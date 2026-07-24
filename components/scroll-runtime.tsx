"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { stage } from "@/lib/stage-store";

/**
 * Owns smooth scrolling and turns raw scroll into a fractional beat index.
 *
 * Beat position is measured from each section's real centre rather than assuming
 * every beat is exactly 100vh — sections grow on small screens, and hard-coding
 * viewport multiples would drift the 3D choreography out of sync with the copy.
 */
export default function ScrollRuntime() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stage.reduced = reduced;

    /** Document-space centre of each beat section. */
    let centres: number[] = [];

    const measure = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-beat]"),
      ).sort(
        (a, b) => Number(a.dataset.beat ?? 0) - Number(b.dataset.beat ?? 0),
      );
      centres = sections.map((el) => {
        const box = el.getBoundingClientRect();
        return box.top + window.scrollY + box.height / 2;
      });
    };

    /** Map a scroll offset onto the fractional beat index. */
    const toBeat = (scroll: number) => {
      if (centres.length === 0) return 0;
      const eye = scroll + window.innerHeight / 2;
      if (eye <= centres[0]) return 0;
      const last = centres.length - 1;
      if (eye >= centres[last]) return last;
      for (let i = 0; i < last; i++) {
        const a = centres[i];
        const b = centres[i + 1];
        if (eye >= a && eye <= b) {
          const span = b - a;
          return span > 0 ? i + (eye - a) / span : i;
        }
      }
      return last;
    };

    const write = (scroll: number, limit: number) => {
      stage.beat = toBeat(scroll);
      stage.progress = limit > 0 ? Math.min(Math.max(scroll / limit, 0), 1) : 0;
      // CSS-only consumers (the nav progress rule) read this without re-rendering.
      root.style.setProperty("--scroll", stage.progress.toFixed(4));
    };

    measure();

    // Reduced motion: skip Lenis entirely and track native scroll instead, so
    // the page keeps the visitor's own scrolling behaviour.
    if (reduced) {
      const onScroll = () =>
        write(
          window.scrollY,
          document.documentElement.scrollHeight - window.innerHeight,
        );
      const onResize = () => {
        measure();
        onScroll();
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      // Section heights shift once the webfonts swap in.
      document.fonts?.ready.then(onResize).catch(() => {});
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
      };
    }

    const lenis = new Lenis({
      duration: 1.15,
      // Long, soft tail — the glass form keeps moving after the wheel stops.
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      autoRaf: false,
    });

    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) =>
      write(scroll, limit),
    );

    // Dev-only handle. Lenis owns the scroll position, so calling
    // window.scrollTo from a console or a test fights it; this exposes the
    // instance so tooling can drive the page the same way the wheel does.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    let frame = requestAnimationFrame(function loop(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    });

    const onResize = () => {
      measure();
      lenis.resize();
    };
    window.addEventListener("resize", onResize);

    // Fonts change section heights after they swap in; re-measure once settled.
    document.fonts?.ready.then(measure).catch(() => {});

    const onPointer = (e: PointerEvent) => {
      stage.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      stage.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Anchor links inside the page should ride Lenis, not jump.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
