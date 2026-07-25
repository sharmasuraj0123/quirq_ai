"use client";

import { motion } from "motion/react";
import { Beat, Marker, Reveal, Rise } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";

const EASE = [0.22, 1, 0.36, 1] as const;

const RESOURCE_LANES = [
  {
    label: "Tokens / outcome",
    detail: "less re-reading",
    path: "M2 7 C24 8 36 12 54 13 S82 20 101 21 S120 26 138 27",
    dash: undefined,
  },
  {
    label: "Sessions / outcome",
    detail: "fewer restarts",
    path: "M2 5 C22 7 35 8 50 13 S78 15 94 21 S118 24 138 28",
    dash: "5 4",
  },
  {
    label: "Time / outcome",
    detail: "shorter path to done",
    path: "M2 6 C18 8 36 10 52 12 S76 19 94 20 S118 26 138 27",
    dash: "1 4",
  },
] as const;

const RESET_EARLIER = [
  { label: "Explain", opacity: "opacity-45" },
  { label: "Search", opacity: "opacity-55" },
  { label: "Re-check", opacity: "opacity-70" },
  { label: "Continue", opacity: "opacity-90" },
] as const;

const EFFICIENCY_RATIOS = [
  {
    label: "Outcome / token",
    detail: "more from each token",
  },
  {
    label: "Outcome / session",
    detail: "fewer restarts",
  },
  {
    label: "Outcome / hour",
    detail: "a shorter path",
  },
] as const;

function TrendArrow({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      aria-hidden
    >
      <path
        d={direction === "up" ? "M3 11 11 3m0 0H5m6 0v6" : "M3 5l8 8m0 0H5m6 0V7"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ResourceSparkline({
  path,
  dash,
}: {
  path: string;
  dash?: string;
}) {
  return (
    <svg
      viewBox="0 0 140 34"
      preserveAspectRatio="none"
      className="h-7 w-24 overflow-visible sm:w-28"
      aria-hidden
    >
      <path
        d="M2 17H138"
        fill="none"
        stroke="currentColor"
        strokeWidth=".75"
        strokeOpacity=".13"
        strokeDasharray="2 4"
      />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeOpacity=".72"
        strokeDasharray={dash}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="138" cy="27" r="2.4" fill="currentColor" fillOpacity=".82" />
    </svg>
  );
}

function OutputCurve() {
  return (
    <div className="relative mt-3 h-28 overflow-hidden rounded-xl border border-white/[0.12] bg-black/45 sm:h-32">
      <div
        aria-hidden
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 33.333%, 16.666% 100%",
        }}
      />

      <div className="absolute inset-x-3 top-3 bottom-7 sm:inset-x-4">
        <svg
          viewBox="0 0 440 124"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible text-white"
          aria-hidden
        >
          <defs>
            <linearGradient
              id="outcome-area"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0" stopColor="white" stopOpacity=".2" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 112 C48 108 72 104 100 98 S152 91 182 82 S236 71 268 60 S322 44 354 36 S402 20 440 11 L440 124 L0 124 Z"
            fill="url(#outcome-area)"
          />
          <path
            d="M0 112 C48 108 72 104 100 98 S152 91 182 82 S236 71 268 60 S322 44 354 36 S402 20 440 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.28))",
            }}
          />
          {[
            [100, 98],
            [182, 82],
            [268, 60],
            [354, 36],
            [440, 11],
          ].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle
                cx={cx}
                cy={cy}
                r="5"
                fill="#070707"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle cx={cx} cy={cy} r="1.6" fill="currentColor" />
            </g>
          ))}
        </svg>
      </div>

      <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between font-mono text-[8px] tracking-[0.14em] text-white/50 uppercase sm:inset-x-4 sm:text-[8.5px]">
        <span>Earlier</span>
        <span className="hidden sm:block">Context carries forward</span>
        <span>Now</span>
      </div>
    </div>
  );
}

