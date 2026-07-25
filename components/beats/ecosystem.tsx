"use client";

import { motion } from "motion/react";
import { Rise, TextScrim } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";

/**
 * What quirq runs on, taken from the seed deck's architecture slide.
 *
 * These are integrations and supported runtimes: deliberately NOT presented as
 * customers, because there aren't any to name yet. When there are, swap this
 * array for the logos and change the label above it; nothing else needs to move.
 *
 * Keep the count at 12. It divides exactly by the 2 / 3 / 6 column counts below,
 * so the lattice is always a perfect rectangle with no ragged final row.
 */
const ECOSYSTEM = [
  "Claude Code",
  "Codex",
  "Hermes",
  "OpenClaw",
  "Devin",
  "n8n",
  "OpenRouter",
  "Ollama",
  "vLLM",
  "AWS",
  "GCP",
  "Nvidia",
];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The shelf directly under the hero.
 *
 * A fixed lattice rather than a marquee: every cell is the same size, the
 * hairlines line up on both axes, and nothing is ever caught mid-slide or
 * clipped by an edge. The motion is a single stagger across the grid, so the
 * geometry never moves once it has landed.
 *
 * Not a beat: it carries no `data-beat`, so the scroll runtime ignores it and
 * the glass simply keeps travelling from the hero keyframe toward beat 1.
 */
export function Ecosystem() {
  return (
    <section
      id="ecosystem"
      aria-label="Runtimes, models and clouds quirq runs on"
      className="relative py-16 sm:py-20"
    >
      {/* No full-width band here any more: each text line carries its own
          eclipse pool (TextScrim), and the lattice cells are near-black
          themselves, so the glass stays visible between the elements instead
          of being sliced by a horizontal gradient. */}
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <Rise className="relative mx-auto w-fit">
          <TextScrim />
          <p className="label over-stage mb-9 text-center">Runs on what you already run</p>
        </Rise>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hair-soft bg-white/6 md:grid-cols-4 lg:grid-cols-6">
          {ECOSYSTEM.map((name, i) => (
            <motion.div
              key={name}
              className="group flex h-[68px] items-center justify-center bg-black/85 px-3 backdrop-blur-xl transition-colors duration-300 hover:bg-white/[0.04] sm:h-[76px]"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: i * 0.045, ease: EASE }}
            >
              <span className="text-center font-mark text-[15px] font-medium text-dim transition-colors duration-300 group-hover:text-ink sm:text-[16px]">
                {name}
              </span>
            </motion.div>
          ))}
        </div>

        <Rise delay={0.12} className="relative mx-auto mt-9 w-fit">
          <GlassPool>
            <p className="over-stage text-center font-mono text-[10.5px] tracking-[0.14em] text-faint uppercase">
              Any model · any cloud · any hardware ·{" "}
              <GlassText className="whitespace-nowrap">one ledger</GlassText>
            </p>
          </GlassPool>
        </Rise>
      </div>
    </section>
  );
}
