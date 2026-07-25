"use client";

import { motion } from "motion/react";
import { Beat, cn, Reveal, Rise } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";

const EASE = [0.22, 1, 0.36, 1] as const;

const IMPACT_OUTCOMES = [
  {
    icon: "outcome",
    label: "Outcome-based tracking",
    detail: "See what reached done and why it mattered.",
    surface: "bg-black/[0.66]",
    lens: "border-white/[0.2] bg-white/[0.08] text-white/90",
    sheen: "opacity-35",
  },
  {
    icon: "collaboration",
    label: "Smoother collaboration",
    detail: "Keep everyone aligned without another status reset.",
    surface: "bg-black/[0.61]",
    lens: "border-white/[0.22] bg-white/[0.1] text-white/90",
    sheen: "opacity-45",
  },
  {
    icon: "infrastructure",
    label: "Less infrastructure work",
    detail: "Spend more time delivering, less time maintaining tools.",
    surface: "bg-black/[0.56]",
    lens: "border-white/[0.24] bg-white/[0.12] text-white/90",
    sheen: "opacity-55",
  },
  {
    icon: "decisions",
    label: "Faster decisions",
    detail: "Spot blockers early and move with confidence.",
    surface: "bg-black/[0.51]",
    lens: "border-white/[0.26] bg-white/[0.14] text-white/95",
    sheen: "opacity-70",
  },
] as const;

const TEAM_GAINS = [
  {
    label: "Focus",
    glass: "bg-white/[0.07] text-white/80",
  },
  {
    label: "Time",
    glass: "bg-white/[0.09] text-white/85",
  },
  {
    label: "Confidence",
    glass: "bg-white/[0.12] text-white/90",
  },
];

const BUSINESS_RESULTS = [
  {
    label: "Time returned",
    detail: "Less setup and rework",
    glass: "bg-black/[0.64]",
  },
  {
    label: "Better alignment",
    detail: "Fewer status resets",
    glass: "bg-black/[0.58]",
  },
  {
    label: "Clear proof",
    detail: "Know what created value",
    glass: "bg-black/[0.52]",
  },
];

function CheckMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      aria-hidden
    >
      <path
        d="m3.25 8.25 3 3 6.5-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 22 12"
      className="h-3 w-5"
      fill="none"
      aria-hidden
    >
      <path
        d="M1 6h18m-4-4 4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImpactIcon({
  kind,
}: {
  kind: (typeof IMPACT_OUTCOMES)[number]["icon"];
}) {
  if (kind === "outcome") {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="6.5" stroke="currentColor" />
        <path
          d="m6.8 10.1 2.1 2.1 4.5-5"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "collaboration") {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="m6.2 7.2 3.8 5.7 3.8-5.7M7.3 5.5h5.4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="5" cy="5.5" r="2" stroke="currentColor" />
        <circle cx="15" cy="5.5" r="2" stroke="currentColor" />
        <circle cx="10" cy="14.5" r="2" stroke="currentColor" />
      </svg>
    );
  }

  if (kind === "infrastructure") {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M3.5 5h8M3.5 9h6M3.5 13h5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M14 6.5v7m-2.4-2.3L14 13.6l2.4-2.4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 5h4.2c2.4 0 2.6 2.6 2.6 5s.2 5 2.6 5H16M13.5 12.5 16 15l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="4" cy="5" r="1.6" stroke="currentColor" />
      <path
        d="m13 5 1.3 1.3L17 3.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlassMarker() {
  return (
    <Rise className="flex items-center gap-3">
      <span className="relative h-2.5 w-2.5 overflow-hidden rounded-[3px] border border-white/25 bg-white/[0.06] backdrop-blur-md backdrop-saturate-150">
        <span
          aria-hidden
          className="absolute inset-[2px] rounded-[1px] bg-white/45 shadow-[0_0_8px_rgba(255,255,255,0.32)]"
        />
      </span>
      <span className="label">01 · the business impact</span>
      <span className="h-px w-12 bg-linear-to-r from-white/55 to-transparent opacity-70" />
    </Rise>
  );
}

/**
 * A neutral refractive band behind the content. The curved panes bend the
 * stage light without filtering the text itself, which keeps the effect clear
 * and inexpensive on smaller screens.
 */