function ResetLoop() {
  return (
    <div className="border-t border-white/[0.12] bg-black/45 p-4 lg:border-t-0 lg:border-l">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label text-[9px] text-white/75">Repeated work</p>
          <p className="mt-1.5 text-[11px] text-white/65">The reset loop fades.</p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.06] font-mono text-[14px] text-white/70">
          ↻
        </span>
      </div>

      <div className="mt-4">
        <p className="font-mono text-[8.5px] tracking-[0.13em] text-white/50 uppercase">
          Earlier
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {RESET_EARLIER.map((step, index) => (
            <motion.div
              key={step.label}
              className={`flex items-center gap-2 rounded-lg border border-white/[0.11] bg-white/[0.035] px-2.5 py-2 ${step.opacity}`}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: 0.55,
                delay: 0.08 * index,
                ease: EASE,
              }}
            >
              <span className="font-mono text-[8px] text-white/45">
                0{index + 1}
              </span>
              <span className="text-[9.5px] text-white/75">{step.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-white/[0.1] pt-3.5">
        <p className="font-mono text-[8.5px] tracking-[0.13em] text-white/65 uppercase">
          Now
        </p>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/[0.18] bg-white/[0.07] p-3">
          <span className="text-[10.5px] font-medium text-white/90">Continue</span>
          <span aria-hidden className="h-px min-w-3 flex-1 bg-white/25" />
          <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-ink">
            Complete
            <TrendArrow direction="up" />
          </span>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-white/60">
          Finished work becomes a head start, not another reset.
        </p>
      </div>
    </div>
  );
}

/**
 * An indexed directional view rather than a fabricated analytics dashboard.
 * It compares unlike resources in separate lanes and describes only the trend
 * the product is meant to reveal; measured ratios come from connected work.
 */
function OutcomeEvolution() {
  return (
    <div className="mt-7 overflow-hidden rounded-[24px] border border-white/[0.18] bg-black/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_36px_110px_rgba(0,0,0,0.68)] backdrop-blur-xl sm:mt-8">
      <p className="sr-only">
        Illustrative direction. Completed business outcomes rise over time
        while tokens, sessions, elapsed time, and repeated setup per outcome
        fall.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.12] bg-black/45 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.18] bg-white/[0.07] text-white/80">
            <TrendArrow direction="up" />
          </span>
          <span className="font-mono text-[9.5px] tracking-[0.13em] text-white/85 uppercase">
            Outcome efficiency over time
          </span>
        </div>
        <span className="rounded-full border border-white/[0.12] bg-white/[0.045] px-2.5 py-1.5 font-mono text-[8.5px] tracking-[0.11em] text-white/60 uppercase">
          Illustrative trend
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_210px]">
        <div className="bg-black/30 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label text-[9px] text-white/70">
                Business outcomes completed
              </p>
              <p className="mt-1.5 text-[12px] text-white/75">
                More useful work gets finished.
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.055] px-2.5 py-1.5 font-mono text-[8.5px] tracking-[0.1em] text-white/75 uppercase">
              <TrendArrow direction="up" />
              Climbing
            </span>
          </div>

          <OutputCurve />

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="font-mono text-[8.5px] tracking-[0.12em] text-white/50 uppercase">
                Effort for each outcome
              </p>
              <span className="font-mono text-[8px] tracking-[0.1em] text-white/45 uppercase">
                Trending down
              </span>
            </div>

            {RESOURCE_LANES.map((lane, index) => (
              <motion.div
                key={lane.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.1] bg-white/[0.025] px-3 py-2"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.65 }}
                transition={{
                  duration: 0.55,
                  delay: 0.12 + index * 0.1,
                  ease: EASE,
                }}
              >
                <div className="min-w-0">
                  <p className="truncate text-[10.5px] font-medium text-white/85">
                    {lane.label}
                  </p>
                  <p className="mt-0.5 text-[9px] text-white/50">{lane.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-white/70">
                  <ResourceSparkline path={lane.path} dash={lane.dash} />
                  <TrendArrow direction="down" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <ResetLoop />
      </div>

      <div className="grid grid-cols-1 gap-px border-t border-white/[0.12] bg-white/[0.07] sm:grid-cols-3">
        {EFFICIENCY_RATIOS.map((ratio, index) => (
          <motion.div
            key={ratio.label}
            className="flex min-w-0 items-center justify-between gap-4 bg-black/60 px-4 py-3 sm:block sm:px-5 sm:py-3.5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 0.55, delay: 0.35 + index * 0.1 }}
          >
            <div className="flex items-center gap-1.5 text-white/85">
              <p className="font-mono text-[8.5px] tracking-[0.08em] uppercase sm:truncate sm:text-[9px]">
                {ratio.label}
              </p>
              <TrendArrow direction="up" />
            </div>
            <p className="text-right text-[9px] leading-snug text-white/55 sm:mt-1 sm:text-left sm:text-[10px]">
              {ratio.detail}
            </p>
          </motion.div>
        ))}
      </div>

    </div>
  );
}

export function Delivery() {
  return (
    <Beat index={2} id="delivery">
      <div className="relative max-w-4xl md:ml-auto md:max-w-[70%]">
        <div className="relative">
          <GlassPool>
            <Marker>02 · outcomes over effort</Marker>

            <h2 className="display-sm over-stage mt-8">
              <Reveal delay={0.05}>More output.</Reveal>
              <Reveal delay={0.13}>
                Less <GlassText>starting over.</GlassText>
              </Reveal>
            </h2>

            <Rise delay={0.26}>
              <p className="lede over-stage mt-5 max-w-[50ch] font-medium !text-ink/95 sm:mt-7">
                Compare every business outcome with the tokens, sessions, and
                time behind it. See output grow while less effort is lost
                starting over.
              </p>
            </Rise>
          </GlassPool>
        </div>

        <Rise delay={0.34}>
          <OutcomeEvolution />
        </Rise>
      </div>
    </Beat>
  );
}
