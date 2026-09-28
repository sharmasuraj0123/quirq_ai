"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import styles from "./machinespeed.module.css";

/**
 * The example quirq workspace under the hero: three views (ops lead, founder,
 * CTO) of one invented company. Everything here is illustrative and says so in
 * the note beneath it.
 *
 * Liveness is simulated, but paced like a real log: the clock ticks in real
 * seconds, events arrive at irregular intervals (bursts, then quiet), their
 * numbers vary, and the same kind of event never fires twice in a row. The
 * first render is fixed data, so server and client markup match; nothing
 * moves when the reader prefers reduced motion.
 */

type View = "ops" | "founder" | "cto";
type Kind = "g" | "b" | "a" | "p";
type Line = { kind: Kind; text: string; strong?: string; agent?: string };
type LogItem = Line & { id: number; t: number };
type Tone = "amber" | "blue" | "pink";
type Decision = {
  id: number;
  who: string;
  title: string;
  body: string;
  options: [label: string, act: string][];
  tone?: Tone;
  done?: string;
  leaving?: boolean;
};

const VIEWS: { id: View; label: string; ws: string; crumb: string; hint: string }[] = [
  { id: "ops", label: "Ops lead", ws: "northwind-ops", crumb: "control room", hint: "Try the approve buttons." },
  { id: "founder", label: "SaaS founder", ws: "lumen-hq", crumb: "company brief", hint: "Filter the brief by team, or make a call." },
  { id: "cto", label: "CTO", ws: "northwind-ops", crumb: "governance", hint: "Click a policy cell, a run, or an alert." },
];

const ICON: Record<Kind, string> = { g: "✓", b: "↺", a: "!", p: "⊘" };

/** 06:05:12, in seconds since midnight. */
const START = 6 * 3600 + 5 * 60 + 12;

const pad = (n: number) => String(n).padStart(2, "0");
const clockText = (s: number) => {
  const t = s % 86400;
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`;
};
const int = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const fmt = (n: number) => n.toLocaleString("en-US");

// ---------------------------------------------------------------- ops feed

const INITIAL_LOG: LogItem[] = [
  { id: 0, t: START - 247, kind: "g", text: "order-recovery matched ", strong: "412 orders", },
  { id: 1, t: START - 203, kind: "g", text: "fixed 2 payment mismatches before customers saw them" },
  { id: 2, t: START - 161, kind: "a", text: "SKU-1148 stock covers 6 days. ", strong: "Reorder needs approval." },
  { id: 3, t: START - 118, kind: "b", text: "step 3 routed to a smaller model. Output checks passed." },
  { id: 4, t: START - 52, kind: "a", text: "month-end-close drafted the board pack. ", strong: "Waiting for CFO sign-off." },
  { id: 5, t: START - 9, kind: "p", text: "blocked a write to payroll. ", strong: "Outside this agent's scope." },
];
// The first line reads "matched 412 orders across Shopify, Stripe and NetSuite".
const FIRST_TAIL = " across Shopify, Stripe and NetSuite";

const COMPANIES = ["Acme Logistics", "Brightline", "Harbor & Co", "Kestrel Labs", "Oakridge Supply", "Pinewell", "Tandem Freight"];

/** Weighted event templates; each call draws fresh numbers. */
const FEED: { weight: number; make: () => Line }[] = [
  { weight: 5, make: () => ({ agent: "order-recovery", kind: "g", text: `order-recovery reconciled ${int(3, 19)} new orders` }) },
  { weight: 3, make: () => ({ agent: "order-recovery", kind: "g", text: `order-recovery fixed an address before label print · #${int(88214, 88990)}` }) },
  { weight: 2, make: () => ({ agent: "order-recovery", kind: "b", text: `carrier API slow (${fmt(int(900, 2600))}ms), retried with backoff` }) },
  { weight: 2, make: () => ({ agent: "order-recovery", kind: "g", text: `order-recovery rebooked ${int(1, 4)} shipments after a 3PL delay` }) },
  { weight: 4, make: () => ({ agent: "inbound-qualifier", kind: "g", text: `inbound-qualifier scored ${COMPANIES[int(0, COMPANIES.length - 1)]} ${int(58, 93)}/100` }) },
  { weight: 2, make: () => ({ agent: "inbound-qualifier", kind: "g", text: "inbound-qualifier booked a meeting · brief attached" }) },
  { weight: 2, make: () => ({ agent: "inbound-qualifier", kind: "g", text: `inbound-qualifier merged ${int(2, 3)} duplicate HubSpot records` }) },
  { weight: 3, make: () => ({ agent: "inbound-qualifier", kind: "b", text: `step ${int(2, 4)} routed to a smaller model · output checks passed` }) },
  { weight: 1, make: () => {
    const total = int(40, 130);
    return { agent: "vendor-review", kind: "a", text: `vendor-review shadow run matched ${total - int(1, 4)} of ${total} invoices` };
  } },
  { weight: 2, make: () => ({ agent: "month-end-close", kind: "b", text: `month-end-close linked sources for ${int(3, 12)} variances` }) },
  { weight: 4, make: () => ({ kind: "g", text: `run record written · ${int(3, 9)} steps · ${int(6, 71)}s` }) },
  { weight: 0.6, make: () => ({ agent: "inbound-qualifier", kind: "p", text: "blocked email to a named account. ", strong: "Owner approval required." }) },
];
const FEED_TOTAL = FEED.reduce((sum, f) => sum + f.weight, 0);

