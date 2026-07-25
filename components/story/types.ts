/**
 * The data shape of a story beat: the vocabulary the StoryBeat renderer
 * understands. Server-safe (no client imports), so pages can define their
 * middles as plain data and map over them.
 */

export type BeatData = {
  index: number;
  id: string;
  /** Where the copy block sits relative to the travelling glass. */
  layout: "center" | "left" | "right";
  marker?: string;
  /** Two reveal lines; `glass` names the one that becomes a light aperture. */
  title: [string, string];
  glass?: 0 | 1;
  lede?: string;
  /** Numbered rows, open hairline style. */
  rows?: { title: string; note: string }[];
  /** Numbered rows inside a panel. */
  panelRows?: { title: string; note: string }[];
  /** Labelled tiles in a panel grid. */
  tiles?: { label: string; body: string }[];
  /** A mono snippet panel. */
  code?: string;
  caption?: string;
  links?: {
    href: string;
    label: string;
    tone?: "solid" | "ghost";
    /** Open away from the current walk, in a new tab. */
    newTab?: boolean;
  }[];
};
