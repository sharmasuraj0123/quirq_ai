"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Reveal, Rise, TextScrim, cn } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";
import {
  formatMoney,
  formatQuirqs,
  portfolioMetrics,
  settleUnit,
} from "@/lib/quirq/engine.mjs";
import type {
  CostInput,
  SettledUnit,
} from "@/lib/quirq/engine.mjs";


/* ------------------------------- constants ------------------------------- */

/**
 * The rates the visitor does not set. They are quoted in the notes under each
 * control rather than buried here, because an estimate whose assumptions are
 * invisible is not an estimate, it is a claim.
 */
/** Blended input plus output, mid-range frontier pricing. */
const PRICE_PER_MILLION = 6;
/** Loaded hourly cost of the person who reviews or rescues a unit. */
const REVIEW_RATE_PER_HOUR = 90;
/** The workspace's own fixed monthly cost, amortized over the units it hosts. */
const ENVIRONMENT_MONTHLY = 600;

/** Sandbox time, tool calls and retained snapshots for one outcome. Small next
    to inference and review, and carried anyway so the total stays all-in. */
const COMPUTE_SECONDS = 40;
const COMPUTE_RATE_PER_HOUR = 2.4;
const API_CALLS = 12;
const API_PRICE_PER_CALL = 0.004;
const STORAGE_GB_MONTHS = 0.05;
const STORAGE_RATE_PER_GB_MONTH = 0.023;

/**
 * Divisible settlement with tau at 0.7: partial completion is worth its share,
 * and anything under seven tenths is the unit a human has to take back.
 */
const TAU = 0.7;

/** A three-line definition of done. The weights are the calculator's only
    scoring input, exactly as they are the workspace's only scoring input. */
const CHECKS = [
  { id: "record", weight: 0.5, title: "Exists in the system of record" },
  { id: "regression", weight: 0.3, title: "No regression in the after-state" },
  { id: "evidence", weight: 0.2, title: "Evidence attached to the unit" },
] as const;

/* --------------------------------- parts --------------------------------- */

function Strip({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex h-[46px] items-center justify-between gap-4 overflow-hidden px-5 sm:px-6">
      <span className="label text-[9.5px] whitespace-nowrap">{left}</span>
      <span className="hidden font-mono text-[9.5px] tracking-[0.18em] whitespace-nowrap text-faint uppercase sm:inline">
        {right}
      </span>
    </div>
  );
}

function Slider({
  label,
  display,
  note,
  ariaLabel,
  valueText,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  display: string;
  note: string;
  ariaLabel: string;
  valueText: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex h-[112px] flex-col justify-between overflow-hidden bg-black/85 px-5 py-4 sm:px-6">
      <div className="flex items-baseline justify-between gap-3">
        <span className="label text-[9.5px]">{label}</span>
        {/* Right-aligned and tabular, so a digit arriving or leaving moves
            nothing else on the row. */}
        <span className="numeric font-mono text-[12.5px] whitespace-nowrap text-ink tabular-nums">
          {display}
        </span>
      </div>
      {/* The native control, styled rather than replaced: it already has the
          keyboard contract, the focus ring and the screen-reader semantics. */}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        aria-label={ariaLabel}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer accent-ink"
      />
      <p className="font-mono text-[9.5px] leading-relaxed text-faint">{note}</p>
    </div>
  );
}

function Figure({
  label,
  value,
  note,
  tone = "ink",
  className,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "ink" | "green" | "red";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center overflow-hidden bg-black/85 px-5 sm:px-6",
        className,
      )}
    >
      <p className="label text-[9.5px]">{label}</p>
      <p
        className={cn(
          "numeric mt-2 text-[clamp(20px,2.2vw,27px)] font-semibold whitespace-nowrap tabular-nums",
          tone === "green" && "text-spec-green",
          tone === "red" && "text-spec-red",
          tone === "ink" && "text-ink",
        )}
      >
        {value}
      </p>
      <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-faint">
        {note}
      </p>
    </div>
  );
}

/* -------------------------------- section -------------------------------- */

/**
 * Calculate your quirq.
 *
 * Every figure below comes out of lib/quirq/engine.mjs: the same mint rule,
 * cost model and portfolio metrics the CLI runs over a real ledger. Nothing
 * here re-derives them, so the panel cannot drift from the product.
 *
 * Not a beat: no `data-beat`, no registerBeat. The keyframe track has exactly
 * five leaves and the home page already spends all five, so this section
 * occupies scroll while the glass keeps gliding from beat 2 toward beat 3.
 *
 * Its height is fixed by construction. There is no ResizeObserver in the
 * scroll runtime, so a panel that grew when a value changed would leave every
 * measured section centre stale and desync the choreography for the rest of
 * the page. Hence: fixed row heights, `overflow-hidden` on every cell, static
 * note copy, and tabular figures that cannot reflow their own line.
 */
