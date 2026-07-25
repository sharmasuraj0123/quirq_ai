"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import {
  formatMoney,
  formatQuirqs,
  portfolioMetrics,
} from "@/lib/quirq/engine.mjs";
import { verifyChain } from "@/lib/quirq/ledger.mjs";
import { readSession } from "@/lib/quirq/session.mjs";
import type { CostBreakdown, SettledUnit } from "@/lib/quirq/engine.mjs";
import type { LedgerEntry, Verification } from "@/lib/quirq/ledger.mjs";
import rawLedger from "@/lib/quirq/sample-ledger.json";
import { SPECTRUM } from "@/lib/spectrum";
import {
  ActionLink,
  Beat,
  Marker,
  Reveal,
  Rise,
  TextScrim,
  cn,
} from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";
import { beatsResized } from "@/lib/beat-registry";
import {
  InstanceConnect,
  InstanceDetail,
  InstanceProvider,
} from "./instance-panel";

/* ------------------------------------------------------------------ *
 * The raw material
 * ------------------------------------------------------------------ */

const SAMPLE = rawLedger as unknown as LedgerEntry[];

/** Which chain the whole page is reading. */
type Source = "sample" | "session";

/* Everything below is derived per source rather than at module scope: the
   visitor's ledger arrives after mount and can change length, so nothing about
   the sample may be baked into a constant the other source then inherits. */

function kindCounts(
  entries: readonly LedgerEntry[],
): ReadonlyArray<readonly [string, number]> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const kind = entry.record.kind ?? "unattributed";
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

function checkDescriptions(
  entries: readonly LedgerEntry[],
): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const entry of entries) {
    for (const check of entry.record.checks) {
      if (check.description && !map.has(check.id)) {
        map.set(check.id, check.description);
      }
    }
  }
  return map;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Hand-formatted rather than Intl: this component server-renders too, and a
 *  locale or timezone difference between Node and the browser would be a
 *  hydration mismatch in a page whose whole claim is determinism. */
