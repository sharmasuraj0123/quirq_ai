"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { LIGHT } from "@/lib/lighting";

export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A full-height movement of the page. `data-beat` is what the scroll runtime
 * measures to drive the 3D, so the index here and the keyframe index there are
 * the same thing.
 */
export function Beat({
  index,
  id,
  children,
  className,
}: {
  index: number;
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-beat={index}
      className={cn(
        "relative flex min-h-svh w-full items-center overflow-hidden pt-24 pb-20",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        {children}
      </div>
    </section>
  );
}

/**
 * Type that rises out of a clipping mask. The mask is what makes it read as
 * printing rather than fading: nothing is visible above the line until it moves.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  // Watch the mask, not the thing being masked. The inner span starts pushed
  // 115% down, so it is fully clipped by this wrapper's `overflow-hidden`;
  // observing it directly would mean it never intersects, and so never reveals.
  const mask = useRef<HTMLSpanElement>(null);
  const inView = useInView(mask, { once: true, amount: 0.3 });

  // No useReducedMotion branch: it is null during SSR, so branching initial
  // desyncs server HTML from a reduced-motion client and the y offset never
  // clears. MotionConfig reducedMotion="user" snaps the transform instead.
  return (
    <span ref={mask} className={cn("block overflow-hidden", className)}>
      <motion.span
        className="block will-change-transform"
        initial={{ y: "115%", opacity: 0 }}
        animate={inView ? { y: "0%", opacity: 1 } : undefined}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** A softer entrance for things that shouldn't slide: panels, figures. */
export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 26, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.05, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The eclipse: a soft elliptical pool of shadow behind a block of copy.
 *
 * The glass and its bloom move with the scroll, so at some widths they land
 * directly under the text. Rather than choreographing around every breakpoint,
 * each text block carries its own falloff: legible at any size, and invisible
 * against the black everywhere else.
 *
 * The box is oversized because the gradient's radii are percentages of the box
 * and must stay at or under 50% to reach transparent before the edge. Larger
 * radii get clipped while still opaque, which shows up as a hard rectangular
 * seam over a bright background.
 *
 * The overshoot scales with the block (so a headline's pool is grander than a
 * caption's) with pixel floors so one-line labels still get enough falloff
 * room for the gradient to fade before its edge.
 */
export function TextScrim({
  className,
  ref,
}: {
  className?: string;
  /** For callers that carve into the pool at runtime (the hero's i-dot
      aperture masks a hole out of its scrim). */
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-x-[max(72px,16%)] -inset-y-[max(56px,32%)] -z-10",
        className,
      )}
      style={{ background: LIGHT.scrimGradient }}
    />
  );
}

/** Chapter marker: spectrum chip, mono label, spectrum rule. */
export function Marker({ children }: { children: ReactNode }) {
  return (
    <Rise className="flex items-center gap-3">
      <span
        className="h-2.5 w-2.5 rounded-[3px]"
        style={{ background: "var(--spectrum)" }}
      />
      <span className="label">{children}</span>
      <span className="spectrum-rule h-px w-12 opacity-70" />
    </Rise>
  );
}

export function ActionLink({
  href,
  children,
  tone = "solid",
  newTab = false,
  className,
}: {
  href: string;
  children: ReactNode;
  tone?: "solid" | "ghost";
  newTab?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 font-mono text-[11.5px] uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5",
        tone === "solid"
          ? "bg-ink text-void hover:opacity-90"
          : // Sits over the live bloom, so it carries its own scrim.
            "border border-hair bg-black/40 text-ink/85 backdrop-blur-md hover:border-ink/30 hover:text-ink",
        className,
      )}
    >
      {children}
      <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-0.5"
      >
        <path
          d="M2 10L10 2M10 2H4M10 2V8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {newTab && <span className="sr-only">(opens in a new tab)</span>}
    </a>
  );
}

/** The quirq mark, from the brand favicon path. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 132" className={className} aria-hidden fill="currentColor">
      <path d="M50 0A50 50 0 0 1 100 50V118A14 14 0 0 1 86 132A14 14 0 0 1 72 118V94.87A50 50 0 1 1 50 0ZM50 33A17 17 0 1 0 50 67A17 17 0 1 0 50 33Z" />
    </svg>
  );
}
