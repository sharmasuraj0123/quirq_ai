/**
 * Phase 2 of the list-to-tree migration: sections register themselves.
 *
 * A module-level registry, deliberately not React context: the scroll runtime
 * and the Beat primitive live in different parts of the tree (and the canvas
 * renders through its own reconciler root), while a plain module is visible
 * to all of them: the same reasoning as lib/stage-store.ts.
 *
 * The Beat primitive registers its element on mount and unregisters on
 * unmount; the scroll runtime reads the registry to measure section centres
 * and re-measures whenever the set changes. The data-beat attribute remains
 * on the DOM as a transition-era fallback: if nothing registered (a page
 * composed without the Beat primitive), the runtime falls back to querying
 * it.
 */

export type BeatEntry = {
  id: string;
  index: number;
  el: HTMLElement;
};

const entries = new Map<HTMLElement, BeatEntry>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/** Register a section; returns the unregister cleanup. */
export function registerBeat(entry: BeatEntry): () => void {
  entries.set(entry.el, entry);
  notify();
  return () => {
    entries.delete(entry.el);
    notify();
  };
}

/** Registered sections, in track order. */
export function beatEntries(): BeatEntry[] {
  return [...entries.values()].sort((a, b) => a.index - b.index);
}

/** Subscribe to registry changes; returns the unsubscribe. */
export function onBeatsChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/**
 * Tell the runtime a section's height changed, without the set changing.
 *
 * The runtime also watches every registered section with a ResizeObserver,
 * which covers this automatically in a normal tab. This exists because that
 * delivery is part of the rendering lifecycle: a backgrounded or throttled
 * tab stops delivering resize records the same way it stops firing rAF, so an
 * interactive page that grows while hidden and is then revealed would be
 * measuring stale geometry until the next resize.
 *
 * Call it after a deliberate layout change (a panel opening, a table filling
 * in, a journey step advancing) when you would rather not depend on that. It
 * is idempotent and cheap: the runtime coalesces to one measurement per frame.
 */
export function beatsResized(): void {
  notify();
}
