import type { SettledUnit } from "./engine.mjs";

export type LedgerEntry = {
  seq: number;
  prevHash: string;
  record: SettledUnit;
  hash: string;
};

export type ChainResult = {
  seq: number;
  ok: boolean;
  linkOk: boolean;
  seqOk: boolean;
  hashOk: boolean;
  hash: string;
  recomputed: string;
};

export type Verification = {
  valid: boolean;
  /** Index of the first broken entry, or null when the chain verifies. */
  firstBreak: number | null;
  length: number;
  head: string;
  results: ChainResult[];
};

export const GENESIS: string;

export function canonicalize(value: unknown): string;
export function linkHash(prevHash: string, record: unknown): Promise<string>;
export function appendEntry(
  entries: LedgerEntry[],
  record: SettledUnit,
): Promise<LedgerEntry>;
export function verifyChain(entries: LedgerEntry[]): Promise<Verification>;
export function parseLedger(text: string): LedgerEntry[];
export function serialiseLedger(entries: LedgerEntry[]): string;
