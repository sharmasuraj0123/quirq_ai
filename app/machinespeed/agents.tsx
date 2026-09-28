"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Agent, AgentArea, Team } from "./content";
import { Logo } from "./logos";
import styles from "./machinespeed.module.css";

/**
 * "MachineSpeed runs on agents too." A tab per agent; each shows a hub with
 * the areas it works in around it, a ticker of what it just did, and a detail
 * panel. Click an area to read what it does there and where it stops for us.
 *
 * The one moving thing: every few seconds the agent finishes something in the
 * next area. The first render is fixed (nothing lit), so server and client
 * markup match. With reduced motion every area is marked at once and nothing
 * cycles. Everything here is illustrative.
 */

const TICK_MS = 3200;
const TRAVEL_MS = 900;

const STATE_LABEL: Record<AgentArea["kind"], string> = { alone: "Done", gate: "Needs us", flag: "Flagged" };

/** Positions the areas on a ring around the hub, as percentages of the box. */
function ring(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
    return [50 + 35 * Math.cos(a), 50 + 37 * Math.sin(a)] as const;
  });
}

export function Agents({ org }: { org: Team[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  // Which area is lit right now, and which have been marked so far this cycle.
  const [lit, setLit] = useState<number | null>(null);
  const [marked, setMarked] = useState<Set<number>>(() => new Set());
  const [ticker, setTicker] = useState<AgentArea | null>(null);

  const roles = useMemo(() => {
    const map = new Map<string, string>();
    org.forEach((t) => t.people.forEach((p) => map.set(p.id, p.label)));
    return map;
  }, [org]);
  const status = (a: AgentArea) =>
    a.kind === "gate" ? `Needs the ${roles.get(a.who ?? "") ?? "team"}` : a.kind === "flag" ? "Flagged an issue" : "Handled on its own";

  const team = org[current];
  const agent = team.agent;
  const positions = ring(agent.areas.length);
  const paused = selected !== null || reduced;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setMarked(new Set(agent.areas.map((_, j) => j)));
      setLit(null);
      return;
    }
    if (selected !== null) {
      setLit(null);
      return;
    }
    let step = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      const j = step % agent.areas.length;
      setLit(j);
      settle = setTimeout(() => {
        setMarked((m) => new Set(m).add(j));
        setTicker(agent.areas[j]);
      }, TRAVEL_MS);
      step++;
    };
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => {
      clearInterval(id);
      clearTimeout(settle);
    };
  }, [agent, selected, reduced]);

  const show = (i: number) => {
    setCurrent(i);
    setSelected(null);
    setLit(null);
    setMarked(new Set());
    setTicker(null);
  };

  const select = (j: number) => {
    if (selected === j) {
      setSelected(null);
      return;
    }
    setSelected(j);
    setMarked((m) => new Set(m).add(j));
  };

  return (
    <div className={styles.ag}>
      <div className={styles.agTabs} role="tablist" aria-label="Agents">
        {org.map((t, i) => (
          <button
            key={t.id}
            className={styles.agTab}
            role="tab"
            id={`agtab-${t.id}`}
            aria-controls={`agent-${t.id}`}
            aria-selected={i === current}
            tabIndex={i === current ? 0 : -1}
            type="button"
            onClick={() => show(i)}
          >
            <small>{t.name}</small>
            <span>{t.agent.name}</span>
          </button>
        ))}
      </div>

      <div className={styles.agCard} role="tabpanel" id={`agent-${team.id}`} aria-labelledby={`agtab-${team.id}`}>
        <div className={styles.agLeft}>
          <div className={styles.agHub} data-paused={paused ? "1" : "0"}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {positions.map(([x, y], j) => (
                <line
                  key={j}
                  className={`${styles.agSpoke}${lit === j ? ` ${styles.on}` : ""}${selected === j ? ` ${styles.sel}` : ""}`}
                  x1="50" y1="50" x2={x} y2={y}
                />
              ))}
            </svg>
            {lit !== null && !reduced && (
              <span
                key={`${team.id}-${lit}`}
                className={styles.agPulse}
                style={{ "--px": `${positions[lit][0]}%`, "--py": `${positions[lit][1]}%` } as CSSProperties}
                aria-hidden
              />
            )}
            <div className={styles.agCore}>
              <span className={styles.bars} aria-hidden><i /><i /><i /></span>
              <b>{agent.name}</b>
            </div>
            {agent.areas.map((a, j) => (
              <button
                key={a.name}
                type="button"
                className={`${styles.agNode}${lit === j ? ` ${styles.on}` : ""}${selected === j ? ` ${styles.sel}` : ""}`}
                style={{ left: `${positions[j][0]}%`, top: `${positions[j][1]}%` }}
                data-st={marked.has(j) ? a.kind : undefined}
                aria-pressed={selected === j}
                onClick={() => select(j)}
              >
                <h3>{a.name}</h3>
                <span className={styles.agSt}>{marked.has(j) ? STATE_LABEL[a.kind] : ""}</span>
              </button>
            ))}
          </div>
          <div className={styles.agTicker} aria-live="polite">
            <span className={styles.agDot} data-kind={ticker?.kind} />
            {ticker ? (
              <span key={ticker.name} className={styles.agTxt}><b>{ticker.name}</b> <span>· {ticker.short}</span></span>
            ) : (
              <span className={styles.agTxt}>{agent.name} is on it</span>
            )}
          </div>
          <p className={styles.agHint}>Click any area to see what it does there and where it stops for us.</p>
        </div>

        <div className={styles.agRight}>
          {selected === null ? (
            <Overview agent={agent} sector={team.name} />
          ) : (
            <Detail agent={agent} area={agent.areas[selected]} status={status(agent.areas[selected])} back={() => setSelected(null)} />
          )}
        </div>
      </div>

    </div>
  );
}

