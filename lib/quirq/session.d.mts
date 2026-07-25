import type { SettledUnit } from "./engine.mjs";
import type { LedgerEntry } from "./ledger.mjs";

export const SESSION_KEY: string;

export function readSession(): LedgerEntry[];
export function appendSession(
  record: SettledUnit,
): Promise<{ entry: LedgerEntry; entries: LedgerEntry[] }>;
export function clearSession(): void;
