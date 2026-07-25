/**
 * The visitor's own ledger, kept in localStorage.
 *
 * Same chain construction as the CLI writes to .quirq/ledger.jsonl: entries
 * are appended with appendEntry and verified with verifyChain, both from
 * ledger.mjs. Nothing about the ledger is special-cased for the browser, so
 * what the dashboard verifies here is the real thing rather than a mock of it.
 *
 * localStorage rather than a server because the site is static and this is the
 * visitor's own data. It never leaves the tab.
 */

import { appendEntry, parseLedger, serialiseLedger } from "./ledger.mjs";

const KEY = "quirq.ledger.v1";

/** Storage can be absent (SSR) or throw (Safari private mode, quota). */
function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readSession() {
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(KEY);
    return raw ? parseLedger(raw) : [];
  } catch {
    // A corrupt ledger is not worth crashing the page over; the reader can
    // always clear it and mint again.
    return [];
  }
}

/** Append a settled unit to the visitor's chain and persist it. */
export async function appendSession(record) {
  const entries = readSession();
  const entry = await appendEntry(entries, record);
  const next = [...entries, entry];

  const store = storage();
  if (store) {
    try {
      store.setItem(KEY, serialiseLedger(next));
    } catch {
      // Out of quota or blocked: the mint still happened and the caller still
      // gets its entry, it just will not survive a reload.
    }
  }

  return { entry, entries: next };
}

export function clearSession() {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(KEY);
  } catch {
    /* nothing useful to do */
  }
}

export { KEY as SESSION_KEY };
