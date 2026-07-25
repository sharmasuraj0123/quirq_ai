"use client";

import { motion } from "motion/react";
import { Beat, Marker, Reveal, Rise } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The mint rule from the whitepaper, §3.2: the whole product in five glyphs. */
const RULE = [
  { glyph: "Q", label: "minted\nvalue", accent: true },
  { glyph: "=", label: "", operator: true },
  { glyph: "V", label: "verified\ncompletion" },
  { glyph: "×", label: "", operator: true },
  { glyph: "B", label: "human\nbudget" },
];

function MintRule() {
  return (
    <div className="over-stage mt-14 flex flex-wrap items-start gap-x-5 gap-y-6 sm:gap-x-8">
      {RULE.map((part, i) => (
        <motion.div
          key={i}
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 24, scale: 0.86 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          // Operators land after the terms they join, so the equation assembles.
          transition={{
            duration: 0.85,
            delay: (part.operator ? 0.45 : 0) + i * 0.11,
            ease: EASE,
          }}
        >
          {part.accent ? (
            <GlassText className="font-mark text-[clamp(52px,7vw,92px)] leading-none font-semibold">
              {part.glyph}
            </GlassText>
          ) : (
            <span
              className={[
                "font-mark leading-none font-semibold",
                part.operator
                  ? "text-[clamp(28px,3.4vw,44px)] text-faint"
                  : "text-[clamp(52px,7vw,92px)] text-ink",
              ].join(" ")}
            >
              {part.glyph}
            </span>
          )}
          {part.label && (
            <span className="mt-4 text-center font-mono text-[9.5px] leading-relaxed tracking-[0.16em] whitespace-pre-line text-dim uppercase">
              {part.label}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function Delivery() {
  return (
    <Beat index={2} id="delivery">
      <div className="relative max-w-2xl md:ml-auto md:max-w-[60%]">
        <GlassPool>
          <Marker>02 · the meter that was missing</Marker>

          <h2 className="display over-stage mt-8">
            <Reveal delay={0.05}>Quirqs count</Reveal>
            <Reveal delay={0.13}>what it</Reveal>
            <Reveal delay={0.21}>
              <GlassText>delivered.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.3}>
            <p className="lede over-stage mt-7 max-w-[42ch]">
              A human budgets the outcome. The workspace verifies it against
              captured state, then mints the value. Never self-reported.
            </p>
          </Rise>

          <MintRule />
        </GlassPool>
      </div>
    </Beat>
  );
}
