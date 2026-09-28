import type { ReactNode } from "react";
import type { UseCase } from "./content";
import styles from "./machinespeed.module.css";

/**
 * The "duct-taped" before-state for each use case, drawn as in the source.
 * Server-rendered and handed to the client Cases island as props, so the SVG
 * never ships as client JavaScript.
 */

const PINK = "#ff5e8a";
const BOX = "#13160f";
const EDGE = "rgba(233,234,230,.25)";
const INK = "#e9eae6";
const SANS = "Inter, sans-serif";

function Wire({ d, opacity = 0.6, dash = "5 5" }: { d: string; opacity?: number; dash?: string | null }) {
  return (
    <path
      d={d}
      stroke={PINK}
      strokeOpacity={opacity}
      strokeWidth="1.5"
      strokeDasharray={dash ?? undefined}
      fill="none"
    />
  );
}

function Box({
  x, y, w, h = 44, title, note, broken = false, className, noteY,
}: {
  x: number; y: number; w: number; h?: number; title: string; note?: string;
  broken?: boolean; className?: string; noteY?: number;
}) {
  const cx = x + w / 2;
  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={BOX} stroke={broken ? PINK : EDGE} strokeOpacity={broken ? 0.7 : undefined} />
      <text x={cx} y={note && noteY === undefined ? y + 19 : y + h / 2 + 4} fill={INK} fontSize="12" textAnchor="middle" fontFamily={SANS} fontWeight="600">
        {title}
      </text>
      {note ? (
        <text x={cx} y={noteY ?? y + 35} fill={PINK} fontSize="9.5" textAnchor="middle">
          {note}
        </text>
      ) : null}
    </g>
  );
}

function Sdr({ y, letter }: { y: number; letter: string }) {
  return (
    <g>
      <rect x="20" y={y} width="100" height="30" rx="7" fill={BOX} stroke={EDGE} />
      <text x="70" y={y + 19} fill="#a8aba3" fontSize="11" textAnchor="middle">SDR · prompt {letter}</text>
    </g>
  );
}

function Svg({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 760 220" xmlns="http://www.w3.org/2000/svg" fontFamily="JetBrains Mono, monospace" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

const OPS = (
  <Svg label="Diagram of a fragile setup: Shopify, a Zapier chain, a ChatGPT prompt and NetSuite connected by tangled dashed lines, with a duplicate refund and a silent failure">
    <Wire d="M120 60 C 220 60, 200 150, 300 150" />
    <Wire d="M120 70 C 260 90, 240 40, 300 60" />
    <Wire d="M420 60 C 500 60, 480 150, 560 150" />
    <Wire d="M420 150 C 470 150, 480 60, 560 60" />
    <Wire d="M420 165 C 460 200, 520 200, 560 165" opacity={0.35} dash="3 6" />
    <Box x={20} y={40} w={100} title="Shopify" />
    <Box x={300} y={40} w={120} title="Zapier chain" note="14 steps · 1 owner" broken className={styles.wobble} />
    <Box x={300} y={128} w={120} title="ChatGPT step" note={"“decide what to do”"} broken className={styles.flicker} />
    <Box x={560} y={40} w={100} title="Stripe" />
    <Box x={560} y={128} w={100} title="NetSuite" />
    <Box x={20} y={128} w={100} title="WMS export" note="column renamed → chain stops, no alert" noteY={192} />
    <text x="610" y="105" fill={PINK} fontSize="9.5" textAnchor="middle">refund issued twice</text>
  </Svg>
);

const FIN = (
  <Svg label="Diagram of a fragile finance setup: exports from Xero and Ramp pasted into three separate AI chat tools, with a wrong number reaching the board">
    <Wire d="M120 60 C 200 60, 200 110, 280 110" />
    <Wire d="M120 150 C 200 150, 200 110, 280 110" />
    <Wire d="M400 95 C 440 60, 470 60, 520 60" />
    <Wire d="M400 110 H520" />
    <Wire d="M400 125 C 440 160, 470 160, 520 160" />
    <Wire d="M640 110 H700" opacity={0.8} dash={null} />
    <Box x={20} y={40} w={100} title="Xero export" />
    <Box x={20} y={128} w={100} title="Ramp export" />
    <Box x={280} y={88} w={120} title="Paste into chat" note="personal accounts" broken className={styles.wobble} />
    <Box x={520} y={40} w={120} h={40} title="AI tool #1" broken className={styles.flicker} />
    <Box x={520} y={90} w={120} h={40} title="AI tool #2" broken />
    <Box x={520} y={140} w={120} h={40} title="AI tool #3" broken className={styles.flicker} />
    <g>
      <rect x="700" y="88" width="50" height="44" rx="8" fill={BOX} stroke={PINK} />
      <text x="725" y="114" fill={PINK} fontSize="11" textAnchor="middle" fontFamily={SANS} fontWeight="600">Board</text>
    </g>
    <text x="580" y="205" fill={PINK} fontSize="9.5" textAnchor="middle">three different answers · one wrong number shipped · no source to check</text>
  </Svg>
);

const REV = (
  <Svg label="Diagram of a fragile sales setup: five SDRs with separate prompts feeding a sequencer that emails accounts without approval and writes duplicates into the CRM">
    <Wire d="M120 40 C 200 40, 200 110, 300 110" opacity={0.5} />
    <Wire d="M120 75 C 200 75, 200 110, 300 110" opacity={0.5} />
    <Wire d="M120 110 H300" opacity={0.5} />
    <Wire d="M120 145 C 200 145, 200 110, 300 110" opacity={0.5} />
    <Wire d="M120 180 C 200 180, 200 110, 300 110" opacity={0.5} />
    <Wire d="M420 100 C 470 60, 500 60, 560 60" opacity={0.7} dash={null} />
    <Wire d="M420 106 C 470 66, 500 66, 560 66" opacity={0.5} dash={null} />
    <Wire d="M420 112 C 470 72, 500 72, 560 72" opacity={0.35} dash={null} />
    <Wire d="M420 118 C 470 78, 500 78, 560 78" opacity={0.2} dash={null} />
    <Wire d="M420 120 C 470 160, 500 160, 560 160" />
    {["A", "B", "C", "D", "E"].map((letter, i) => (
      <Sdr key={letter} y={24 + i * 35} letter={letter} />
    ))}
    <Box x={300} y={88} w={120} title="Auto-sequencer" note="sends without asking" broken className={styles.wobble} />
    <g className={styles.flicker}>
      <rect x="560" y="40" width="140" height="44" rx="8" fill={BOX} stroke={PINK} />
      <text x="630" y="59" fill={INK} fontSize="12" textAnchor="middle" fontFamily={SANS} fontWeight="600">Strategic account</text>
      <text x="630" y="75" fill={PINK} fontSize="9.5" textAnchor="middle">4 emails in one week</text>
    </g>
    <Box x={560} y={138} w={140} title="HubSpot" note="3 records for one company" />
  </Svg>
);

export const BEFORE: Record<UseCase["id"], ReactNode> = { ops: OPS, fin: FIN, rev: REV };
