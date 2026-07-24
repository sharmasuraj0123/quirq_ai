"use client";

import { motion, useReducedMotion } from "motion/react";
import { ActionLink, Beat } from "@/components/ui/primitives";
import { LIGHT } from "@/lib/lighting";

const LETTERS = ["q", "u", "i", "r", "q"];
const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <Beat index={0} id="hero">
      {/* Scrim: pulls the centre of the bloom down so the wordmark keeps its
          contrast, without dimming the rays that fan past it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: LIGHT.heroVeil }}
      />
      <div className="over-stage relative flex flex-col items-center text-center">
        <motion.p
          className="label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 1 }}
        >
          One workspace · many runtimes
        </motion.p>

        <h1 className="mt-7 flex flex-col items-center">
          <span className="sr-only">
            quirq — watch the work, not the meter.
          </span>

          {/* The wordmark resolves out of the light rather than sliding in:
              each letter arrives from blur, like the beam coming into focus. */}
          <span
            aria-hidden
            className="flex font-mark text-[clamp(72px,15.5vw,204px)] leading-[0.86] font-semibold tracking-[-0.03em]"
          >
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={
                  reduced
                    ? { opacity: 0 }
                    : { opacity: 0, y: "30%", filter: "blur(20px)" }
                }
                animate={
                  reduced
                    ? { opacity: 1 }
                    : { opacity: 1, y: "0%", filter: "blur(0px)" }
                }
                transition={{ delay: 0.2 + i * 0.075, duration: 1.25, ease: EASE }}
              >
                {letter}
              </motion.span>
            ))}
          </span>

          <motion.span
            aria-hidden
            className="display-sm mt-4 max-w-[18ch] sm:mt-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 1.1, ease: EASE }}
          >
            Watch the <span className="spectrum-text">work</span>, not the meter.
          </motion.span>
        </h1>

        <motion.div
          className="mt-11 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 1, ease: EASE }}
        >
          <ActionLink href="mailto:suraj@xo.builders?subject=quirq%20early%20access">
            Get early access
          </ActionLink>
          <ActionLink href="/quirq-whitepaper.pdf" tone="ghost" newTab>
            Read the whitepaper
          </ActionLink>
        </motion.div>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-9 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="font-mono text-[9.5px] tracking-[0.3em] text-faint uppercase">
          Scroll
        </span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 block h-1/2 bg-linear-to-b from-transparent to-ink/70"
            animate={reduced ? {} : { y: ["-100%", "200%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </Beat>
  );
}
