/**
 * The data shape of a story beat: the vocabulary the StoryBeat renderer
 * understands. Server-safe (no client imports), so pages can define their
 * middles as plain data and map over them.
 */

/**
 * One measured series. `display` keeps the note's own numerals ("228k", "67%")
 * so a figure never re-renders a number in a form its source never used;
 * `values` is only what the geometry needs.
 */
export type FigureSeries = {
  label: string;
  values: number[];
  display?: string[];
  /** Spectrum is spent on delivered value; consumption stays monochrome. */
  tone?: "cost" | "value";
};

/** One record in a mark field: a run, a commit, anything countable. */
export type FigureMark = {
  x: number;
  y: number;
  /** Relative weight, sqrt-scaled to a radius. Churn, tokens, minutes. */
  size?: number;
  /** Which legend entry this mark belongs to. */
  group?: string;
  /** Shown in the mark's title, so a pointer or a reader can identify it. */
  label?: string;
};

/**
 * A figure is data, not markup: a closed union of shapes the renderer knows,
 * carried in beat data and in journey JSON like any other field. Unknown kinds
 * are refused by the validator rather than rendered half way.
 */
export type Figure =
  | {
      kind: "bars";
      categories: string[];
      series: FigureSeries[];
      /** What the numbers measure, once, in words. */
      unit?: string;
      /** Bars scale from zero to this, or to the largest value present. */
      max?: number;
      caption?: string;
    }
  | {
      kind: "marks";
      marks: FigureMark[];
      xLabel: string;
      yLabel: string;
      /** Legend order and tone; groups absent from it still plot. */
      groups?: { label: string; tone?: "cost" | "value" }[];
      caption?: string;
    };

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
  /** One measured visual. Counts as the beat's dominant detail structure. */
  figure?: Figure;
  caption?: string;
  links?: {
    href: string;
    label: string;
    tone?: "solid" | "ghost";
    /** Open away from the current walk, in a new tab. */
    newTab?: boolean;
  }[];
};
