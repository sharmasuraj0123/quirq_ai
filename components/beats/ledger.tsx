"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Beat, Marker, Reveal, Rise, TextScrim, cn } from "@/components/ui/primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------- stat tile ------------------------------- */

type StatProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  note: string;
  tone?: "ink" | "green" | "spectrum";
};

function Stat({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  note,
  tone = "ink",
}: StatProps) {
  const host = useRef<HTMLDivElement>(null);
  const out = useRef<HTMLSpanElement>(null);
  const inView = useInView(host, { amount: 0.5, once: true });
  const reduced = useReducedMotion();

  const format = (n: number) =>
    prefix +
    n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix;

  useEffect(() => {
    const el = out.current;
    if (!el || reduced) return;
    // Rendered server-side at the final value (correct without JS); zeroed on the
    // client so the count-up has somewhere to travel from.
    if (!inView) {
      el.textContent = format(0);
      return;
    }
    let raf = 0;
    const started = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = Math.min((now - started) / 1500, 1);
      el.textContent = format(value * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value]);

  return (
    <div ref={host} className="bg-black/40 px-5 py-4 sm:px-6">
      <p className="label text-[9.5px]">{label}</p>
      <p
        className={cn(
          "numeric mt-2.5 text-[clamp(22px,2.5vw,31px)] font-semibold tabular-nums",
          tone === "green" && "text-spec-green",
          tone === "spectrum" && "spectrum-text",
          tone === "ink" && "text-ink",
        )}
      >
        <span ref={out}>{format(value)}</span>
      </p>
      <p className="mt-1.5 font-mono text-[10px] text-faint">{note}</p>
    </div>
  );
}

/* --------------------------------- feed ---------------------------------- */

type Row = {
  agent: string;
  task: string;
  state: "verified" | "partial" | "review";
  minted: number | null;
  cost: number;
};

const FEED: Row[] = [
  { agent: "support-bot", task: "Closed billing ticket #4821", state: "verified", minted: 4.0, cost: 0.13 },
  { agent: "eng-agent", task: "PR #212 merged · fix login redirect", state: "verified", minted: 25.0, cost: 1.87 },
  { agent: "docs-agent", task: "Refund policy article updated", state: "partial", minted: 9.6, cost: 0.42 },
  { agent: "ops-agent", task: "Weekly usage report compiled", state: "verified", minted: 8.0, cost: 0.28 },
  { agent: "research-bot", task: "Competitor pricing brief drafted", state: "review", minted: null, cost: 0.95 },
  { agent: "sales-agent", task: "Lead list enriched · 142 rows", state: "verified", minted: 15.0, cost: 0.66 },
];

/**
 * Timestamps are derived from the row's position in the stream, not stored on
 * it. Rows cycle, so fixed times would scramble the clock as the feed wraps —
 * and a ledger whose entries run backwards in time is not a ledger.
 * Deterministic (no randomness) so server and client markup agree.
 */
const START_MINUTES = 9 * 60 + 14;
function stamp(index: number) {
  const total = START_MINUTES + index * 7;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const STATE_STYLE: Record<Row["state"], string> = {
  verified: "text-spec-green bg-spec-green/10",
  partial: "text-spec-orange bg-spec-orange/10",
  review: "text-spec-red bg-spec-red/10",
};

const STATE_LABEL: Record<Row["state"], string> = {
  verified: "✓ verified",
  partial: "◐ partial",
  review: "⚠ review",
};

const VISIBLE = 3;

function Feed() {
  const host = useRef<HTMLDivElement>(null);
  const inView = useInView(host, { amount: 0.3 });
  const reduced = useReducedMotion();
  const cursor = useRef(VISIBLE);
  // Newest at the top, so the initial stack is seeded in reverse.
  const [rows, setRows] = useState(() =>
    FEED.slice(0, VISIBLE)
      .map((row, i) => ({ ...row, id: i }))
      .reverse(),
  );

  useEffect(() => {
    if (!inView || reduced) return;
    const timer = setInterval(() => {
      setRows((prev) => {
        const next = { ...FEED[cursor.current % FEED.length], id: cursor.current };
        cursor.current += 1;
        return [next, ...prev.slice(0, VISIBLE - 1)];
      });
    }, 3200);
    return () => clearInterval(timer);
  }, [inView, reduced]);

  return (
    <div ref={host} className="bg-black/25 px-2 py-1.5">
      <p className="sr-only">
        A sample of agent tasks. Each row shows the task, whether the workspace
        verified it, the value minted, and what it cost all-in.
      </p>
      {/* popLayout pulls the outgoing row out of flow immediately, so the rest
          slide up cleanly instead of waiting on its fade and leaving a gap. */}
      <AnimatePresence initial={false} mode="popLayout">
        {rows.map((row) => (
          <motion.div
            key={row.id}
            layout
            aria-hidden
            initial={reduced ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="flex h-10 items-center gap-3 px-3 text-[13px] sm:gap-4 sm:px-4"
          >
            <span className="hidden font-mono text-[10.5px] text-faint sm:block">
              {stamp(row.id)}
            </span>
            <span className="hidden shrink-0 rounded-full border border-hair-soft bg-white/5 px-2.5 py-1 font-mono text-[10px] text-dim md:block">
              {row.agent}
            </span>
            <span className="min-w-0 flex-1 truncate text-ink/90">{row.task}</span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 font-mono text-[9.5px] tracking-[0.08em] uppercase",
                STATE_STYLE[row.state],
              )}
            >
              {STATE_LABEL[row.state]}
            </span>
            <span className="numeric w-[74px] shrink-0 text-right tabular-nums">
              <span
                className={
                  row.minted === null ? "text-faint" : "spectrum-text font-semibold"
                }
              >
                {row.minted === null ? "held" : `+$${row.minted.toFixed(2)}`}
              </span>
              <span className="block font-mono text-[9.5px] text-faint">
                cost ${row.cost.toFixed(2)}
              </span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------- sparkline ------------------------------- */

/** Cost per run decaying toward the execution floor as the workspace remembers. */
function CostCurve() {
  const reduced = useReducedMotion();
  const width = 150;
  const height = 34;
  const points = Array.from({ length: 26 }, (_, i) => {
    const x = (i / 25) * width;
    const y = height - (height - 5) * (0.24 + 0.76 * Math.exp(-i / 5.5));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-[150px] overflow-visible"
      aria-hidden
    >
      <motion.polyline
        points={points.join(" ")}
        fill="none"
        stroke="var(--color-spec-green)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.7, ease: "easeOut" }}
      />
    </svg>
  );
}

/* --------------------------------- beat ---------------------------------- */

export function Ledger() {
  return (
    <Beat index={3} id="ledger">
      <div className="relative max-w-2xl">
        <TextScrim />
        <Marker>03 — the ledger</Marker>
        {/* Smaller than the other beats on purpose: here the panel is the
            subject and the headline only has to introduce it. */}
        <h2 className="display-sm over-stage mt-7">
          <Reveal delay={0.05}>An auditable</Reveal>
          <Reveal delay={0.13}>
            P&amp;L <span className="spectrum-text">for your AI.</span>
          </Reveal>
        </h2>
      </div>

      <Rise delay={0.2} className="mt-9">
        <div className="overflow-hidden rounded-2xl border border-hair bg-black/50 shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair-soft px-5 py-3.5 sm:px-6">
            <span className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
              <span className="pulse-dot" />
              Demo workspace · support + engineering
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
              June
            </span>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/6 lg:grid-cols-4">
            <Stat
              label="Verified work delivered"
              value={38000}
              prefix="$"
              note="↑ 44% vs May"
              tone="green"
            />
            <Stat
              label="All-in cost"
              value={6830}
              prefix="$"
              note="tokens · compute · APIs · review"
            />
            <Stat
              label="Delivered per $1"
              value={5.6}
              decimals={1}
              suffix="×"
              note="from 3.1× in April"
              tone="green"
            />
            <Stat
              label="Needed a human"
              value={11.4}
              decimals={1}
              suffix="%"
              note="from 18.1% — trust is growing"
            />
          </div>

          <Feed />

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hair-soft px-5 py-4 sm:px-6">
            <span className="label text-[9.5px]">Cost per run</span>
            <div className="flex items-center gap-4">
              <CostCurve />
              <span className="font-mono text-[11px] text-spec-green">
                −42% by run 50
              </span>
            </div>
          </div>
        </div>
      </Rise>

      {/* This caption is the page's honesty note, so it has to stay readable
          where the form drifts behind it. */}
      <Rise delay={0.3} className="relative mt-5 max-w-[62ch]">
        <TextScrim />
        <p className="relative font-mono text-[10.5px] leading-relaxed text-dim">
          Illustrative — the worked quarter from the{" "}
          <a
            href="/quirq-whitepaper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dim underline underline-offset-4"
          >
            quirq whitepaper
          </a>
          . Your ledger is built from your own agents&rsquo; verified output.
        </p>
      </Rise>
    </Beat>
  );
}