/** Bursts, steady traffic and quiet stretches, in roughly real proportions. */
const nextDelay = () => {
  const r = Math.random();
  if (r < 0.22) return int(450, 1300);
  if (r < 0.8) return int(2000, 5200);
  return int(6500, 12000);
};

const OPS_AGENTS = [
  { name: "order-recovery", state: "running", scopes: ["shopify:read", "stripe:read"], gate: "netsuite:write · approval", runs: 1284 },
  { name: "month-end-close", state: "waiting", scopes: ["ledger:read", "billing:read"], gate: "board-pack:send · approval", runs: 37 },
  { name: "inbound-qualifier", state: "running", scopes: ["hubspot:write", "calendar:write"], runs: 406 },
  { name: "vendor-review", state: "in sprint", scopes: ["day 9 of 14"], runs: 0 },
] as const;

const OPS_DECISIONS: Omit<Decision, "id">[] = [
  { who: "order-recovery → ops lead", title: "Reorder SKU-1148 · $12,400", body: "Supplier price held until 14:00. Covers the next 30 days.", options: [["Approve", "Approved"], ["Send back", "Sent back"]] },
  { who: "month-end-close → CFO", title: "Send August board pack", body: "2 variances flagged and explained. 14 pages, ready to send.", options: [["Approve", "Approved"], ["Review", "Sent back"]] },
];
const OPS_MORE: (() => Omit<Decision, "id">)[] = [
  () => ({ who: "inbound-qualifier → account owner", title: `Send first message · ${COMPANIES[int(0, COMPANIES.length - 1)]}`, body: "Strategic account. One touch drafted, no sequence.", options: [["Approve", "Approved"], ["Edit", "Sent back"]] }),
  () => {
    const amount = int(2600, 4800);
    return { who: "order-recovery → ops lead", title: `Refund $${fmt(amount)} · order #${int(88214, 88990)}`, body: "Double charge confirmed in Stripe. Over the $2,500 line.", options: [["Approve", "Approved"], ["Send back", "Sent back"]] };
  },
  () => ({ who: "order-recovery → ops lead", title: `Reorder SKU-${int(1100, 1299)} · $${fmt(int(4, 19) * 1000 + int(1, 9) * 100)}`, body: `Stock covers ${int(4, 8)} days at the current sell-through.`, options: [["Approve", "Approved"], ["Send back", "Sent back"]] }),
];

// ---------------------------------------------------------------- founder

type Team = "BD" | "Marketing" | "Ops" | "Support";
const TEAMS: Team[] = ["BD", "Marketing", "Ops", "Support"];