function Chips({ items }: { items: [string, string][] }) {
  return (
    <div className={styles.agChips}>
      {items.map(([n, s]) => (
        <span key={n} className={styles.agChip}><Logo name={n} />{n} <em>{s}</em></span>
      ))}
    </div>
  );
}

function Overview({ agent, sector }: { agent: Agent; sector: string }) {
  return (
    <div className={styles.agPanel}>
      <div>
        <h3 className={styles.agTitle}>{agent.name}</h3>
        <p className={`${styles.k} ${styles.agSector}`}>{sector} agent</p>
        <p className={styles.agLead}>{agent.role}</p>
      </div>
      <div className={styles.agFacts}>
        <div className={styles.agFact}><p className={styles.k}>Works in</p><Chips items={agent.works} /></div>
        <div className={styles.agFact}><p className={styles.k}>Always stops for us</p><p>{agent.stops}</p></div>
        <div className={styles.agFact}><p className={styles.k}>On record</p><p>Every step is logged, so we can replay what it saw, decided and changed.</p></div>
      </div>
    </div>
  );
}

function Detail({ agent, area, status, back }: { agent: Agent; area: AgentArea; status: string; back: () => void }) {
  return (
    <div key={area.name} className={styles.agPanel}>
      <button className={styles.agBack} type="button" onClick={back}>← {agent.name} overview</button>
      <div>
        <p className={styles.k}>{agent.name}</p>
        <h3 className={styles.agTitle}>{area.name}</h3>
        <p className={styles.agLead}>{area.desc}</p>
      </div>
      <div className={styles.agExample}>
        <p className={styles.k}>Example</p>
        <p className={styles.agTrig}>{area.trig}</p>
        <p className={styles.agRes}>{area.res}</p>
        <span className={styles.agBadge} data-kind={area.kind}>{status}</span>
      </div>
      <div className={styles.agFact}><p className={styles.k}>Access it uses here</p><Chips items={area.tools} /></div>
      <details className={styles.agDetails}>
        <summary>Show the run record</summary>
        <ol className={styles.agLog}>
          {area.log.map(([v, t], i) => (
            <li key={i}><span className={styles.agV} data-v={v}>{v}</span><span>{t}</span></li>
          ))}
        </ol>
      </details>
    </div>
  );
}
