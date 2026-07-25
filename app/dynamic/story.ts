/**
 * The middle of /dynamic as pure data. This module has no client imports, so
 * the server page can map over it; the client renderer imports the type.
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
  links?: { href: string; label: string; tone?: "solid" | "ghost" }[];
};

export const STORY: BeatData[] = [
  {
    index: 0,
    id: "dyn-hero",
    layout: "center",
    title: ["Static shell,", "dynamic heart."],
    glass: 1,
    lede: "Four pages share one scene already. The shell: stage, runtime, nav, is identical and static everywhere; only the middle moves. This page is the recipe, and it is built from it.",
  },
  {
    index: 1,
    id: "dyn-static",
    layout: "left",
    marker: "01 · what never changes",
    title: ["The shell is", "the constant."],
    rows: [
      {
        title: "The shell mounts once per page.",
        note: "StagePage is four lines: runtime, stage, overlays, nav. Every stage page renders the identical shell; none of them configure it.",
      },
      {
        title: "The track is a module constant.",
        note: "All pages blend the same five keyframes. Swapping the middle cannot desync the choreography, because the middle never touches it.",
      },
      {
        title: "The primitives are shared.",
        note: "Beat, Reveal, Rise, the scrims and pools: the middle composes them, it does not restyle them.",
      },
      {
        title: "Every route prerenders.",
        note: "The build emits static HTML for all of it. The shell costs nothing at request time; the glass hydrates over the finished page.",
      },
    ],
  },
  {
    index: 2,
    id: "dyn-swap",
    layout: "right",
    marker: "02 · the swap",
    title: ["Three ways to", "swap the middle."],
    glass: 1,
    tiles: [
      {
        label: "Composition",
        body: "Pass different beat components as children. Zero machinery; it is how /what-is-quirq and /how-it-works were made.",
      },
      {
        label: "Data",
        body: "Describe beats as plain objects and render them with one component. Adding a page becomes writing an array; this very page is built that way.",
      },
      {
        label: "Deferred",
        body: "Mark the slot dynamic: stream the middle from a CMS or an API per request while the shell stays static, or load a client-only beat lazily.",
      },
    ],
    code: "const STORY: BeatData[] = [ /* beats as data */ ];\n\n<StagePage>\n  {STORY.map((beat) => (\n    <StoryBeat key={beat.id} data={beat} />\n  ))}\n</StagePage>",
    caption: "The shell never learns which pattern the middle chose.",
  },
  {
    index: 3,
    id: "dyn-contract",
    layout: "left",
    marker: "03 · the contract",
    title: ["What the middle", "must honor."],
    panelRows: [
      {
        title: "Indices 0 to 4, in scroll order.",
        note: "At most as many beats as the track has keyframes; fewer is fine, the tail simply never plays.",
      },
      {
        title: "One viewport per beat.",
        note: "The pose peaks at the section's centre; a squeezed section flashes its keyframe past.",
      },
      {
        title: "Text brings its own darkness.",
        note: "A TextScrim or a GlassPool per block: the glass will drift under your copy at some width.",
      },
      {
        title: "Fixed geometry.",
        note: "No marquees, nothing sliced at an edge; grids stay perfect rectangles.",
      },
      {
        title: "Prerender everything.",
        note: "Data-driven or not, every route still builds to static HTML; dynamic means swappable, not server-rendered per request.",
      },
    ],
  },
  {
    index: 4,
    id: "dyn-close",
    layout: "center",
    title: ["One shell,", "infinite middles."],
    glass: 1,
    lede: "The registry and tree phases push this further: middles that register themselves at runtime, tracks per page, branches per audience. The shell will not notice; it never has.",
    links: [
      { href: "/beats", label: "The beats array" },
      { href: "/how-it-works", label: "The migration plan", tone: "ghost" },
    ],
  },
];