const BRIEF: { team: Team; label: string; value: string; note: string; up?: boolean }[] = [
  { team: "BD", label: "Pipeline added", value: "$184k", note: "+22% on last week", up: true },
  { team: "BD", label: "Meetings booked", value: "14", note: "9 from accounts you didn't have to research" },
  { team: "Marketing", label: "Content shipped", value: "5 posts", note: "2 drafts waiting on your edit" },
  { team: "Marketing", label: "Inbound demo requests", value: "31", note: "+9 after Tuesday's launch post", up: true },
  { team: "Ops", label: "Invoices matched", value: "212", note: "2 disputes flagged, both under $500" },
  { team: "Support", label: "Ticket backlog", value: "11", note: "down from 46 a month ago", up: true },
  { team: "Support", label: "Accounts showing churn risk", value: "3", note: "usage down 40%+, signals attached" },
];

const FOUNDER_AGENTS: { team: Team; name: string; state: "running" | "waiting"; meta: (c: number) => string[] }[] = [
  { team: "BD", name: "pipeline-builder", state: "running", meta: (c) => [`${c} accounts researched today`, "6 meetings booked"] },
  { team: "Marketing", name: "content-engine", state: "waiting", meta: () => ["3 drafts ready", "waiting for your edit"] },
  { team: "Ops", name: "billing-ops", state: "running", meta: (c) => [`${c} invoices matched`, "2 disputes flagged"] },
  { team: "Support", name: "support-triage", state: "running", meta: (c) => [`${c} tickets handled today`, "81% closed first touch"] },
];
const FOUNDER_START = [38, 212, 74];

const FOUNDER_DECISIONS: Omit<Decision, "id">[] = [
  { who: "pipeline-builder → you", title: "Intro to Northwind Cloud's VP Ops", body: "Strategic account. Warm path through your investor. Draft ready for you to send.", options: [["Send", "Sent"], ["Hold", "Held"]] },
  { who: "content-engine → you", title: "Pick Thursday's launch headline", body: "A: “Close the books in 4 days” · B: “Month-end, without the month”", options: [["A", "Picked A"], ["B", "Picked B"]] },
  { who: "billing-ops → you", title: "Waive $1,900 late fee · Brightline", body: "Customer since 2023, 14 invoices paid on time. Renewal due in 6 weeks.", options: [["Waive", "Waived"], ["Keep", "Kept"]] },
];

// ---------------------------------------------------------------- cto

type Access = "n" | "r" | "rw";
const SYSTEMS = ["Shopify", "Stripe", "NetSuite", "Payroll"];
const INITIAL_POLICY: { agent: string; cells: Access[] }[] = [
  { agent: "order-recovery", cells: ["r", "r", "rw", "n"] },
  { agent: "month-end-close", cells: ["n", "r", "r", "n"] },
  { agent: "inbound-qualifier", cells: ["n", "n", "n", "n"] },
];
const NEXT_ACCESS: Record<Access, Access> = { n: "r", r: "rw", rw: "n" };
const ACCESS_LABEL: Record<Access, string> = { n: "—", r: "read", rw: "rw ⚑" };

type RecTone = "ok" | "blk" | "am";
type RecRow = [string, (string | [RecTone, string])[]];
const RUNS: { time: string; agent: string; what: string; status: string; blocked?: boolean; rows: RecRow[] }[] = [
  {
    time: "06:02", agent: "order-recovery", what: "order #88213 · 6 steps", status: "approved",
    rows: [
      ["trigger", ["stripe.charge.duplicate · payload sha256 3f9a…c1"]],
      ["step 1–3", ["read shopify, stripe, netsuite · ", ["ok", "scope ok"], " · model: small (routed)"]],
      ["step 4", ["decision: refund $3,120 · ", ["am", "over $2,500 line → gate"]]],
      ["step 5", ["approved by ops lead · 06:06 · from phone · 41s"]],
      ["step 6", ["stripe.refund.create · ", ["ok", "ok"], " · netsuite.journal · ", ["ok", "ok"]]],
      ["retention", ["30 days · region eu-west-1 · encrypted at rest"]],
    ],
  },
  {
    time: "06:05", agent: "inbound-qualifier", what: "Acme Logistics · 4 steps", status: "blocked", blocked: true,
    rows: [
      ["trigger", ["hubspot.form.submitted"]],
      ["step 1–3", ["research, score 87/100, draft first message · model: frontier"]],
      ["step 4", ["gmail.send → ", ["blk", "blocked: named account, no owner approval"]]],
      ["result", ["queued for account owner · nothing sent"]],
    ],
  },
  {
    time: "06:04", agent: "month-end-close", what: "August pack · 9 steps", status: "waiting",
    rows: [
      ["trigger", ["schedule · books closed 31 Aug"]],
      ["step 1–7", ["reconcile ledger, billing, spend · read-only · 2 variances explained, sources linked"]],
      ["step 8", ["board-pack.send → ", ["am", "gate: CFO sign-off"]]],
      ["step 9", ["pending"]],
    ],
  },
];