export function Calculator() {
  const [budget, setBudget] = useState(250);
  const [volume, setVolume] = useState(200);
  /** Thousands of tokens per outcome; the slider reads in k. */
  const [tokens, setTokens] = useState(480);
  const [minutes, setMinutes] = useState(18);
  const [passed, setPassed] = useState([true, true, false]);

  const toggle = (index: number) =>
    setPassed((prev) => prev.map((on, i) => (i === index ? !on : on)));

  const unit = useMemo<SettledUnit>(() => {
    const cost: CostInput = {
      inference: [
        {
          model: "blended",
          tokens: tokens * 1000,
          pricePerMillion: PRICE_PER_MILLION,
        },
      ],
      compute: [
        {
          kind: "gpu",
          seconds: COMPUTE_SECONDS,
          ratePerHour: COMPUTE_RATE_PER_HOUR,
        },
      ],
      api: [
        { service: "tools", calls: API_CALLS, pricePerCall: API_PRICE_PER_CALL },
      ],
      storage: {
        gbMonths: STORAGE_GB_MONTHS,
        ratePerGbMonth: STORAGE_RATE_PER_GB_MONTH,
      },
      // F / N: the environment's fixed cost divided by the units it hosts, so
      // running more outcomes on the same workspace makes each one carry less.
      environment: { fixedCost: ENVIRONMENT_MONTHLY, unitsHosted: volume },
      intervention: { minutes, loadedRatePerHour: REVIEW_RATE_PER_HOUR },
    };

    return settleUnit({
      id: "estimate",
      title: "One budgeted outcome",
      owner: "you",
      budget,
      tau: TAU,
      settlement: "divisible",
      checks: CHECKS.map((check, i) => ({
        id: check.id,
        weight: check.weight,
        passed: passed[i],
      })),
      cost,
    });
  }, [budget, volume, tokens, minutes, passed]);

  // The month as the engine sees it: N settlements of this shape, summed by
  // the same portfolio function that reads a real ledger.
  const book = useMemo(
    () => portfolioMetrics(Array.from({ length: volume }, () => unit)),
    [unit, volume],
  );

  const monthlyTokens = tokens * 1000 * volume;
  // Both operands are engine output; this is a ratio for display, not a
  // second cost model.
  const tokenBill = unit.costBreakdown.inference * volume;
  const tokenShare = book.cost > 0 ? (tokenBill / book.cost) * 100 : 0;

  return (
    <section
      id="calculator"
      aria-labelledby="calculator-title"
      className="relative py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <div className="relative flex flex-col items-center text-center">
          <GlassPool scrimClassName="mx-auto max-w-3xl">
            <Rise>
              <p className="label over-stage">Estimate · your own numbers</p>
            </Rise>

            <h2 id="calculator-title" className="display-sm over-stage mt-7">
              <Reveal delay={0.05}>Now calculate</Reveal>
              <Reveal delay={0.13}>
                <GlassText>your quirq.</GlassText>
              </Reveal>
            </h2>

            <Rise delay={0.2}>
              <p className="lede over-stage mx-auto mt-6 max-w-[50ch]">
                Budget one outcome, set how many you want a month, and mark what
                a human still has to touch. The mint rule and the all-in cost
                model run on your numbers, in your browser.
              </p>
            </Rise>
          </GlassPool>
        </div>

        <Rise delay={0.1} className="mt-11">
          <div className="overflow-hidden rounded-2xl border border-hair bg-black/85 shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="border-b border-hair-soft">
              <Strip left="Your inputs" right="estimate, not measurement" />
            </div>

            <div className="grid gap-px bg-white/6 sm:grid-cols-2">
              <Slider
                label="Budget per outcome"
                display={formatMoney(budget, 0)}
                note="what one finished outcome is worth to you"
                ariaLabel="Budget for one outcome, in dollars"
                valueText={formatMoney(budget, 0)}
                value={budget}
                min={50}
                max={5000}
                step={50}
                onChange={setBudget}
              />
              <Slider
                label="Outcomes per month"
                display={volume.toLocaleString("en-US")}
                note={`${formatMoney(ENVIRONMENT_MONTHLY, 0)} of environment amortizes across these`}
                ariaLabel="Outcomes per month"
                valueText={`${volume.toLocaleString("en-US")} outcomes per month`}
                value={volume}
                min={10}
                max={1000}
                step={10}
                onChange={setVolume}
              />
              <Slider
                label="Tokens per outcome"
                display={`${tokens.toLocaleString("en-US")}k`}
                note={`consumption, priced at ${formatMoney(PRICE_PER_MILLION, 0)} per million`}
                ariaLabel="Tokens per outcome, in thousands"
                valueText={`${(tokens * 1000).toLocaleString("en-US")} tokens`}
                value={tokens}
                min={20}
                max={2000}
                step={20}
                onChange={setTokens}
              />
              <Slider
                label="Human minutes per outcome"
                display={`${minutes} min`}
                note={`review and rescue, at ${formatMoney(REVIEW_RATE_PER_HOUR, 0)} loaded per hour`}
                ariaLabel="Human intervention minutes per outcome"
                valueText={`${minutes} minutes`}
                value={minutes}
                min={0}
                max={60}
                step={1}
                onChange={setMinutes}
              />
            </div>

            <div className="border-t border-hair-soft">
              <Strip
                left="Definition of done"
                right="V = passed weight ÷ total weight"
              />
            </div>

            <div className="grid gap-px bg-white/6 md:grid-cols-3">
              {CHECKS.map((check, i) => (
                <label
                  key={check.id}
                  className="flex h-[72px] cursor-pointer items-center gap-3.5 overflow-hidden bg-black/85 px-5 transition-colors duration-300 hover:bg-white/[0.03] sm:px-6"
                >
                  <input
                    type="checkbox"
                    checked={passed[i]}
                    onChange={() => toggle(i)}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-ink"
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-snug text-ink/90">
                      {check.title}
                    </span>
                    <span className="numeric mt-1 block font-mono text-[9.5px] text-faint tabular-nums">
                      weight {check.weight.toFixed(1)}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="border-t border-hair-soft">
              <Strip left="What quirq meters" right="per month" />
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/6 lg:grid-cols-3">
              <Figure
                className="h-[106px]"
                label="Verified completion"
                value={formatQuirqs(unit.V, 2)}
                note="scored against captured state, never self-reported"
              />
              <Figure
                className="h-[106px]"
                label="Minted per outcome"
                value={formatMoney(unit.Q)}
                note="Q = V × B"
              />
              <Figure
                className="h-[106px]"
                label="Minted this month"
                value={formatQuirqs(book.minted, 0)}
                note="quirqs of verified work"
                tone="green"
              />
              <Figure
                className="h-[106px]"
                label="All-in cost this month"
                value={formatMoney(book.cost, 0)}
                note="every input, human minutes included"
              />
              <Figure
                className="h-[106px]"
                label="QER"
                value={
                  book.qer === null ? "n/a" : `${formatQuirqs(book.qer, 2)}×`
                }
                note="quirqs delivered per all-in dollar"
                tone="green"
              />
              <Figure
                className="h-[106px]"
                label="Cost per quirq"
                value={
                  // Undefined by construction when nothing was minted; the
                  // whitepaper leaves the case open rather than dividing by 0.
                  book.costPerQuirq === null
                    ? "n/a"
                    : formatMoney(book.costPerQuirq, 3)
                }
                note="what a dollar of verified work costs you"
              />
            </div>

            <div className="border-t border-hair-soft">
              <Strip left="What the token meter sees" right="same month" />
            </div>

            <div className="grid gap-px bg-white/6 sm:grid-cols-3">
              <Figure
                className="h-[96px]"
                label="Tokens consumed"
                value={formatTokens(monthlyTokens)}
                note="the meter you already have"
              />
              <Figure
                className="h-[96px]"
                label="Inference bill"
                value={formatMoney(tokenBill, 0)}
                note="the whole of the token bill"
              />
              <Figure
                className="h-[96px]"
                label="Share of all-in cost"
                value={`${tokenShare.toFixed(1)}%`}
                note="the rest is compute, environment and review"
                tone="red"
              />
            </div>
          </div>
        </Rise>

        <Rise delay={0.2} className="relative mx-auto mt-6 max-w-[72ch]">
          <TextScrim />
          <p className="relative font-mono text-[10.5px] leading-relaxed text-dim">
            An estimate from the numbers you just set, not a measurement. It
            runs the shipped mint rule and{" "}
            <Link
              href="/whitepaper"
              className="text-dim underline underline-offset-4"
            >
              all-in cost model
            </Link>{" "}
            unchanged: inference, compute, API calls, storage, environment
            amortization and human minutes. Your real figures come from your own
            ledger.
          </p>
        </Rise>
      </div>
    </section>
  );
}

/** Token counts run to nine digits; nobody reads them at full width. */
function formatTokens(value: number): string {
  return value >= 1e9
    ? `${(value / 1e9).toFixed(2)}B`
    : `${(value / 1e6).toFixed(1)}M`;
}
