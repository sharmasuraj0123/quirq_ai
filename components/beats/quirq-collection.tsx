"use client";

import { useEffect } from "react";
import {
  Beat,
  Marker,
  Reveal,
  Rise,
  TextScrim,
  cn,
} from "@/components/ui/primitives";
import { GlassText } from "@/components/ui/glass";
import { stage } from "@/lib/stage-store";

type SignalKind = "positive" | "partial" | "negative";

const SIGNALS = [
  {
    kind: "positive",
    label: "Goal reached",
    detail: "reinforce",
  },
  {
    kind: "partial",
    label: "Partly reached",
    detail: "inspect",
  },
  {
    kind: "negative",
    label: "Goal missed",
    detail: "correct",
  },
] satisfies readonly {
  kind: SignalKind;
  label: string;
  detail: string;
}[];

const LEARNING_EFFECTS = [
  {
    marker: "Positive outcome",
    heading: "See what to repeat.",
    copy: "Verified wins reinforce the decisions that reliably moved work to done.",
  },
  {
    marker: "Corrective outcome",
    heading: "See what to change.",
    copy: "Misses, partial results, and intervention expose the paths that wasted effort.",
  },
  {
    marker: "RL feedback",
    heading: "Improve the next policy.",
    copy: "Together, both sides create grounded reward evidence for evaluation or reinforcement learning when connected to a training pipeline.",
  },
] as const;

function SignalGlyph({
  kind,
  className,
}: {
  kind: SignalKind;
  className?: string;
}) {
  if (kind === "positive") {
    return (
      <span
        aria-hidden
        className={cn(
          "block h-[18px] w-[18px] rotate-45 bg-white/85 shadow-[0_0_12px_rgba(255,255,255,0.42)]",
          className,
        )}
      />
    );
  }

  if (kind === "partial") {
    return (
      <span
        aria-hidden
        className={cn(
          "block h-[18px] w-[18px] rounded-full border-2 border-white/75 bg-transparent",
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "block h-[18px] w-[18px] rotate-45 border-[1.5px] border-white/80 bg-black/60",
        className,
      )}
    />
  );
}

export function QuirqCollection() {
  useEffect(() => {
    stage.showQuirqGraph = true;
    return () => {
      stage.showQuirqGraph = false;
    };
  }, []);

  return (
    <Beat index={3} id="ledger" className="min-h-[112svh] lg:min-h-svh">
      <div className="relative min-h-[calc(112svh-11rem)] lg:min-h-[calc(100svh-11rem)]">
        <div className="relative max-w-xl">
          <TextScrim />
          <div className="relative">
            <Marker>03 · the outcome graph</Marker>
            <h2 className="display-sm over-stage mt-7">
              <Reveal delay={0.05}>A collection</Reveal>
              <Reveal delay={0.13}>
                of <GlassText>quirqs.</GlassText>
              </Reveal>
            </h2>

            <Rise delay={0.22}>
              <p className="lede over-stage mt-5 max-w-[49ch] sm:mt-6">
                Every checked outcome becomes a vertex on the same continuous
                memory. Wins show what to repeat. Misses show what to change.
              </p>
            </Rise>
          </div>
        </div>

        <Rise
          delay={0.3}
          className="relative mt-8 max-w-[740px] sm:mt-10"
        >
          <div className="flex items-center gap-4">
            <p className="font-mono text-[10px] leading-[1.45] font-semibold tracking-[0.11em] text-white/90 uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-[12px]">
              Each vertex is one environment-checked outcome
            </p>
            <span className="h-px min-w-8 flex-1 bg-linear-to-r from-white/55 to-transparent" />
          </div>

          <ul
            aria-label="Outcome vertex legend"
            className="mt-5 grid gap-x-8 gap-y-4 drop-shadow-[0_2px_7px_rgba(0,0,0,1)] sm:grid-cols-3 sm:gap-y-0"
          >
            {SIGNALS.map((signal) => (
              <li
                key={signal.kind}
                className="relative flex min-w-0 items-center gap-3.5"
              >
                <SignalGlyph kind={signal.kind} />
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-white/95 sm:text-[14px]">
                    {signal.label}
                  </span>
                  <span className="mt-1 block font-mono text-[9.5px] font-medium tracking-[0.1em] text-white/78 uppercase sm:text-[10px]">
                    {signal.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Rise>

        <div
          aria-hidden
          className="h-[clamp(250px,35vh,340px)] lg:h-[clamp(210px,28vh,290px)]"
        />

        <Rise delay={0.4} className="relative border-y border-white/[0.16]">
          <div className="grid divide-y divide-white/[0.14] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {LEARNING_EFFECTS.map((effect, index) => (
              <article
                key={effect.marker}
                className="relative isolate min-w-0 px-1 py-5 sm:px-3 lg:px-5 lg:py-6 first:lg:pl-0"
              >
                <TextScrim />
                <div className="relative">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.18] font-mono text-[7.5px] text-white/55">
                      0{index + 1}
                    </span>
                    <p className="font-mono text-[8.5px] tracking-[0.11em] text-white/58 uppercase">
                      {effect.marker}
                    </p>
                  </div>
                  <h3 className="mt-3 text-[18px] font-medium tracking-[-0.025em] text-ink">
                    {effect.heading}
                  </h3>
                  <p className="mt-2 max-w-[38ch] text-[10.5px] leading-relaxed text-white/64">
                    {effect.copy}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Rise>
      </div>
    </Beat>
  );
}
