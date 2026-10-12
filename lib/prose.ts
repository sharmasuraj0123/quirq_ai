/**
 * The long-form body vocabulary, shared by every reading surface.
 *
 * Research notes (lib/research.ts) and the whitepaper (lib/whitepaper.ts) both
 * author their bodies in these blocks, and both render through
 * components/prose/body.tsx. Keeping the type here rather than inside one
 * consumer is what stops a second, subtly different renderer from appearing
 * the next time a surface needs prose.
 *
 * Server-safe: plain serializable data, no JSX, no browser modules.
 */

/**
 * One decision as a diagram: an input, a choice question and a tags question
 * asked of it side by side, the answer that comes back, and the rules around
 * it. Rendered by components/prose/decision.tsx.
 */
export type DecisionBlock = {
  kind: "decision";
  title: string;
  input: { label: string; text: string };
  /** The line between the input and the two questions. */
  ask: string;
  choice: {
    title: string;
    hint: string;
    options: { name: string; note: string; detail: string; selected?: true }[];
    /** What happens when no option is picked. */
    otherwise: { name: string; note: string };
  };
  tags: {
    title: string;
    hint: string;
    items: { label: string; applies: boolean }[];
    note: string;
  };
  /** Left to right: what was returned, what it set, what ran. */
  result: { label: string; value: string; detail?: string }[];
  rules: { title: string; note: string }[];
  /** Says what is illustrative and what is as measured. */
  caption: string;
};

/**
 * A film in the body. Never autoplays: it may carry sound, and a reader who
 * prefers reduced motion should not have it start under them.
 */
export type VideoBlock = {
  kind: "video";
  /** Under public/, an H.264 MP4 with its index at the front so it streams. */
  src: string;
  width: number;
  height: number;
  /** What the film is, for the accessible name and the line beneath it. */
  caption: string;
};

export type Block =
  | { kind: "h2" | "h3" | "p" | "quote" | "code"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | DecisionBlock
  | VideoBlock;

/**
 * A stable anchor for a heading. Derived from the text rather than from a
 * position, because a table of contents link and a shared deep link both
 * survive a section being inserted above them.
 */
export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
