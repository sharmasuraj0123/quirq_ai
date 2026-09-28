"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { UseCase } from "./content";
import styles from "./machinespeed.module.css";

/**
 * "The same workflow, both ways." A tab list of use cases, each with a
 * duct-taped / MachineSpeed toggle. The before-state diagrams are rendered on
 * the server and arrive as props.
 */

const NODE_CLASS = {
  trigger: styles.nTrigger,
  agent: styles.nAgent,
  guard: styles.nGuard,
  human: styles.nHuman,
  out: styles.nOut,
};

export function Cases({ cases, before }: { cases: UseCase[]; before: Record<UseCase["id"], ReactNode> }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (event: KeyboardEvent, index: number) => {
    const d = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : ["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 0;
    if (!d) return;
    event.preventDefault();
    const next = (index + d + cases.length) % cases.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  const current = cases[active];

  return (
    <div className={styles.cases}>
      <div className={styles.caseNav} role="tablist" aria-label="Use cases" aria-orientation="vertical">
        {cases.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            className={styles.tab}
            role="tab"
            id={`tab-${c.id}`}
            aria-controls={`case-${c.id}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            type="button"
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <small>{c.sector}</small>
            <span>{c.name}</span>
            <em>{c.profile}</em>
          </button>
        ))}
      </div>

      <div>
        <CaseCard key={current.id} data={current} before={before[current.id]} />
        {/* TODO: replace with named customers as they go live. */}
        <p className={styles.caseNote}>
          Representative engagements built from our blueprints. Company details are changed; the numbers are the ones each workflow reports.
        </p>
      </div>
    </div>
  );
}

function CaseCard({ data, before }: { data: UseCase; before: ReactNode }) {
  const [side, setSide] = useState<"before" | "after">("before");
  const caption = data.captions[side];

  return (
    <article className={styles.caseCard} role="tabpanel" id={`case-${data.id}`} aria-labelledby={`tab-${data.id}`}>
      <div className={styles.caseHead}>
        <div>
          <div className={styles.tags}>
            {data.tags.map((t) => <span key={t}>{t}</span>)}
          </div>
          <h3>{data.title}</h3>
        </div>
        <p>{data.story}</p>
      </div>

      <div className={styles.ba}>
        <div className={styles.baSeg} role="group" aria-label="Before or after">
          <button type="button" data-v="before" aria-pressed={side === "before"} onClick={() => setSide("before")}>Duct-taped</button>
          <button type="button" data-v="after" aria-pressed={side === "after"} onClick={() => setSide("after")}>With MachineSpeed</button>
        </div>
        <span className={styles.k}><b>{caption[0]}</b> {caption[1]}</span>
      </div>

      <div className={styles.stageWrap}>
        {side === "before" ? (
          <div className={styles.view}>
            <div className={styles.mess}>
              {before}
              <div className={styles.messNotes}>
                {data.messNotes.map((n) => <span key={n}>{n}</span>)}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.view}>
            <div className={styles.flowScroll} tabIndex={0} role="region" aria-label={data.flowLabel}>
              <div className={styles.flow}>
                {data.flow.map((node, i) => (
                  <div key={node.title} className={`${styles.node} ${NODE_CLASS[node.kind]}`}>
                    <div className={styles.nodeBox}>
                      <span className={styles.k}>{node.label}</span>
                      <b>{node.title}</b>
                      <span>{node.note}</span>
                    </div>
                    {i < data.flow.length - 1 ? <span className={styles.wire} aria-hidden /> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.caseFoot}>
        <div>
          <span className={styles.k}>Number reported monthly</span>
          <div className={styles.num}>
            <CountUp to={data.number.count} suffix={data.number.suffix} />
            <small>{data.number.note}</small>
          </div>
        </div>
        <div><span className={styles.k}>Acts alone on</span><p>{data.alone}</p></div>
        <div><span className={styles.k}>Asks a person</span><p>{data.asks}</p></div>
      </div>
    </article>
  );
}

/** The final value is what renders first; the count only runs once visible. */
function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const node = el.current;
    if (!node || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 900);
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return <span ref={el}>{value}{suffix}</span>;
}
