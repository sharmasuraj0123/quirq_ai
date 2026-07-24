"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Beat, Marker, Reveal, Rise, TextScrim } from "@/components/ui/primitives";

/** Where the demo counter starts, so it reads as mid-month rather than day one. */
const START = 1_284_930_441;
/** Tokens per second. Deliberately absurd — that is the point being made. */
const RATE = 734_219;

/**
 * Two readouts, one argument. The token meter never stops climbing; the value
 * meter never leaves zero. No amount of copy makes the point as fast.
 */
function TwinMeter() {
  const host = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const inView = useInView(host, { amount: 0.4 });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = count.current;
    if (!el) return;

    if (reduced) {
      el.textContent = START.toLocaleString("en-US");
      return;
    }
    if (!inView) return;

    let raf = 0;
    let total = START;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      total += dt * RATE;
      el.textContent = Math.floor(total).toLocaleString("en-US");
      if (bar.current) {
        // Fills, resets, fills again — a meter that never completes anything.
        const cycle = ((now / 1000) % 2.6) / 2.6;
        bar.current.style.transform = `scaleX(${cycle})`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]);

  return (
    <div
      ref={host}
      className="mt-10 max-w-lg rounded-2xl border border-hair-soft bg-black/45 p-5 backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-center justify-between">
        <span className="label">Tokens consumed</span>
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-spec-red uppercase">
          <span className="pulse-dot !bg-spec-red" />
          Metered
        </span>
      </div>
      <p className="numeric mt-3 font-mono text-[clamp(26px,3.6vw,42px)] font-medium text-ink tabular-nums">
        <span ref={count}>{START.toLocaleString("en-US")}</span>
      </p>
      <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-white/6">
        <span
          ref={bar}
          className="block h-full origin-left rounded-full bg-linear-to-r from-spec-orange to-spec-red"
          style={{ transform: "scaleX(0.35)" }}
        />
      </span>

      <div className="mt-6 border-t border-hair-soft pt-5 opacity-60">
        <span className="label">Business value measured</span>
        <p className="numeric mt-3 font-mono text-[clamp(26px,3.6vw,42px)] font-medium text-faint tabular-nums">
          0
        </p>
        <span className="mt-4 block h-1.5 rounded-full bg-white/6" />
      </div>
    </div>
  );
}

export function Consumption() {
  return (
    <Beat index={1} id="consumption">
      <div className="relative max-w-2xl md:max-w-[60%]">
        <TextScrim />
        <Marker>01 — the meter you have</Marker>

        <h2 className="display over-stage mt-8">
          <Reveal delay={0.05}>Tokens count</Reveal>
          <Reveal delay={0.13}>what the machine</Reveal>
          <Reveal delay={0.21}>
            <span className="text-spec-red">burned.</span>
          </Reveal>
        </h2>

        <Rise delay={0.3}>
          <p className="lede over-stage mt-7">
            The bill climbs whether or not the job got done.
          </p>
        </Rise>

        <TwinMeter />
      </div>
    </Beat>
  );
}