function isoDay(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

function windowOf(entries: readonly LedgerEntry[]): string {
  const stamps = entries
    .map((entry) => entry.record.settledAt)
    .filter((stamp): stamp is string => typeof stamp === "string")
    .sort();
  if (stamps.length === 0) return "an unrecorded window";
  const first = isoDay(stamps[0]);
  const last = isoDay(stamps[stamps.length - 1]);
  return first === last ? first : `${first} to ${last}`;
}

/* ------------------------------------------------------------------ *
 * Snapshots: typed as unknown in the engine, so narrow it honestly
 * ------------------------------------------------------------------ */

type FileStat = { count: number; bytes: number };
type Snapshots = {
  before: FileStat;
  after: FileStat;
  diff: { added: string[]; modified: string[]; removed: string[] };
  provenance: { compute: string; inference: string };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readStat = (value: unknown): FileStat | null =>
  isRecord(value) &&
  typeof value.count === "number" &&
  typeof value.bytes === "number"
    ? { count: value.count, bytes: value.bytes }
    : null;

const readStrings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

function readSnapshots(value: unknown): Snapshots | null {
  if (!isRecord(value)) return null;
  const before = readStat(value.before);
  const after = readStat(value.after);
  if (!before || !after) return null;

  const diff = isRecord(value.diff) ? value.diff : {};
  const provenance = isRecord(value.provenance) ? value.provenance : {};

  return {
    before,
    after,
    diff: {
      added: readStrings(diff.added),
      modified: readStrings(diff.modified),
      removed: readStrings(diff.removed),
    },
    provenance: {
      compute:
        typeof provenance.compute === "string"
          ? provenance.compute
          : "unrecorded",
      inference:
        typeof provenance.inference === "string"
          ? provenance.inference
          : "unrecorded",
    },
  };
}

function provenanceLines(entries: readonly LedgerEntry[]): string[] {
  const lines = new Set<string>();
  for (const entry of entries) {
    const snapshots = readSnapshots(entry.record.snapshots);
    if (snapshots) {
      lines.add(
        `compute ${snapshots.provenance.compute} · inference ${snapshots.provenance.inference}`,
      );
    }
  }
  return [...lines];
}

/* ------------------------------------------------------------------ *
 * The forgery the tamper control performs
 * ------------------------------------------------------------------ */

type Forgery = {
  /** -1 when the chain is too short for the demonstration to land. */
  index: number;
  entry: LedgerEntry | null;
  /** The rewritten Q. */
  claim: number;
};

/**
 * The edit worth demonstrating: a unit that failed its checks and minted
 * nothing, rewritten to have delivered its whole budget. Found rather than
 * hardcoded, so it survives a regenerated sample and works on a visitor ledger
 * of any shape.
 *
 * Two constraints make it honest. Never the last entry, because the orphaned
 * tail is half of what the panel shows. And never a value the record already
 * holds, because an edit that changed nothing would leave the digest valid and
 * make the control read as broken rather than the chain read as sound.
 */
function forgery(entries: readonly LedgerEntry[]): Forgery {
  const last = entries.length - 1;
  if (last < 1) return { index: -1, entry: null, claim: 0 };

  const blank = entries.findIndex((e, i) => i < last && e.record.Q === 0);
  const under =
    blank !== -1
      ? blank
      : entries.findIndex((e, i) => i < last && e.record.Q < e.record.potential);
  const index = under === -1 ? 0 : under;

  const { Q, potential } = entries[index].record;
  return {
    index,
    entry: entries[index],
    // Short of its budget: claim all of it. Already paid in full: double it.
    claim: Q < potential ? potential : Math.max(Q * 2, 1),
  };
}

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

const money = (value: number | null, digits = 2) =>
  value === null ? "n/a" : formatMoney(value, digits);

const quirqs = (value: number | null, digits = 2) =>
  value === null ? "n/a" : formatQuirqs(value, digits);

const ratio = (value: number | null, digits = 2) =>
  value === null ? "n/a" : `${value.toFixed(digits)}×`;

const percent = (value: number | null, digits = 1) =>
  value === null ? "n/a" : `${(value * 100).toFixed(digits)}%`;

const shortHash = (hash: string) => `${hash.slice(0, 12)}…${hash.slice(-8)}`;

const pad = (n: number) => String(n).padStart(2, "0");

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/* ------------------------------------------------------------------ *
 * Cost lines: the all-in model, in the whitepaper's order
 * ------------------------------------------------------------------ */

const COST_LINES: ReadonlyArray<{
  key: keyof CostBreakdown;
  label: string;
  note: string;
  colour: string;
}> = [
  {
    key: "inference",
    label: "Inference",
    note: "tokens × price per million",
    colour: SPECTRUM[0],
  },
  {
    key: "compute",
    label: "Compute",
    note: "metered seconds at an hourly rate",
    colour: SPECTRUM[1],
  },
  {
    key: "api",
    label: "API calls",
    note: "calls × price per call",
    colour: SPECTRUM[2],
  },
  {
    key: "storage",
    label: "Storage",
    note: "gigabyte months",
    colour: SPECTRUM[3],
  },
  {
    key: "environment",
    label: "Environment",
    note: "fixed cost over the units it hosts",
    colour: SPECTRUM[5],
  },
  {
    key: "intervention",
    label: "Human intervention",
    note: "minutes at a loaded hourly rate",
    colour: SPECTRUM[6],
  },
];

/* ------------------------------------------------------------------ *
 * Shared chrome
 *
 * Every surface here now stands in front of the live glass rather than a flat
 * CSS glow, so the panel backgrounds are near-black and the cells darker
 * still. Free-standing lines of type carry a TextScrim instead.
 * ------------------------------------------------------------------ */

function Panel({
  title,
  aside,
  children,
  className,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-hair bg-black/70 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair-soft px-5 py-3.5 sm:px-6">
        <h2 className="label">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="border-t border-hair-soft px-5 py-4 font-mono text-[10.5px] leading-relaxed text-dim sm:px-6">
      {children}
    </p>
  );
}

const PILL =
  "rounded-full px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors";

/* ------------------------------------------------------------------ *
 * The dashboard
 * ------------------------------------------------------------------ */

type ChainState =
  | { status: "pending" }
  | { status: "done"; result: Verification; ms: number }
  | { status: "error"; message: string };

/**
 * Five beats on the shared keyframe track, and every one of them is driven by
 * the same piece of state, which is why the whole page is one component rather
 * than five siblings:
 *
 *   0 centred · what you are looking at, and the headline figures
 *   1 glass stage-right, copy left · which ledger this is, and what it is not
 *   2 glass stage-left, copy right · connecting to a live instance
 *   3 glass recedes upstage · the tables, at full width
 *   4 centred and fully lit · the chain, recomputed in front of you
 *
 * The last two are several viewports tall. That is supported now: the scroll
 * runtime observes each registered section, and every deliberate height change
 * below also calls beatsResized() rather than waiting on the observer.
 */
export function Dashboard() {
  const uid = useId();
  const [source, setSource] = useState<Source>("sample");
  const [session, setSession] = useState<LedgerEntry[]>([]);
  const [kind, setKind] = useState<string>("all");
  const [tampered, setTampered] = useState(false);
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const [chain, setChain] = useState<ChainState>({ status: "pending" });

  // localStorage does not exist during SSR, so reading the visitor's ledger
  // while rendering would make the server HTML and the first client paint
  // disagree. It is read once after mount instead, and the switch honestly
  // reads "0" until then.
  useEffect(() => {
    setSession(readSession());
  }, []);

  const base = source === "sample" ? SAMPLE : session;

  const forge = useMemo(() => forgery(base), [base]);

  // Copy on write rather than mutate: the imported JSON module object is
  // shared for the lifetime of the tab, so an in-place edit could never be
  // undone by the reset button.
  const entries = useMemo<LedgerEntry[]>(
    () =>
      tampered && forge.entry
        ? base.map((entry, i) =>
            i === forge.index
              ? { ...entry, record: { ...entry.record, Q: forge.claim } }
              : entry,
          )
        : base,
    [base, tampered, forge],
  );

  // Verification is a browser computation, not a build artifact: the point of
  // a hash chain is that the reader recomputes it instead of trusting a flag
  // the server sent. It also cannot run during SSR, since the pending state
  // is what makes the recomputation visible.
  useEffect(() => {
    let live = true;
    setChain({ status: "pending" });
    const started = performance.now();

    verifyChain(entries)
      .then((result) => {
        if (live) {
          setChain({ status: "done", result, ms: performance.now() - started });
        }
      })
      .catch((error: unknown) => {
        if (live) {
          setChain({
            status: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });

    return () => {
      live = false;
    };
  }, [entries]);

  // The tampered record feeds the metrics too. That is the argument: totals
  // are forgeable, which is exactly why the chain is recomputed beside them.
  const records = useMemo(() => entries.map((entry) => entry.record), [entries]);

  const kinds = useMemo(() => kindCounts(base), [base]);
  const descriptions = useMemo(() => checkDescriptions(base), [base]);
  const provenance = useMemo(() => provenanceLines(base), [base]);
  const windowLabel = useMemo(() => windowOf(base), [base]);

  // A kind selected against one ledger usually does not exist in the other, and
  // a filter that silently matches nothing looks like a broken page. Fall back
  // rather than reset, so switching back restores the selection.
  const activeKind = kinds.some(([name]) => name === kind) ? kind : "all";

  const units = useMemo(
    () =>
      activeKind === "all"
        ? records
        : records.filter((r) => (r.kind ?? "unattributed") === activeKind),
    [records, activeKind],
  );

  const metrics = useMemo(() => portfolioMetrics(units), [units]);

  const composition = useMemo(() => {
    const totals: CostBreakdown = {
      inference: 0,
      compute: 0,
      api: 0,
      storage: 0,
      environment: 0,
      intervention: 0,
    };
    for (const unit of units) {
      for (const line of COST_LINES) {
        totals[line.key] += unit.costBreakdown[line.key];
      }
    }
    const total = COST_LINES.reduce((sum, line) => sum + totals[line.key], 0);
    return { totals, total };
  }, [units]);

  // Every one of these changes a beat's height: a different ledger, a
  // different slice, a row opening, a forged entry, the verification landing.
  // The runtime measures section centres, so a stale height desyncs the glass
  // from the copy it is lit for. Told directly rather than left to the
  // ResizeObserver, whose delivery a throttled tab is free to defer.
  useEffect(() => {
    beatsResized();
  }, [source, session, activeKind, tampered, open, chain]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const pick = (next: Source) => {
    setSource(next);
    // A forgery belongs to the chain it was made against; carrying the flag
    // across would tamper with the other ledger the moment it loaded.
    setTampered(false);
  };

  const legalCount = kinds.find(([k]) => k === "legal")?.[1] ?? 0;
  const supportCount = kinds.find(([k]) => k === "support")?.[1] ?? 0;

  const empty = base.length === 0;

  return (
    <InstanceProvider>
      {/* ---------------- 0 · centred: what this is ---------------- */}

      <Beat index={0} id="dashboard-ledger">
        <div className="over-stage relative flex flex-col items-center text-center">
          <GlassPool scrimClassName="mx-auto max-w-3xl">
            <Marker>Dashboard · a working ledger</Marker>

            <h1 className="display mt-7 max-w-[17ch]">
              <Reveal delay={0.05}>Nothing here</Reveal>
              <Reveal delay={0.13}>
                <GlassText className="whitespace-nowrap">
                  is a screenshot.
                </GlassText>
              </Reveal>
            </h1>

            <Rise delay={0.24}>
              <p className="lede mx-auto mt-7 text-center">
                Every figure below is recomputed in this tab from the raw
                records, and the hash chain is re-verified link by link rather
                than taken on trust.
              </p>
            </Rise>
          </GlassPool>
        </div>

        {empty ? (
          <EmptyLedger />
        ) : (
          <Rise className="mt-12">
            <div className="overflow-hidden rounded-2xl border border-hair bg-black/40 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
              <div className="grid grid-cols-2 gap-px bg-white/6 md:grid-cols-3 xl:grid-cols-6">
                <Tile
                  label="Minted quirqs"
                  value={quirqs(metrics.minted)}
                  note={`${metrics.count} ${plural(metrics.count, "unit", "units")} settled in this slice`}
                />
                <Tile
                  label="All-in cost"
                  value={money(metrics.cost)}
                  note="inference · compute · api · storage · environment · human"
                />
                <Tile
                  label="QER"
                  value={ratio(metrics.qer)}
                  note="quirqs minted per all-in dollar"
                />
                <Tile
                  label="Cost per quirq"
                  value={money(metrics.costPerQuirq, 4)}
                  note="what one quirq of verified work cost"
                />
                <Tile
                  label="Intervention rate"
                  value={percent(metrics.interventionRate)}
                  note={`${metrics.interventions} of ${metrics.count} ${plural(metrics.count, "unit", "units")} scored under tau`}
                />
                <Tile
                  label="Realisation"
                  value={percent(metrics.realisation)}
                  note={`${quirqs(metrics.minted)} minted of ${quirqs(metrics.potential)} budgeted`}
                />
              </div>
            </div>
          </Rise>
        )}
      </Beat>

      {/* ---------------- 1 · glass stage-right: which ledger ---------------- */}

      <Beat index={1} id="dashboard-source">
        <div className="relative max-w-2xl md:max-w-[60%]">
          <TextScrim />

          <Marker>01 · what this data is</Marker>

          <h2 className="display-sm over-stage mt-7">
            <Reveal delay={0.05}>Two ledgers,</Reveal>
            <Reveal delay={0.13}>both staged worlds.</Reveal>
          </h2>

          <Rise delay={0.26}>
            <p className="lede over-stage mt-7">
              Thirty four settled units from one run of the quirq CLI against a
              real scratch workspace, or your own ledger if you have minted into
              it.
            </p>
          </Rise>

          <Rise delay={0.32} className="mt-9">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <span id={`${uid}-source`} className="label text-[9.5px]">
                Ledger
              </span>
              <div
                role="group"
                aria-labelledby={`${uid}-source`}
                className="flex flex-wrap items-center gap-2"
              >
                <FilterButton
                  label={`Sample workspace · ${SAMPLE.length}`}
                  active={source === "sample"}
                  onPress={() => pick("sample")}
                />
                <FilterButton
                  label={`Your ledger · ${session.length}`}
                  active={source === "session"}
                  onPress={() => pick("session")}
                />
              </div>
            </div>
          </Rise>

          {!empty && (
            <>
              <Provenance
                source={source}
                count={base.length}
                kinds={kinds}
                provenance={provenance}
                windowLabel={windowLabel}
              />

              <Rise className="mt-8">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <span id={`${uid}-kind`} className="label text-[9.5px]">
                    Kind
                  </span>
                  <div
                    role="group"
                    aria-labelledby={`${uid}-kind`}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <FilterButton
                      label={`All · ${base.length}`}
                      active={activeKind === "all"}
                      onPress={() => setKind("all")}
                    />
                    {kinds.map(([name, count]) => (
                      <FilterButton
                        key={name}
                        label={`${name} · ${count}`}
                        active={activeKind === name}
                        onPress={() => setKind(name)}
                      />
                    ))}
                  </div>
                </div>
              </Rise>

              <Rise className="mt-6">
                <p className="over-stage font-mono text-[10.5px] leading-relaxed text-faint">
                  Each of the six figures on the last screen is one call to{" "}
                  <span className="text-dim">portfolioMetrics()</span> over the{" "}
                  {metrics.count}{" "}
                  {plural(metrics.count, "record", "records")} this filter
                  selects. None of them is stored or precomputed
                  {source === "sample" ? (
                    <>
                      : change the kind and all six are recomputed. QER reads
                      high here because of the work mix, not because of
                      performance: this workspace settled {legalCount} contract
                      reviews budgeted in the hundreds against {supportCount}{" "}
                      support tickets budgeted in the tens, so it is not
                      comparable with the support-heavy quarter worked in the
                      whitepaper. Compare mixes before comparing ratios.
                    </>
                  ) : (
                    <>
                      ; the same function ran over your records in this tab. A
                      ledger this short is a working meter rather than a
                      measurement: a ratio needs a window and a work mix behind
                      it before it means anything, so read these as arithmetic
                      on your own entries and nothing more.
                    </>
                  )}
                </p>
              </Rise>
            </>
          )}
        </div>
      </Beat>

      {/* ---------------- 2 · glass stage-left: the live instance ---------------- */}

      <Beat index={2} id="dashboard-instance">
        <div className="relative max-w-2xl md:ml-auto md:max-w-[60%]">
          <TextScrim />

          <Marker>02 · the environment</Marker>

          <h2 className="display-sm over-stage mt-7">
            <Reveal delay={0.05}>Connecting is</Reveal>
            <Reveal delay={0.13}>an action you take.</Reveal>
          </h2>

          <div className="mt-9">
            <InstanceConnect />
          </div>
        </div>
      </Beat>

      {/* ---------------- 3 · glass recedes: everything, at full width ------------ */}

      <Beat index={3} id="dashboard-detail">
        <div className="relative max-w-2xl">
          <TextScrim />

          <Marker>03 · the whole slice</Marker>

          <h2 className="display-sm over-stage mt-7">
            <Reveal delay={0.05}>Row by row,</Reveal>
            <Reveal delay={0.13}>line by line.</Reveal>
          </h2>

          <Rise delay={0.26}>
            <p className="lede over-stage mt-7">
              The glass is furthest upstage here because the numbers should own
              the frame. Everything below is at full width and in ledger order.
            </p>
          </Rise>

          {empty && (
            <Rise delay={0.32} className="mt-6">
              <p className="over-stage font-mono text-[10.5px] leading-relaxed text-faint">
                Nothing to lay out yet. Mint one unit and the cost composition,
                the failing-check ranking and the whole unit table appear here.
              </p>
            </Rise>
          )}
        </div>

        {/* The instance detail continues straight out of beat 2, before any
            figure about settled work, so the two never blur together. */}
        <div className="mt-12">
          <InstanceDetail />
        </div>

        {!empty && (
          <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-12">
            {/* ---------------- cost composition ---------------- */}

            <Rise>
              <Panel
                title="Cost composition"
                aside={
                  <span className="numeric font-mono text-[11px] text-dim tabular-nums">
                    {money(composition.total)} all-in
                  </span>
                }
              >
                <div className="px-5 pt-6 sm:px-6">
                  <div
                    aria-hidden
                    className="flex h-9 w-full overflow-hidden rounded-[4px] bg-white/5"
                  >
                    {COST_LINES.map((line) => {
                      const amount = composition.totals[line.key];
                      const share =
                        composition.total > 0 ? amount / composition.total : 0;
                      return (
                        <span
                          key={line.key}
                          className="h-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
                          style={{
                            width: `${(share * 100).toFixed(3)}%`,
                            background: line.colour,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="px-5 pt-6 pb-2 sm:px-6">
                  <table className="w-full border-collapse text-left">
                    <caption className="sr-only">
                      All-in cost broken into the six lines of the quirq cost
                      model, summed across the {metrics.count} units in this
                      slice.
                    </caption>
                    <thead>
                      <tr className="border-b border-hair-soft">
                        <th
                          scope="col"
                          className="pb-2.5 font-mono text-[9.5px] font-medium tracking-[0.14em] text-faint uppercase"
                        >
                          Line
                        </th>
                        <th
                          scope="col"
                          className="pb-2.5 text-right font-mono text-[9.5px] font-medium tracking-[0.14em] text-faint uppercase"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="pb-2.5 text-right font-mono text-[9.5px] font-medium tracking-[0.14em] text-faint uppercase"
                        >
                          Share
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {COST_LINES.map((line) => {
                        const amount = composition.totals[line.key];
                        const share =
                          composition.total > 0 ? amount / composition.total : 0;
                        return (
                          <tr
                            key={line.key}
                            className="border-b border-hair-soft last:border-b-0"
                          >
                            <th
                              scope="row"
                              className="py-3 pr-4 text-left font-normal"
                            >
                              <span className="flex items-center gap-3">
                                <span
                                  aria-hidden
                                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                  style={{ background: line.colour }}
                                />
                                <span className="text-[13.5px] text-ink/85">
                                  {line.label}
                                </span>
                                <span className="hidden font-mono text-[10px] text-faint sm:inline">
                                  {line.note}
                                </span>
                              </span>
                            </th>
                            <td className="numeric py-3 text-right font-mono text-[12.5px] text-ink/80 tabular-nums">
                              {money(amount, 4)}
                            </td>
                            <td className="numeric py-3 text-right font-mono text-[12.5px] text-dim tabular-nums">
                              {percent(share, 2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Caption>
                  A token bill can show one of these lines. Inference is{" "}
                  <span className="text-ink">
                    {percent(
                      composition.total > 0
                        ? composition.totals.inference / composition.total
                        : null,
                      2,
                    )}
                  </span>{" "}
                  of what this slice actually cost. Human intervention is{" "}
                  <span className="text-ink">
                    {percent(
                      composition.total > 0
                        ? composition.totals.intervention / composition.total
                        : null,
                      2,
                    )}
                  </span>
                  , and it only appears once something meters the delivery side:
                  those minutes are spent precisely on the{" "}
                  {metrics.interventions} units that scored under tau.
                </Caption>
              </Panel>
            </Rise>

            {/* ---------------- failing checks ---------------- */}

            <Rise>
              <Panel
                title="Where completion leaked"
                aside={
                  <span className="numeric font-mono text-[11px] text-dim tabular-nums">
                    {metrics.interventions} of {metrics.count}{" "}
                    {plural(metrics.count, "unit", "units")} under tau
                  </span>
                }
              >
                {metrics.failingChecks.length === 0 ? (
                  <p className="px-5 py-8 text-[13.5px] text-dim sm:px-6">
                    No unit in this slice scored under tau, so no check failed.
                  </p>
                ) : (
                  <ol className="px-5 py-2 sm:px-6">
                    {metrics.failingChecks.map((check, i) => {
                      const share =
                        metrics.interventions > 0
                          ? check.count / metrics.interventions
                          : 0;
                      return (
                        <li
                          key={check.id}
                          className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-hair-soft py-4 last:border-b-0 sm:gap-x-6"
                        >
                          <span className="font-mono text-[11px] text-faint">
                            {pad(i + 1)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-mono text-[12.5px] text-ink">
                              {check.id}
                            </span>
                            <span className="mt-1 block truncate text-[12.5px] text-dim">
                              {descriptions.get(check.id) ??
                                "no description recorded"}
                            </span>
                            <span
                              aria-hidden
                              className="mt-2.5 block h-1 w-full overflow-hidden rounded-full bg-white/6"
                            >
                              <span
                                className="block h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
                                style={{
                                  width: `${(share * 100).toFixed(2)}%`,
                                  background: "var(--spectrum)",
                                }}
                              />
                            </span>
                          </span>
                          <span className="numeric text-right font-mono text-[11px] text-dim tabular-nums">
                            {check.count} {plural(check.count, "unit", "units")}
                            <span className="mt-1 block text-faint">
                              {check.weight.toFixed(2)} weight lost
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}

                <Caption>
                  The intervention rate arrives with its diagnosis attached:
                  failures localise to named checks, so the ranking above is the
                  answer to which single check to harden first. Nothing here is
                  a judgement about the agent. It is the definition of done
                  saying which clause it could not satisfy.
                </Caption>
              </Panel>
            </Rise>

            {/* ---------------- the unit table ---------------- */}

            <section className="min-w-0">
              <div className="relative">
                <TextScrim />
                <div className="relative flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="label">Units · the whole slice</h2>
                  <span className="numeric font-mono text-[11px] text-dim tabular-nums">
                    {units.length} {plural(units.length, "row", "rows")} ·
                    ledger order
                  </span>
                </div>

                <p className="over-stage relative mt-3 max-w-[78ch] font-mono text-[10.5px] leading-relaxed text-faint">
                  Expand a row for the checks that produced V, the evidence
                  string each one recorded, and the before and after file counts
                  the workspace captured. Rows that minted nothing are marked in
                  red: those are atomic units that came in under tau, where
                  partial completion is worth nothing by declaration. Their cost
                  per quirq reads n/a because the calculus leaves it undefined
                  at Q = 0 rather than calling it infinite.
                </p>
              </div>

              {/* Not wrapped in Rise: whileInView needs a quarter of the element
                  on screen at once, which a long table can never satisfy, so a
                  wrapped table would simply stay invisible. */}
              <div
                tabIndex={0}
                role="region"
                aria-label="Settled units"
                className="mt-5 overflow-x-auto rounded-2xl border border-hair bg-black/70 backdrop-blur-xl"
              >
                <table className="w-full min-w-[940px] border-collapse text-left">
                  <caption className="sr-only">
                    Every settled unit in the current slice: verified
                    completion, budgeted value, minted quirqs, and all-in cost.
                    Each row expands to its individual checks and captured
                    snapshots.
                  </caption>
                  <thead>
                    <tr className="border-b border-hair bg-white/[0.03]">
                      <Th className="w-[36%]">Unit</Th>
                      <Th>Kind</Th>
                      <Th>Settlement</Th>
                      <Th align="right">Verified V</Th>
                      <Th align="right">Budget B</Th>
                      <Th align="right">Minted Q</Th>
                      <Th align="right">All-in cost</Th>
                      <Th align="right">Cost per Q</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Keyed by row rather than by unit id: minting the same
                        demo task twice writes two records under one id, and
                        two React keys or two aria-controls targets with the
                        same value is a broken table. The open set still keys
                        on the id, so duplicates disclose together as before. */}
                    {units.map((unit, i) => (
                      <UnitRow
                        key={`${i}-${unit.id}`}
                        unit={unit}
                        index={i}
                        detailId={`${uid}-${i}-${unit.id}`}
                        expanded={open.has(unit.id)}
                        onToggle={() => toggle(unit.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </Beat>

      {/* ---------------- 4 · centred and fully lit: the chain ---------------- */}

      <Beat index={4} id="dashboard-chain">
        <div className="over-stage relative flex flex-col items-center text-center">
          <GlassPool scrimClassName="mx-auto max-w-3xl">
            <Marker>04 · the chain</Marker>

            <h2 className="display mt-7 max-w-[18ch]">
              <Reveal delay={0.05}>Totals are forgeable.</Reveal>
              <Reveal delay={0.13}>
                <GlassText className="whitespace-nowrap">
                  The chain is not.
                </GlassText>
              </Reveal>
            </h2>

            <Rise delay={0.24}>
              <p className="lede mx-auto mt-7 text-center">
                Rewrite one number and the totals move with it. The digests do
                not: they are recomputed here, from genesis, every time.
              </p>
            </Rise>
          </GlassPool>
        </div>

        {!empty && (
          <Rise className="mt-12">
            <ChainPanel
              chain={chain}
              entries={entries}
              tampered={tampered}
              onTamper={() => setTampered(true)}
              onReset={() => setTampered(false)}
              forge={forge}
            />
          </Rise>
        )}

        <Rise className="relative mt-14 flex flex-col items-center text-center">
          <TextScrim className="mx-auto max-w-2xl" />
          <p className="label relative">Produce one of these from your own agents</p>
          <p className="over-stage relative mt-4 font-mono text-[13px] text-ink">
            curl -fsSL quirq.ai/install | sh
          </p>
          <p className="over-stage relative mt-3 max-w-[62ch] font-mono text-[10.5px] leading-relaxed text-faint">
            The CLI writes the same JSONL hash chain this page just verified.
            Any ledger it produces reads here identically, because the dashboard
            only ever runs the engine over records.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <ActionLink href="/whitepaper" tone="ghost">
              Read the whitepaper
            </ActionLink>
            <ActionLink href="/research/the-quirq-calculus" tone="ghost">
              The full calculus
            </ActionLink>
          </div>
        </Rise>
      </Beat>
    </InstanceProvider>
  );
}

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function EmptyLedger() {
  return (
    <Rise className="mx-auto mt-12 max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-hair bg-black/70 px-5 py-9 backdrop-blur-xl sm:px-6">
        <p className="label text-[9.5px]">Your ledger · nothing yet</p>
        <p className="mt-4 max-w-[56ch] text-[14.5px] leading-[1.65] text-ink/85">
          Nothing has been minted in this browser. The demo settles one unit
          against a simulated workspace and appends it to a chain in this
          tab&rsquo;s storage. Once it has, every panel on this page reads your
          entries the way it reads the sample.
        </p>
        <p className="mt-3 max-w-[62ch] font-mono text-[10.5px] leading-relaxed text-faint">
          Local only. Nothing about your ledger is sent anywhere, and clearing
          site data removes it.
        </p>
        <div className="mt-8">
          <ActionLink href="/demo">Mint one</ActionLink>
        </div>
      </div>
    </Rise>
  );
}

function ProvenanceCell({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-black/80 px-5 py-6 sm:px-6">
      <p className="label text-[9.5px]">{label}</p>
      {mono !== undefined && (
        <p className="mt-3 font-mono text-[11px] leading-[1.7] text-dim">
          {mono}
        </p>
      )}
      <p className="mt-3 text-[13.5px] leading-[1.65] text-ink/80">{children}</p>
    </div>
  );
}

/**
 * Both sources are staged worlds, but they are staged differently, and one
 * caption for both would be the exact blur the whitepaper spends a chapter
 * refusing. Say which is which.
 *
 * Stacked rather than three across: this band now sits in beat 1's 60% column,
 * where three columns of prose would be three columns of one word each.
 */
function Provenance({
  source,
  count,
  kinds,
  provenance,
  windowLabel,
}: {
  source: Source;
  count: number;
  kinds: ReadonlyArray<readonly [string, number]>;
  provenance: string[];
  windowLabel: string;
}) {
  const sample = source === "sample";

  return (
    <Rise className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-hair">
        <div className="grid gap-px bg-white/6">
          <ProvenanceCell label="What this is">
            {sample ? (
              <>
                A scripted agent working a scratch workspace: files really
                written, really hashed before and after, checks really evaluated
                against the after-state. The whitepaper calls this mock mode. It
                validates the machinery. It cannot validate any claim about how
                real agents perform.
              </>
            ) : (
              <>
                What you minted at{" "}
                <a
                  href="/demo"
                  className="text-dim underline underline-offset-4"
                >
                  the demo
                </a>
                , in this browser. Staged there: three files and the worker that
                edits them, because there is no repo and no model behind it.
                Real: the SHA-256 hashing, the definition of done evaluated
                against the captured after-state, the scoring, the mint, and
                this chain. Same engine the CLI runs.
              </>
            )}
          </ProvenanceCell>

          <ProvenanceCell
            label="Provenance"
            mono={
              provenance.length > 0
                ? provenance.join(" / ")
                : "no provenance recorded"
            }
          >
            {sample ? (
              <>
                Compute seconds are metered. Inference token counts are declared
                by the runner, not observed, so every record carries its own
                provenance and says so.
              </>
            ) : (
              <>
                The sample was produced by the CLI against a scratch workspace
                on a machine. These records were produced by a simulated
                workspace inside this tab, so read their cost lines as
                illustration: no tokens were spent and no seconds were metered.
                The hashing and the chain are not illustration.
              </>
            )}
          </ProvenanceCell>

          <ProvenanceCell label="Window" mono={windowLabel}>
            {sample ? (
              <>
                {count} units settled across{" "}
                {kinds.map(([name, n]) => `${n} ${name}`).join(" · ")}. One
                workspace, three owners, one chain.
              </>
            ) : (
              <>
                {count} {plural(count, "unit", "units")} settled in this
                browser, held in localStorage and sent nowhere. One reader, one
                chain, verified below from genesis.
              </>
            )}
          </ProvenanceCell>
        </div>
      </div>
    </Rise>
  );
}

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onPress}
      className={cn(
        PILL,
        active
          ? "focus-on-ink bg-ink text-void"
          : "border border-hair bg-black/40 text-dim backdrop-blur-md hover:border-ink/30 hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

function Tile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-black/80 px-5 py-6 text-left">
      <p className="label text-[9.5px]">{label}</p>
      <p className="numeric mt-3.5 font-mark text-[clamp(23px,2.7vw,34px)] font-semibold text-ink tabular-nums">
        {value}
      </p>
      <p className="mt-2.5 font-mono text-[10px] leading-relaxed text-faint">
        {note}
      </p>
    </div>
  );
}

function Th({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 font-mono text-[9.5px] font-medium tracking-[0.14em] text-faint uppercase whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

const CELL = "px-4 font-mono text-[12px] tabular-nums whitespace-nowrap";

function UnitRow({
  unit,
  index,
  detailId,
  expanded,
  onToggle,
}: {
  unit: SettledUnit;
  index: number;
  detailId: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const blank = unit.Q === 0;
  const snapshots = readSnapshots(unit.snapshots);

  return (
    <>
      <tr
        className={cn(
          "h-[54px] border-b border-hair-soft",
          blank ? "bg-spec-red/[0.06]" : "hover:bg-white/[0.02]",
        )}
      >
        <td className="px-4">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={detailId}
            className="flex w-full items-center gap-3 text-left"
          >
            <svg
              width="9"
              height="9"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className={cn(
                "shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                blank ? "text-spec-red" : "text-faint",
                expanded && "rotate-90",
              )}
            >
              <path
                d="M4 2L8.5 6L4 10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-mono text-[11px] text-faint">
              {pad(index)}
            </span>
            <span className="min-w-0 truncate text-[13.5px] text-ink/90">
              {unit.title}
            </span>
          </button>
        </td>
        <td className={cn(CELL, "text-dim")}>{unit.kind ?? "unattributed"}</td>
        <td className={cn(CELL, "text-dim")}>{unit.settlement}</td>
        <td
          className={cn(
            CELL,
            "numeric text-right",
            blank ? "text-spec-red" : "text-ink/85",
          )}
        >
          {percent(unit.V, 0)}
        </td>
        <td className={cn(CELL, "numeric text-right text-dim")}>
          {quirqs(unit.potential)}
        </td>
        <td
          className={cn(
            CELL,
            "numeric text-right",
            blank ? "text-spec-red" : "text-ink",
          )}
        >
          {quirqs(unit.Q)}
        </td>
        <td className={cn(CELL, "numeric text-right text-ink/70")}>
          {money(unit.cost)}
        </td>
        <td
          className={cn(
            CELL,
            "numeric text-right",
            blank ? "text-spec-red" : "text-ink/70",
          )}
        >
          {money(unit.costPerQuirq, 4)}
        </td>
      </tr>

      {/* Rendered always and hidden with the attribute rather than unmounted:
          aria-controls must point at an element that exists even while the
          disclosure is closed. */}
      <tr id={detailId} hidden={!expanded} className="border-b border-hair-soft">
        <td colSpan={8} className="bg-black/75 px-4 py-6 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="label text-[9.5px]">
                Definition of done · {unit.checks.length} checks
              </p>
              <ul className="mt-4 space-y-3.5">
                {unit.checks.map((check) => (
                  <li key={check.id} className="flex gap-3">
                    {/* Case is the second channel after colour: a failed check
                        should be findable by scanning, not only by hue. */}
                    <span
                      className={cn(
                        "mt-px w-11 shrink-0 font-mono text-[10px] tracking-[0.1em]",
                        check.passed ? "text-spec-green" : "text-spec-red",
                      )}
                    >
                      {check.passed ? "pass" : "FAIL"}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[12px] text-ink">
                        {check.id}{" "}
                        <span className="text-faint">
                          w {check.weight.toFixed(2)}
                        </span>
                      </span>
                      {check.description && (
                        <span className="mt-1 block text-[12.5px] text-dim">
                          {check.description}
                        </span>
                      )}
                      {check.evidence && (
                        <span
                          className={cn(
                            "mt-1.5 block font-mono text-[10.5px] leading-relaxed break-words",
                            check.passed ? "text-faint" : "text-spec-red",
                          )}
                        >
                          {check.evidence}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="numeric mt-5 border-t border-hair-soft pt-4 font-mono text-[10.5px] leading-relaxed text-dim tabular-nums">
                {unit.passedWeight.toFixed(2)} of {unit.weightSum.toFixed(2)}{" "}
                weight passed, so V = {unit.V.toFixed(2)}. Settlement is{" "}
                {unit.settlement} at tau {unit.tau.toFixed(2)}, which mints{" "}
                {quirqs(unit.Q)} of a {quirqs(unit.potential)} budget.
              </p>
            </div>

            <div>
              <p className="label text-[9.5px]">Captured state</p>
              {snapshots ? (
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                  <Field
                    term="Before"
                    value={`${snapshots.before.count} files · ${snapshots.before.bytes} bytes`}
                  />
                  <Field
                    term="After"
                    value={`${snapshots.after.count} files · ${snapshots.after.bytes} bytes`}
                  />
                  <Field
                    term="Added"
                    value={snapshots.diff.added.join(", ") || "none"}
                  />
                  <Field
                    term="Modified"
                    value={snapshots.diff.modified.join(", ") || "none"}
                    tone={snapshots.diff.modified.length > 0 ? "warn" : undefined}
                  />
                  <Field
                    term="Removed"
                    value={snapshots.diff.removed.join(", ") || "none"}
                  />
                  <Field
                    term="Provenance"
                    value={`compute ${snapshots.provenance.compute} · inference ${snapshots.provenance.inference}`}
                  />
                </dl>
              ) : (
                <p className="mt-4 font-mono text-[11px] text-faint">
                  This record carries no snapshots.
                </p>
              )}

              <p className="label mt-6 text-[9.5px]">Cost</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                {COST_LINES.map((line) => (
                  <Field
                    key={line.key}
                    term={line.label}
                    value={money(unit.costBreakdown[line.key], 4)}
                  />
                ))}
              </dl>

              <p className="mt-5 font-mono text-[10.5px] leading-relaxed text-faint">
                {unit.id} · owner {unit.owner}
                {unit.settledAt && ` · settled ${isoDay(unit.settledAt)}`}
              </p>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

function Field({
  term,
  value,
  tone,
}: {
  term: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">
        {term}
      </dt>
      <dd
        className={cn(
          "numeric mt-1 font-mono text-[11px] break-words tabular-nums",
          tone === "warn" ? "text-spec-orange" : "text-ink/80",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The chain panel
 * ------------------------------------------------------------------ */

function ChainPanel({
  chain,
  entries,
  tampered,
  onTamper,
  onReset,
  forge,
}: {
  chain: ChainState;
  entries: LedgerEntry[];
  tampered: boolean;
  onTamper: () => void;
  onReset: () => void;
  forge: Forgery;
}) {
  const reasonId = useId();
  const result = chain.status === "done" ? chain.result : null;
  const broken = result !== null && !result.valid;
  const breakAt = result?.firstBreak ?? null;
  const brokenEntry = breakAt === null ? null : entries[breakAt];
  const brokenResult = breakAt === null ? null : result?.results[breakAt] ?? null;
  const orphaned =
    result === null || breakAt === null ? 0 : result.length - breakAt - 1;

  // A one-entry chain still shows a digest mismatch, but there is no tail for
  // the break to orphan, which is the half of the demonstration that matters.
  const target = forge.entry;

  return (
    <Panel
      title="Hash chain · recomputed in this browser"
      aside={
        <span
          className={cn(
            "flex items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[9.5px] tracking-[0.08em] uppercase",
            chain.status === "pending" && "bg-white/8 text-dim",
            chain.status === "error" && "bg-spec-orange/10 text-spec-orange",
            result?.valid && "bg-spec-green/10 text-spec-green",
            broken && "bg-spec-red/10 text-spec-red",
          )}
        >
          {result?.valid ? (
            <span className="pulse-dot" />
          ) : (
            <span
              aria-hidden
              className={cn(
                "h-[7px] w-[7px] shrink-0 rounded-full",
                broken
                  ? "bg-spec-red"
                  : chain.status === "error"
                    ? "bg-spec-orange"
                    : "bg-dim",
              )}
            />
          )}
          {chain.status === "pending" && "verifying"}
          {chain.status === "error" && "unavailable"}
          {result?.valid && "verified"}
          {broken && "broken"}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-px bg-white/6 md:grid-cols-4">
        <ChainStat label="Entries" value={String(entries.length)} />
        <ChainStat
          label="Head hash"
          value={result ? shortHash(result.head) : "…"}
        />
        <ChainStat
          label="Recomputed in"
          value={
            chain.status === "done" ? `${Math.max(chain.ms, 0).toFixed(1)} ms` : "…"
          }
        />
        <ChainStat
          label="First break"
          value={
            result === null
              ? "…"
              : breakAt === null
                ? "none"
                : `entry ${pad(breakAt)}`
          }
          tone={breakAt === null ? undefined : "bad"}
        />
      </div>

      <div className="px-5 pt-6 sm:px-6">
        <div aria-hidden className="flex h-7 w-full gap-px">
          {entries.map((entry, i) => {
            const verdict = result?.results[i];
            return (
              <span
                key={entry.seq}
                className={cn(
                  "h-full flex-1 rounded-[1px]",
                  verdict === undefined
                    ? "bg-white/10"
                    : verdict.ok
                      ? "bg-spec-green/70"
                      : "bg-spec-red/80",
                )}
              />
            );
          })}
        </div>

        <p className="mt-4 max-w-[80ch] text-[13.5px] leading-[1.65] text-ink/80">
          {chain.status === "pending" &&
            `Recomputing ${entries.length} ${plural(entries.length, "link", "links")} from genesis.`}
          {chain.status === "error" &&
            `The chain could not be verified here: ${chain.message}. Web Crypto needs a secure context, so this panel is inert over plain http.`}
          {result?.valid &&
            `All ${result.length} ${plural(result.length, "link", "links")} recompute to the hashes stored beside them. Nothing in this history has been edited since it was written, and you did not have to take our word for that: the digests were computed in this tab from the records on this page.`}
          {broken && brokenEntry && (
            <>
              Entry {pad(breakAt ?? 0)} no longer hashes to its stored value.
              Because every link commits to the one before it, the {orphaned}{" "}
              {plural(orphaned, "entry", "entries")} after it{" "}
              {plural(orphaned, "is", "are")} orphaned too. This is what
              tamper-evidence means: the forgery is not hidden, it is loud.
            </>
          )}
        </p>

        {broken && brokenEntry && brokenResult && target && (
          <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-hair-soft pt-5 sm:grid-cols-2">
            <Field
              term="Broken entry"
              value={`${brokenEntry.record.id} · ${brokenEntry.record.title}`}
            />
            <Field
              term="Edit"
              value={`record.Q ${quirqs(target.record.Q)} rewritten to ${quirqs(brokenEntry.record.Q)}`}
              tone="warn"
            />
            <Field term="Stored hash" value={shortHash(brokenResult.hash)} />
            <Field
              term="Recomputed hash"
              value={shortHash(brokenResult.recomputed)}
              tone="warn"
            />
            <Field
              term="Verdicts"
              value={`seq ${brokenResult.seqOk ? "ok" : "wrong"} · link ${
                brokenResult.linkOk ? "ok" : "orphaned"
              } · digest ${brokenResult.hashOk ? "ok" : "mismatch"}`}
            />
            <Field
              term="Orphaned tail"
              value={`entries ${pad((breakAt ?? 0) + 1)} to ${pad(result.length - 1)}`}
            />
          </dl>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onTamper}
            disabled={tampered || target === null}
            aria-describedby={target === null ? reasonId : undefined}
            className={cn(
              PILL,
              "border border-hair text-dim hover:border-spec-red/50 hover:text-spec-red disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hair disabled:hover:text-dim",
            )}
          >
            {target === null
              ? "Tamper with an entry"
              : `Tamper with entry ${pad(forge.index)}`}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={!tampered}
            className={cn(
              PILL,
              "border border-hair text-dim hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hair disabled:hover:text-dim",
            )}
          >
            Reset the ledger
          </button>
          {target === null && (
            <p
              id={reasonId}
              className="font-mono text-[10.5px] leading-relaxed text-faint"
            >
              Needs two entries: one link to break, and a tail for the break to
              orphan.
            </p>
          )}
        </div>
      </div>

      <Caption>
        {target === null ? (
          <>
            Nothing above is stored as a verdict. The {entries.length}{" "}
            {plural(entries.length, "link", "links")} here{" "}
            {plural(entries.length, "was", "were")} recomputed from genesis in
            this tab. Settle a second unit and the tamper control turns on:
            rewriting one number then breaks that entry&rsquo;s digest and
            orphans everything chained after it.
          </>
        ) : (
          <>
            The button rewrites one number in memory: {target.record.id}{" "}
            {target.record.Q === 0 ? (
              <>
                scored {percent(target.record.V, 0)} against an atomic
                settlement, so it minted nothing. Tampering makes it claim its
                full {quirqs(target.record.potential)} budget
              </>
            ) : (
              <>
                minted {quirqs(target.record.Q)}. Tampering makes it claim{" "}
                {quirqs(forge.claim)}
              </>
            )}
            , and the metrics above move with it, because totals are forgeable.
            The chain is what is not. It covers all {entries.length} entries
            whatever the filter says.
          </>
        )}
      </Caption>
    </Panel>
  );
}

function ChainStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "bad";
}) {
  return (
    <div className="bg-black/80 px-5 py-5">
      <p className="label text-[9.5px]">{label}</p>
      <p
        className={cn(
          "numeric mt-2.5 font-mono text-[13px] break-all tabular-nums",
          tone === "bad" ? "text-spec-red" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}