const CTO_ALERTS: Omit<Decision, "id">[] = [
  { tone: "amber", who: "order-recovery · error rate", title: "2.1% errors since 05:40", body: "Above the 1% threshold. Carrier API timeouts; retries are holding and no orders were lost.", options: [["Acknowledge", "Acknowledged"], ["Page on-call", "Paged on-call"]] },
  { tone: "pink", who: "inbound-qualifier · scope request", title: "Wants gmail:send without review", body: "Would let it email unowned leads directly. Needs security sign-off before it applies.", options: [["Deny", "Denied"], ["Grant with gate", "Granted with an approval gate"]] },
  { tone: "blue", who: "2 agents · model change", title: "Model snapshot retires 30 Sep", body: "Replacement staged. Evals pass at 98.6% against 99.1% today.", options: [["Approve switch", "Switch approved"], ["Hold", "Held"]] },
];
const CTO_MORE: Omit<Decision, "id">[] = [
  { tone: "amber", who: "netsuite · credentials", title: "API token expires in 5 days", body: "Used by order-recovery and month-end-close.", options: [["Rotate now", "Rotation started"], ["Remind me", "Snoozed 3 days"]] },
  { tone: "blue", who: "vendor-review · go-live", title: "Shadow run passed 3 days straight", body: "Matched 97.8% of invoices against finance's own close. Ready to switch on.", options: [["Go live", "Scheduled go-live"], ["One more week", "Extended shadow run"]] },
];

// ---------------------------------------------------------------- component

let seq = 1000;
const withIds = (items: Omit<Decision, "id">[]) => items.map((d) => ({ ...d, id: seq++ }));