function WarpField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <span className="absolute -top-[40%] left-[28%] hidden h-[180%] w-[24%] -rotate-6 rounded-[48%] border-x border-white/[0.13] bg-white/[0.025] shadow-[inset_18px_0_28px_rgba(255,255,255,0.035),inset_-18px_0_30px_rgba(0,0,0,0.24)] backdrop-blur-[7px] backdrop-brightness-110 sm:block" />
      <span className="absolute top-[18%] -right-[14%] h-[52%] w-[38%] rounded-[50%] border border-white/[0.1] bg-white/[0.018] shadow-[inset_0_1px_0_rgba(255,255,255,0.13)] sm:backdrop-blur-[5px] sm:backdrop-brightness-105" />
      <span className="absolute inset-x-[-8%] top-[56%] h-px -rotate-2 bg-linear-to-r from-transparent via-white/20 to-transparent blur-[0.4px]" />
    </div>
  );
}

/**
 * A business-impact view: connected work makes outcomes easier to track,
 * collaboration smoother, infrastructure lighter, and decisions faster. The
 * 10x figure is deliberately labelled as an ambition rather than a customer
 * benchmark.
 */
function BusinessImpactView() {
  return (
    <div className="relative isolate mt-7 overflow-hidden rounded-[24px] border border-white/[0.2] bg-black/[0.82] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_36px_110px_rgba(0,0,0,0.72)] backdrop-blur-xl backdrop-brightness-75 backdrop-saturate-[0.7] sm:mt-9 sm:bg-black/[0.72] sm:backdrop-blur-[24px]">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-white/[0.1] via-transparent to-black/[0.14] opacity-70"
      />
      <WarpField />
      <p className="sr-only">
        An illustrative business-impact view. Outcome-based tracking, smoother
        collaboration, less infrastructure work, and faster decisions help
        teams spend more time delivering. Quirq is designed to help teams reach
        an up-to-ten-times faster path to shipped work.
      </p>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.15] bg-black/[0.48] px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-white/[0.24] bg-white/[0.075] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-lg backdrop-brightness-125">
            <CheckMark />
            <span className="absolute inset-x-1 top-0 h-px bg-white/70 blur-[1px]" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/90 uppercase">
            A clearer path to shipped
          </span>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-white/[0.16] bg-white/[0.07] px-2.5 py-1.5 font-mono text-[9px] tracking-[0.14em] text-white/85 uppercase">
          <span className="relative h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_9px_rgba(255,255,255,0.65)]">
            <span className="absolute -inset-1 rounded-full border border-white/15" />
          </span>
          Less operational drag
        </span>
      </div>

      <div className="relative z-10 grid md:grid-cols-[minmax(170px,0.72fr)_minmax(0,1.65fr)]">
        <motion.div
          className="relative overflow-hidden border-b border-white/[0.15] bg-black/[0.6] p-5 sm:p-6 md:border-r md:border-b-0"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div
            aria-hidden
            className="absolute -top-20 -left-16 h-44 w-44 rounded-full bg-white/[0.075] blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b from-black/[0.04] via-black/18 to-black/38"
          />
          <p className="label relative text-[9.5px] text-white/75">
            Delivery ambition
          </p>
          <div className="relative mt-3 flex items-start gap-2">
            <span className="mt-2 font-mono text-[9.5px] tracking-[0.14em] text-white/65 uppercase">
              up to
            </span>
            <span className="font-mark text-[clamp(58px,7vw,92px)] font-semibold leading-[0.88] tracking-[-0.075em] text-ink drop-shadow-[0_8px_28px_rgba(0,0,0,0.55)]">
              10×
            </span>
          </div>
          <p className="relative mt-3 max-w-[17ch] text-[15px] font-medium leading-snug text-ink">
            faster path to shipped work
          </p>
          <p className="relative mt-3 max-w-[28ch] text-[11.5px] leading-relaxed text-white/75">
            Less rebuilding the story. More time moving the work forward.
          </p>
          <p className="relative mt-5 font-mono text-[9px] leading-relaxed tracking-[0.06em] text-white/55">
            Illustrative workflow target. Results depend on the team and the
            work.
          </p>
        </motion.div>

        <div className="relative bg-black/[0.42] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="label text-[9.5px] text-white/75">
                One shared business view
              </p>
              <p className="mt-1.5 text-[11.5px] text-white/75">
                What improves when work stays connected.
              </p>
            </div>
            <span className="hidden rounded-full border border-white/[0.15] bg-white/[0.07] px-2.5 py-1.5 font-mono text-[9px] tracking-[0.1em] text-white/75 uppercase sm:block">
              Impact, not activity
            </span>
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {IMPACT_OUTCOMES.map((outcome, index) => (
              <motion.div
                key={outcome.label}
                className={cn(
                  "relative min-w-0 overflow-hidden rounded-xl border border-white/[0.15] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-2.5 sm:py-3",
                  outcome.surface,
                )}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{
                  duration: 0.65,
                  delay: 0.12 + index * 0.12,
                  ease: EASE,
                }}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 top-0 h-px bg-linear-to-r from-transparent via-white/65 to-transparent",
                    outcome.sheen,
                  )}
                />
                <div className="relative flex items-center">
                  <span
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
                      outcome.lens,
                    )}
                  >
                    <ImpactIcon kind={outcome.icon} />
                    <span
                      aria-hidden
                      className="absolute -top-2 left-1/2 h-3 w-5 -translate-x-1/2 rounded-full bg-white/20 blur-md"
                    />
                  </span>
                </div>
                <p className="mt-3 min-h-[2.35em] text-[10.5px] font-medium leading-[1.18] text-ink sm:text-[11px]">
                  {outcome.label}
                </p>
                <p className="mt-1 min-h-[3.4em] text-[9.5px] leading-[1.28] text-white/70">
                  {outcome.detail}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-3 flex flex-col gap-3 rounded-xl border border-white/[0.16] bg-black/50 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:flex-row sm:items-center sm:justify-between"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.65 }}
            transition={{ duration: 0.75, delay: 0.46 }}
          >
            <div className="min-w-0">
              <p className="font-mono text-[9px] tracking-[0.13em] text-white/80 uppercase">
                What the team gets back
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TEAM_GAINS.map((item) => (
                  <span
                    key={item.label}
                    className={cn(
                      "rounded-full border border-white/[0.16] px-2 py-1 font-mono text-[9px] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]",
                      item.glass,
                    )}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <span
                aria-hidden
                className="hidden text-white/45 drop-shadow-[0_0_6px_rgba(255,255,255,0.25)] sm:block"
              >
                <Arrow />
              </span>
              <span className="flex items-center gap-2 rounded-full border border-white/[0.22] bg-white/[0.09] px-3 py-2 font-mono text-[9px] tracking-[0.09em] text-white/90 uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <span className="flex -space-x-1">
                  <span className="h-3.5 w-3.5 rounded-full border border-black/60 bg-white/20 backdrop-blur-[2px]" />
                  <span className="h-3.5 w-3.5 rounded-full border border-black/60 bg-white/40 backdrop-blur-[5px]" />
                  <span className="h-3.5 w-3.5 rounded-full border border-black/60 bg-white/65 backdrop-blur-[9px]" />
                </span>
                More work reaches done
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-px border-t border-white/[0.15] bg-white/[0.07]">
        {BUSINESS_RESULTS.map((outcome) => (
          <div
            key={outcome.label}
            className={cn(
              "min-w-0 px-2.5 py-3 sm:px-5",
              outcome.glass,
            )}
          >
            <p className="min-h-[2.2em] font-mono text-[8.5px] leading-[1.15] tracking-[0.08em] text-white/85 uppercase sm:min-h-0 sm:text-[9.5px]">
              {outcome.label}
            </p>
            <p className="mt-1 text-[9px] leading-snug text-white/70 sm:text-[10.5px]">
              {outcome.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BusinessImpact() {
  return (
    <Beat index={1} id="consumption">
      <div className="relative max-w-4xl md:max-w-[76%]">
        <div className="relative">
          <GlassPool>
            <GlassMarker />

            <h2 className="display-sm over-stage mt-8">
              <Reveal delay={0.05}>See the work.</Reveal>
              <Reveal delay={0.13}>
                Ship it <GlassText>sooner.</GlassText>
              </Reveal>
            </h2>

            <Rise delay={0.24}>
              <p className="lede over-stage mt-5 max-w-[50ch] sm:mt-7">
                Give every initiative a clear outcome, shared context, and
                visible progress. Teams stay aligned, spend less time
                rebuilding infrastructure, and move valuable work to done with
                fewer delays.
              </p>
            </Rise>
          </GlassPool>
        </div>

        <Rise delay={0.32}>
          <BusinessImpactView />
        </Rise>
      </div>
    </Beat>
  );
}
