"use client";

import {
  ActionLink,
  Beat,
  Marker,
  Reveal,
  Rise,
  TextScrim,
} from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { WHITEPAPER } from "@/lib/whitepaper";

/**
 * The whitepaper's beats. Same stage, same five-keyframe track as the home
 * page; the paper is presented in front of the glass rather than set as a
 * document. Beat index n rides KEYFRAMES[n] exactly as the home beats do:
 *   0 centred hero · 1 drained monochrome · 2 spectrum floods back ·
 *   3 recedes upstage · 4 returns centre, fully lit.
 *
 * The typeset PDF is the version of record, so both the opening beat and the
 * closing beat send the reader there. Every figure quoted here traces to the
 * paper's worked quarter; revise them together.
 */

const PDF = "/whitepaper/pdf";

/* 0 · the paper itself, centred under the breathing form. */
export function PaperHero() {
  return (
    <Beat index={0} id="paper-hero">
      <div className="over-stage relative flex flex-col items-center text-center">
        <GlassPool>
          <Rise>
            <p className="label">Whitepaper · {WHITEPAPER.date}</p>
          </Rise>

          <h1 className="display mt-7 max-w-[17ch]">
            <Reveal delay={0.1}>A unit of work</Reveal>
            <Reveal delay={0.18}>
              for <GlassText>intelligence</GlassText>.
            </Reveal>
          </h1>

          <Rise delay={0.3}>
            <p className="lede mx-auto mt-7 text-center">
              AI is metered on one side only. This paper proposes the missing
              output meter, develops its full calculus with worked arithmetic,
              and tiers every claim it makes.
            </p>
          </Rise>

          <Rise delay={0.4}>
            <p className="mt-6 font-mono text-[10.5px] tracking-[0.16em] text-faint uppercase">
              {WHITEPAPER.authors}
            </p>
          </Rise>

          {/* Opening call to action: the typeset original. */}
          <Rise
            delay={0.5}
            className="mt-11 flex flex-wrap items-center justify-center gap-3"
          >
            <ActionLink href={PDF} newTab>
              View the PDF version
            </ActionLink>
            <ActionLink href="/llm.txt" tone="ghost" newTab>
              llm.txt for agents
            </ActionLink>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}

const BREAKS = [
  {
    title: "Non-monotonicity",
    note: "A verbose failure costs more than a terse success. A metric that rises when work goes badly cannot denominate it.",
  },
  {
    title: "Model-relativity",
    note: "The same outcome costs 10x different token counts across models. A ruler made of rubber.",
  },
  {
    title: "Value-blindness",
    note: "A $4 ticket and a $25,000 contract review are indistinguishable in the bill.",
  },
];

/* 1 · what the token cannot do, as the glass drains monochrome. */
export function PaperProblem() {
  return (
    <Beat index={1} id="paper-problem">
      <div className="relative max-w-2xl md:max-w-[62%]">
        <TextScrim />
        <Marker>01 · sections 1 and 2</Marker>

        <h2 className="display over-stage mt-8">
          <Reveal delay={0.05}>One meter</Reveal>
          <Reveal delay={0.13}>
            is <span className="text-spec-red">missing.</span>
          </Reveal>
        </h2>

        <Rise delay={0.28}>
          <p className="lede over-stage mt-6 max-w-[44ch]">
            The token counts compute, scales with energy, and prices inference.
            What it cannot do is cross from cost to value.
          </p>
        </Rise>

        <div className="mt-8 space-y-px overflow-hidden rounded-2xl border border-hair bg-white/6 backdrop-blur-xl">
          {BREAKS.map((item, i) => (
            <Rise key={item.title} delay={0.36 + i * 0.07}>
              <div className="flex gap-5 bg-black/55 px-6 py-4">
                <span className="mt-0.5 font-mono text-[10px] text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[14.5px] font-medium text-ink">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-dim">
                    {item.note}
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

/* 2 · the mint rule, as the spectrum floods back. */
export function PaperMint() {
  return (
    <Beat index={2} id="paper-mint">
      <div className="relative max-w-2xl md:ml-auto md:max-w-[60%]">
        <GlassPool>
          <Marker>02 · sections 3 and 4</Marker>

          <h2 className="display over-stage mt-8">
            <Reveal delay={0.05}>Minted by</Reveal>
            <Reveal delay={0.13}>
              <GlassText>verification.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.28}>
            <p className="lede over-stage mt-7 max-w-[44ch]">
              A human owner budgets an outcome at value B. The environment
              snapshots the world before and after execution, scores completion
              V against a weighted definition of done, and mints the product.
            </p>
          </Rise>

          <Rise delay={0.36}>
            <p className="over-stage mt-10 font-mark text-[clamp(30px,4vw,52px)] font-semibold tracking-[-0.02em]">
              <GlassText>Q</GlassText>
              <span className="mx-3 text-faint">=</span>V
              <span className="mx-3 text-faint">×</span>B
            </p>
            <p className="over-stage mt-3 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
              minted value · verified completion · human budget
            </p>
          </Rise>

          <Rise delay={0.44}>
            <p className="over-stage mt-8 max-w-[46ch] text-[13.5px] leading-relaxed text-dim">
              Against the mint the environment meters the all-in cost:
              inference, compute, API calls, storage, environment amortization,
              and the human minutes intervention still required.
            </p>
          </Rise>
        </GlassPool>
      </div>
    </Beat>
  );
}

const QUARTER = [
  { month: "April", minted: "15,770", cost: "$5,020", qer: "3.1x" },
  { month: "May", minted: "26,310", cost: "$6,480", qer: "4.1x" },
  { month: "June", minted: "38,000", cost: "$6,830", qer: "5.6x" },
];

/* 3 · the worked ledger, while the form recedes upstage. */
export function PaperLedger() {
  return (
    <Beat index={3} id="paper-ledger">
      <div className="relative max-w-2xl">
        <TextScrim />
        <Marker>03 · section 5</Marker>

        <h2 className="display-sm over-stage mt-7">
          <Reveal delay={0.05}>The quarter,</Reveal>
          <Reveal delay={0.13}>worked end to end.</Reveal>
        </h2>
      </div>

      <Rise delay={0.24} className="mt-9">
        <div className="overflow-hidden rounded-2xl border border-hair bg-black/50 shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-3 border-b border-hair-soft px-5 py-3.5 font-mono text-[9.5px] tracking-[0.16em] text-faint uppercase sm:px-6">
            <span>Month</span>
            <span className="text-right">Minted Q</span>
            <span className="text-right">All-in cost</span>
            <span className="text-right">QER</span>
          </div>
          {QUARTER.map((row) => (
            <div
              key={row.month}
              className="grid grid-cols-4 gap-3 border-b border-hair-soft px-5 py-4 last:border-b-0 sm:px-6"
            >
              <span className="text-[13.5px] text-ink/85">{row.month}</span>
              <span className="numeric text-right font-mono text-[13px] text-ink/70 tabular-nums">
                {row.minted}
              </span>
              <span className="numeric text-right font-mono text-[13px] text-ink/70 tabular-nums">
                {row.cost}
              </span>
              <span className="numeric text-right font-mono text-[13px] font-medium text-ink tabular-nums">
                {row.qer}
              </span>
            </div>
          ))}
        </div>
      </Rise>

      <Rise delay={0.32} className="relative mt-5 max-w-[64ch]">
        <TextScrim />
        <p className="relative font-mono text-[10.5px] leading-relaxed text-dim">
          Illustrative arithmetic exhibiting the full calculation chain, not
          measurement. Read alone, the token bill says spend rose 83% and looks
          indistinguishable from waste. The quirq ledger says verified value per
          all-in dollar rose 81% while human rescue fell a third.
        </p>
      </Rise>
    </Beat>
  );
}

const TIERS = [
  { tier: "Sourced", note: "the token's physics" },
  { tier: "Derived", note: "the mint rule and its bounds" },
  { tier: "Measured", note: "E1 to E3, open harness" },
  { tier: "Open", note: "replication, prediction, governance" },
];

/* 4 · the close, returned to centre and fully lit. */
export function PaperClose() {
  return (
    <Beat index={4} id="paper-close">
      <div className="over-stage relative flex flex-col items-center text-center">
        <GlassPool scrimClassName="mx-auto max-w-3xl">
          <Rise>
            <p className="label">Sections 6 to 11 · every claim tiered</p>
          </Rise>

          <h2 className="display mx-auto mt-7 max-w-[15ch]">
            <Reveal delay={0.1}>On the record,</Reveal>
            <Reveal delay={0.18}>
              with <GlassText>falsifiers</GlassText>.
            </Reveal>
          </h2>

          <Rise delay={0.3}>
            <p className="lede mx-auto mt-6 text-center">
              Every empirical claim is stated with what would refute it, and the
              evidence behind it is labelled honestly.
            </p>
          </Rise>
        </GlassPool>

        <Rise delay={0.4} className="mt-9 w-full max-w-3xl">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hair bg-white/6 text-left backdrop-blur-xl sm:grid-cols-4">
            {TIERS.map((item) => (
              <div key={item.tier} className="bg-black/55 px-5 py-4">
                <p className="label">{item.tier}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </Rise>

        {/* Closing call to action mirrors the opening one: whichever end of
            the page the reader is at, the PDF is one step away. */}
        <Rise
          delay={0.5}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <ActionLink href={PDF} newTab>
            View the PDF version
          </ActionLink>
          <ActionLink href="/research" tone="ghost">
            Research notes
          </ActionLink>
        </Rise>
      </div>
    </Beat>
  );
}