export function ControlRoom() {
  const room = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("ops");

  const clock = useRef(START);
  const [now, setNow] = useState(START);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  // --- log and agent counters
  const [log, setLog] = useState<LogItem[]>(INITIAL_LOG);
  const [runs, setRuns] = useState<Record<string, number>>(() => Object.fromEntries(OPS_AGENTS.map((a) => [a.name, a.runs])));
  const [founderCounts, setFounderCounts] = useState(FOUNDER_START);

  const pushLog = useCallback((line: Line) => {
    const t = clock.current;
    setLog((items) => [...items, { ...line, t, id: seq++ }].slice(-7));
    if (line.agent) setRuns((r) => ({ ...r, [line.agent!]: (r[line.agent!] ?? 0) + 1 }));
  }, []);

  // --- decision queues
  const [opsQueue, setOpsQueue] = useState<Decision[]>(() => withIds(OPS_DECISIONS));
  const [founderQueue, setFounderQueue] = useState<Decision[]>(() => withIds(FOUNDER_DECISIONS));
  const [ctoQueue, setCtoQueue] = useState<Decision[]>(() => withIds(CTO_ALERTS));
  const ctoMore = useRef([...CTO_MORE]);

  const decide = (
    setQueue: React.Dispatch<React.SetStateAction<Decision[]>>,
    card: Decision,
    act: string,
    refill?: () => Omit<Decision, "id"> | undefined,
  ) => {
    setQueue((q) => q.map((d) => (d.id === card.id ? { ...d, done: `✓ ${act} · logged ${clockText(clock.current)}` } : d)));
    pushLog({ kind: "g", text: `${card.title} · `, strong: `${act.toLowerCase()} by a person` });
    later(() => {
      setQueue((q) => q.map((d) => (d.id === card.id ? { ...d, leaving: true } : d)));
      later(() => {
        const next = refill?.();
        setQueue((q) => [...q.filter((d) => d.id !== card.id), ...(next ? [{ ...next, id: seq++ }] : [])]);
      }, 500);
    }, 1800);
  };

  // --- the simulation: a real-seconds clock and an irregular event stream
  useEffect(() => {
    const pending = timers.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tick = setInterval(() => {
      clock.current += 1;
      setNow(clock.current);
    }, 1000);

    let last = -1;
    const fire = () => {
      let pick = 0;
      do {
        let r = Math.random() * FEED_TOTAL;
        pick = FEED.findIndex((f) => (r -= f.weight) < 0);
      } while (pick === last);
      last = pick;
      pushLog(FEED[pick].make());

      // Other teams keep working whether or not anyone is looking.
      if (Math.random() < 0.55) {
        setFounderCounts(([a, b, c]) => [a + int(0, 1), b + int(0, 3), c + int(0, 2)]);
      }
      // Now and then a new decision lands on its own.
      if (Math.random() < 0.07) {
        setOpsQueue((q) => (q.filter((d) => !d.done).length < 3 ? [...q, { ...OPS_MORE[int(0, OPS_MORE.length - 1)](), id: seq++ }] : q));
      }
      if (Math.random() < 0.04 && ctoMore.current.length) {
        const next = ctoMore.current.shift()!;
        setCtoQueue((q) => [...q, { ...next, id: seq++ }]);
      }
      later(fire, nextDelay());
    };
    later(fire, int(900, 1800));

    return () => {
      clearInterval(tick);
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, [later, pushLog]);

  // --- founder brief filter
  const [teamFilter, setTeamFilter] = useState<Team | null>(null);

  // --- cto: policy, runs, export
  const [policy, setPolicy] = useState(INITIAL_POLICY);
  const [staged, setStaged] = useState(0);
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));
  const [exported, setExported] = useState(false);

  const cycle = (row: number, col: number) => {
    setPolicy((p) => p.map((r, ri) => (ri === row ? { ...r, cells: r.cells.map((c, ci) => (ci === col ? NEXT_ACCESS[c] : c)) } : r)));
    setStaged((n) => n + 1);
  };

  const toggleRun = (i: number) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const glow = (event: MouseEvent<HTMLDivElement>) => {
    const el = room.current;
    if (!el || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((event.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((event.clientY - r.top) / r.height) * 100}%`);
  };

  const active = VIEWS.find((v) => v.id === view)!;
  const pendingOf = (q: Decision[]) => q.filter((d) => !d.done).length;

  return (
    <div className={styles.roomWrap}>
      <div
        ref={room}
        className={styles.room}
        id="room"
        role="group"
        aria-label="Example quirq workspace showing running agents, an activity log and requests for a person"
        onMouseMove={glow}
      >
        <div className={styles.roomBar}>
          <span className={styles.crumbs}>
            <span>quirq</span>
            <span>/</span>
            <b>{active.ws}</b>
            <span>/</span>
            <span>{active.crumb}</span>
          </span>
          <div className={styles.views} role="tablist" aria-label="Choose a view">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                id={`room-tab-${v.id}`}
                aria-controls="room-panel"
                aria-selected={view === v.id}
                onClick={() => setView(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <span className={styles.live}>
            <i aria-hidden />
            Live · <span>{clockText(now)}</span>
          </span>
        </div>

        <div key={view} id="room-panel" className={styles.roomView} role="tabpanel" aria-labelledby={`room-tab-${view}`}>
          {view === "ops" && (
            <div className={styles.roomGrid}>
              <div className={styles.col}>
                <div className={styles.colH}><span className={styles.k}>Agents</span><span className={styles.n}>{OPS_AGENTS.length}</span></div>
                {OPS_AGENTS.map((a) => (
                  <div key={a.name} className={styles.agent}>
                    <div className={styles.agentTop}><b>{a.name}</b><State state={a.state} /></div>
                    <div className={styles.scopes}>
                      {a.scopes.map((s) => <span key={s}>{s}</span>)}
                      {"gate" in a ? <span className={styles.gate}>{a.gate}</span> : null}
                    </div>
                    {runs[a.name] ? <span className={styles.agentRuns}>{fmt(runs[a.name])} runs today</span> : null}
                  </div>
                ))}
              </div>
              <div className={styles.col}>
                <div className={styles.colH}><span className={styles.k}>Activity</span><span className={styles.n}>every action logged</span></div>
                <ol className={styles.log}>
                  {log.map((item) => (
                    <li key={item.id}>
                      <time>{clockText(item.t)}</time>
                      <span className={styles[item.kind]}>{ICON[item.kind]}</span>
                      <span>
                        {item.text}
                        {item.strong ? <span className={styles.w}>{item.strong}</span> : null}
                        {item.id === 0 ? FIRST_TAIL : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className={styles.col}>
                <div className={styles.colH}><span className={styles.k}>Needs a person</span><span className={styles.n}>{pendingOf(opsQueue)}</span></div>
                <Queue
                  items={opsQueue}
                  empty="Nothing waiting. New requests land here."
                  onDecide={(card, act) => decide(setOpsQueue, card, act, () => OPS_MORE[int(0, OPS_MORE.length - 1)]())}
                />
              </div>
            </div>
          )}

          {view === "founder" && (
            <div className={styles.roomGrid}>
              <div className={styles.col}>
                <div className={styles.colH}><span className={styles.k}>Agents by team</span><span className={styles.n}>{FOUNDER_AGENTS.length}</span></div>
                {FOUNDER_AGENTS.map((a) => {
                  const count = a.team === "BD" ? founderCounts[0] : a.team === "Ops" ? founderCounts[1] : founderCounts[2];
                  return (
                    <div key={a.name} className={styles.feat}>
                      <span className={styles.team}>{a.team}</span>
                      <div className={styles.agentTop}><b>{a.name}</b><State state={a.state} /></div>
                      <div className={styles.meta}>
                        {a.meta(count).map((m) => <span key={m}>{m}</span>)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.col}>
                <div className={styles.colH}><span className={styles.k}>This week, across the company</span><span className={styles.n}>Mon brief</span></div>
                <div className={styles.filters} role="group" aria-label="Filter the brief by team">
                  <button type="button" aria-pressed={teamFilter === null} onClick={() => setTeamFilter(null)}>All</button>
                  {TEAMS.map((t) => (
                    <button key={t} type="button" aria-pressed={teamFilter === t} onClick={() => setTeamFilter(teamFilter === t ? null : t)}>
                      {t}
                    </button>
                  ))}
                </div>
                <ul className={styles.brief} key={teamFilter ?? "all"}>
                  {BRIEF.filter((b) => !teamFilter || b.team === teamFilter).map((b) => (
                    <li key={b.label}>
                      <span>{b.label}</span>
                      <b>{b.value}</b>
                      <small className={b.up ? styles.up : undefined}>{b.team} · {b.note}</small>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.col}>
                <div className={styles.colH}><span className={styles.k}>Your calls today</span><span className={styles.n}>{pendingOf(founderQueue)}</span></div>
                <Queue
                  items={founderQueue}
                  empty="All caught up. Your agents keep working; the next brief lands tomorrow at 07:00."
                  onDecide={(card, act) => decide(setFounderQueue, card, act)}
                />
              </div>
            </div>
          )}

          {view === "cto" && (
            <div className={`${styles.roomGrid} ${styles.ctoGrid}`}>
              <div className={styles.col}>
                <div className={styles.colH}><span className={styles.k}>Access policy</span><span className={styles.n}>click a cell</span></div>
                <div className={styles.matrixScroll} tabIndex={0} role="region" aria-label="Access policy table">
                  <table className={styles.matrix} aria-label="Which agents can access which systems">
                    <thead>
                      <tr>
                        <th>agent</th>
                        {SYSTEMS.map((s) => <th key={s} className={styles.sys}>{s}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {policy.map((row, ri) => (
                        <tr key={row.agent}>
                          <td>{row.agent}</td>
                          {row.cells.map((c, ci) => (
                            <td key={SYSTEMS[ci]}>
                              <button
                                type="button"
                                className={styles.cell}
                                data-s={c}
                                aria-label={`${row.agent} on ${SYSTEMS[ci]}: ${c === "n" ? "no access" : c === "r" ? "read" : "read and write, gated"}. Change`}
                                onClick={() => cycle(ri, ci)}
                              >
                                {ACCESS_LABEL[c]}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={styles.fine}>⚑ = write needs a person&rsquo;s approval. Anything not granted is blocked and logged.</p>
                <div className={styles.staged} aria-live="polite">
                  {staged > 0 ? `${staged} change${staged > 1 ? "s" : ""} staged · needs a second approver before it applies` : ""}
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.colH}><span className={styles.k}>Run record</span><span className={styles.n}>click to open</span></div>
                <div className={styles.runs}>
                  {RUNS.map((run, i) => (
                    <div key={run.time + run.agent} className={styles.runCard}>
                      <button type="button" aria-expanded={open.has(i)} onClick={() => toggleRun(i)}>
                        <span>{run.time}</span>
                        <span><b>{run.agent}</b> · {run.what}</span>
                        <span className={`${styles.st}${run.blocked ? ` ${styles.blk}` : ""}`}>{run.status}</span>
                      </button>
                      {open.has(i) && (
                        <div className={styles.rec}>
                          {run.rows.map(([label, parts]) => (
                            <div key={label}>
                              <span>{label}</span>
                              <span>
                                {parts.map((part, pi) =>
                                  typeof part === "string" ? part : <span key={pi} className={styles[part[0]]}>{part[1]}</span>,
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className={styles.export} disabled={exported} onClick={() => setExported(true)}>
                  {exported ? "✓ Exported · 1,412 runs · 30 days" : "Export audit log (CSV)"}
                </button>
              </div>
              <div className={styles.col}>
                <div className={styles.colH}><span className={styles.k}>Needs attention</span><span className={styles.n}>{pendingOf(ctoQueue)}</span></div>
                <Queue
                  items={ctoQueue}
                  empty="Nothing needs you. Thresholds, scopes and credentials are all within policy."
                  onDecide={(card, act) => decide(setCtoQueue, card, act)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <p className={styles.roomNote}>
        <span>Example workspace. Nothing here is a real customer.</span>
        <span>{active.hint}</span>
      </p>
    </div>
  );
}

const TONE: Record<Tone, string> = { amber: styles.sevAmber, blue: styles.sevBlue, pink: styles.sevPink };

function Queue({ items, empty, onDecide }: { items: Decision[]; empty: string; onDecide: (card: Decision, act: string) => void }) {
  if (items.length === 0) return <p className={styles.caughtUp}>{empty}</p>;
  return (
    <div>
      {items.map((d) => (
        <div key={d.id} className={`${styles.approval}${d.leaving ? ` ${styles.leaving}` : ""}`}>
          <span className={styles.who}>
            {d.tone ? <i className={`${styles.sev} ${TONE[d.tone]}`} aria-hidden /> : null}
            {d.who}
          </span>
          <h4>{d.title}</h4>
          <p>{d.body}</p>
          {d.done ? (
            <span className={styles.done} role="status">{d.done}</span>
          ) : (
            <div className={styles.row}>
              {d.options.map(([label, act], i) => (
                <button key={label} type="button" className={i === 0 ? styles.yes : undefined} onClick={() => onDecide(d, act)}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function State({ state }: { state: "running" | "waiting" | "in sprint" }) {
  const tone = state === "running" ? styles.stRun : state === "waiting" ? styles.stWait : styles.stDraft;
  return <span className={`${styles.state} ${tone}`}>{state}</span>;
}
