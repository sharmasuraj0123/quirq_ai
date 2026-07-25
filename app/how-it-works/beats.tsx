"use client";

import { ActionLink, Beat, Marker, Reveal, Rise, TextScrim, cn } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";

/**
 * The page that documents the machine rendering it. Five beats on the same
 * KEYFRAMES track as every other stage page:
 *   0 centred hero · 1 drained monochrome (the current pipeline) ·
 *   2 spectrum floods back (the math) · 3 recedes upstage (the plan) ·
 *   4 returns centre (what the tree unlocks).
 */

/* 0 · the premise. */
export function HowHero() {
  return (
    <Beat index={0} id="how-hero">
      <div className="over-stage relative flex flex-col items-center text-center">
        <GlassPool>
          <Rise>
            <p className="label">Engineering · the scroll stage</p>
          </Rise>

          <h1 className="display mt-7 max-w-[16ch]">
            <Reveal delay={0.1}>One scene,</Reveal>
            <Reveal delay={0.18}>
              <GlassText>many stories</GlassText>.
            </Reveal>
          </h1>

          <Rise delay={0.3}>
            <p className="lede mx-auto mt-7 text-center">
              This page is rendered by the system it describes: the same glass,
              the same five keyframes as the home page, with different
              components standing in front of the light.
            </p>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}

const PIPELINE = [
  {
    title: "Measure.",
    note: "Every section carrying data-beat={n} has its centre measured into a sorted array; re-measured on resize and after webfonts swap.",
  },
  {
    title: "Map.",
    note: "The viewport's centre line lands between two section centres and becomes a fractional beat: 2.37 means 37% of the way from beat 2 to beat 3.",
  },
  {
    title: "Sample.",
    note: "The two bracketing keyframes are blended, all 14 channels: position, tilt, spin rate, chromatic aberration, thickness, roughness, burst.",
  },
  {
    title: "Damp.",
    note: "Every channel eases toward its target each GL frame. React renders nothing at 60fps; the scroll value lives in a plain module object.",
  },
];

/* 1 · the current setup, over the drained glass. */
export function HowPipeline() {
  return (
    <Beat index={1} id="how-pipeline">
      <div className="relative max-w-2xl md:max-w-[60%]">
        <TextScrim />
        <Marker>01 · the setup today</Marker>

        <h2 className="display over-stage mt-8">
          <Reveal delay={0.05}>Scroll in,</Reveal>
          <Reveal delay={0.13}>numbers out.</Reveal>
        </h2>

        <Rise delay={0.28}>
          <p className="lede over-stage mt-7">
            Not a linked list, and nothing loads on scroll: one flat keyframe
            track, indexed by the sections in front of it.
          </p>
        </Rise>

        <div className="mt-9">
          {PIPELINE.map((step, i) => (
            <Rise key={step.title} delay={0.32 + i * 0.07}>
              <div className="flex gap-5 border-t border-hair py-4.5 sm:gap-7">
                <span className="font-mono text-[11px] text-faint">
                  0{i + 1}
                </span>
                <div>
                  <p className="over-stage text-[15.5px] font-medium text-ink">
                    {step.title}
                  </p>
                  <p className="over-stage mt-1 text-[13.5px] leading-relaxed text-dim">
                    {step.note}
                  </p>
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </Beat>
  );
}

const FORMULAS = [
  {
    label: "Map",
    formula: "beat = i + (eye - c[i]) / (c[i+1] - c[i])",
    note: "eye = scroll + viewport/2; c[] holds the measured section centres.",
  },
  {
    label: "Ease",
    formula: "smooth(t) = t * t * (3 - 2t)",
    note: "a smoothstep on the fraction, so beats settle instead of arriving linearly.",
  },
  {
    label: "Damp",
    formula: "x += (k - x) * (1 - e^(-λ·dt))",
    note: "frame-rate independent; λ = 3.2, or 400 under reduced motion, which is a snap.",
  },
];

/* 2 · the math, as the spectrum floods back. */
export function HowMath() {
  return (
    <Beat index={2} id="how-math">
      <div className="relative max-w-2xl md:ml-auto md:max-w-[62%]">
        <GlassPool>
          <Marker>02 · the math</Marker>

          <h2 className="display over-stage mt-8">
            <Reveal delay={0.05}>The whole shot is</Reveal>
            <Reveal delay={0.13}>
              <GlassText>three lines.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.26}>
            <p className="lede over-stage mt-7 max-w-[44ch]">
              Lenis smooths the wheel; these three functions turn the smoothed
              scroll into everything the glass does.
            </p>
          </Rise>

          <Rise delay={0.34} className="mt-9">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-hair bg-white/6 backdrop-blur-xl">
              {FORMULAS.map((f) => (
                <div key={f.label} className="bg-black/55 px-5 py-4.5 sm:px-6">
                  <p className="label text-[9.5px]">{f.label}</p>
                  <p className="numeric mt-2 font-mono text-[clamp(12.5px,1.5vw,15px)] text-ink/90">
                    {f.formula}
                  </p>
                  <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-faint">
                    {f.note}
                  </p>
                </div>
              ))}
            </div>
          </Rise>

          <Rise delay={0.42} className="relative mt-5">
            <p className="over-stage font-mono text-[10.5px] leading-relaxed text-dim">
              The damping is the safety net: wherever the target jumps, the
              live values glide. It is why fast scrolling feels like a camera
              move, and why swapping the track out from under the form is safe.
            </p>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}

const PHASES = [
  {
    phase: "·",
    name: "Content extraction",
    note: "StagePage shell + swappable beats. This page and /what-is-quirq are the proof.",
    status: "done" as const,
  },
  {
    phase: "0",
    name: "Golden harness",
    note: "Snapshot the scroll-to-beat mapping so every later refactor is provably a no-op.",
    status: "next" as const,
  },
  {
    phase: "1",
    name: "Track-agnostic sampler",
    note: "sampleKeyframes(track, beat): the track becomes an argument instead of a global.",
    status: "planned" as const,
  },
  {
    phase: "2",
    name: "Id registry",
    note: "Sections register by id instead of data-beat integers; numbering stops being load-bearing.",
    status: "planned" as const,
  },
  {
    phase: "3",
    name: "Tree resolver",
    note: "Choreography as a tree; filter branches, flatten to leaves, merge cascades, measure.",
    status: "planned" as const,
  },
  {
    phase: "4",
    name: "Cascade + branches",
    note: "Partial keyframes that inherit, predicates per node, nested sub-beat spans.",
    status: "planned" as const,
  },
];

const STATUS_STYLE = {
  done: "text-spec-green bg-spec-green/10",
  next: "text-spec-cyan bg-spec-cyan/10",
  planned: "text-dim bg-white/5",
};

/* 3 · the migration plan, while the form recedes upstage. */
export function HowPlan() {
  return (
    <Beat index={3} id="how-plan">
      <div className="relative max-w-2xl">
        <TextScrim />
        <Marker>03 · the migration</Marker>

        <h2 className="display-sm over-stage mt-7">
          <Reveal delay={0.05}>Each phase ships,</Reveal>
          <Reveal delay={0.13}>pixels unchanged.</Reveal>
        </h2>
      </div>

      <Rise delay={0.24} className="mt-9">
        <div className="overflow-hidden rounded-2xl border border-hair bg-black/50 backdrop-blur-xl">
          {PHASES.map((p, i) => (
            <div
              key={p.name}
              className={cn(
                "flex items-start gap-4 px-5 py-4 sm:gap-6 sm:px-6",
                i > 0 && "border-t border-hair-soft",
              )}
            >
              <span className="w-4 shrink-0 pt-0.5 text-center font-mono text-[11px] text-faint">
                {p.phase}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-medium text-ink">{p.name}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-dim">
                  {p.note}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 font-mono text-[9.5px] tracking-[0.08em] uppercase",
                  STATUS_STYLE[p.status],
                )}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </Rise>

      <Rise delay={0.32} className="relative mt-5 max-w-[62ch]">
        <TextScrim />
        <p className="relative font-mono text-[10.5px] leading-relaxed text-dim">
          The full proposal, risks and all, lives in the repo at
          docs/animation.md. A page may use fewer beats than the track has,
          never more; that is exactly the ceiling the tree lifts.
        </p>
      </Rise>
    </Beat>
  );
}

/* 4 · the payoff, returned to centre and fully lit. */
export function HowTree() {
  return (
    <Beat index={4} id="how-tree">
      <div className="over-stage relative flex flex-col items-center text-center">
        <GlassPool scrimClassName="mx-auto max-w-3xl">
          <h2 className="display mx-auto max-w-[15ch]">
            <Reveal delay={0.05}>From a list</Reveal>
            <Reveal delay={0.13}>
              <GlassText>to a tree.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.24}>
            <p className="lede mx-auto mt-7 text-center">
              Sub-beats inside a beat, branches per route or viewport, sections
              that register themselves at runtime, keyframes that inherit.
              Three pages share one scene today; the tree makes it any number.
            </p>
          </Rise>

          <Rise
            delay={0.34}
            className="mt-11 flex flex-wrap items-center justify-center gap-3"
          >
            <ActionLink href="/what-is-quirq">See the first swap</ActionLink>
            <ActionLink href="/" tone="ghost">
              Back to the story
            </ActionLink>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}
