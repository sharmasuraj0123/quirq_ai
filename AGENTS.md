<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# quirq web · agent operating guide

This file is the source of truth for agents creating, generating, or changing pages in this repository. It applies to the entire repository.

The site is a narrative and rendering engine, not a collection of unrelated landing-page sections. Preserve that distinction. A good change adds content or a rule to the existing system. It does not fork the system for one page.

## Mission

When asked to create a page, first produce the smallest valid page description, then let the existing shell, story renderer, registry, and choreography perform it.

Optimize for:

1. one shared visual and runtime architecture;
2. plain, transferable content data where possible;
3. deterministic rules that can be validated before rendering;
4. static server-rendered content with narrow client boundaries;
5. accessibility and graceful degradation;
6. exact choreography behavior, protected by golden captures; and
7. page creation that is easy for the next agent or human to understand.

Do not optimize for one-off cleverness.

## Mandatory first steps

Before editing:

1. Run `git status --short`.
2. Treat existing modifications and untracked files as user-owned. Never overwrite or stage unrelated work.
3. Read this entire file.
4. Read the relevant current documentation under `node_modules/next/dist/docs/`.
5. Inspect the nearest existing page of the same authoring mode.
6. Inspect the canonical types instead of inferring a schema from one example:
   - `components/story/types.ts`
   - `app/journey/defs.tsx`
   - `components/stage/choreo-tree.ts`
7. Decide the page authoring mode before creating files.
8. State any assumption that changes route behavior, generation behavior, or production data ownership.

For page and route work, the minimum Next.js reading is normally:

- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

Also read:

- `15-route-handlers.md` before changing `app/api/**`;
- `14-metadata-and-og-images.md` before metadata or social-image work;
- the dynamic-route API guide before adding `[segment]`;
- the installed guide for any API you are about to use.

## The first decision: what kind of page is this?

Use this decision tree:

```text
Does the visitor's choice change which section appears next?
├─ Yes → create or extend a .quirq JourneyDefinition.
└─ No
   ├─ Does any section need bespoke markup or interaction?
   │  ├─ Yes → compose custom React beat components.
   │  └─ No → create a plain BeatData[] story and render StoryBeat.
   └─ Is this one item in a content catalog with one stable URL per item?
      └─ Yes → use a Next.js [slug] route and generateStaticParams.
```

### Preferred order

Prefer, in order:

1. **Plain `BeatData[]`** for a normal linear narrative.
2. **A `.quirq` journey JSON** for a branching or transferable narrative.
3. **Custom React beats** only for content the generic renderer cannot express.
4. **A new rendering abstraction** only when at least two real pages need the same missing capability.

Do not create a custom component merely to change copy, alignment, rows, tiles, code, captions, links, or a glass pose. Those are already data.

## What “dynamic” means in this repository

Do not use the word “dynamic” without identifying which mechanism is intended.

| Mechanism | What changes | When it changes | Canonical example |
|---|---|---|---|
| Data-driven static page | The `BeatData[]` content | At edit/build time | `app/dynamic` |
| Branching journey | The visited node path and active choreography track | In the browser after a choice | `app/journey` |
| Dynamic route segment | The route param chooses one content record | At build time or request time | `app/research/[slug]` |
| Journey route handler | A slug loads a JSON document from `.quirq` | At request time | `app/api/journeys/[slug]` |
| Live editor override | Draft beats and keyframes replace the active track | In the browser while editing | `app/editor` |
| Responsive choreography rule | A tree branch is included or pruned | On mount and resize | `ChoreoNode.when` |

These mechanisms may cooperate, but they are not interchangeable.

In particular:

- “Dynamic page” does not automatically mean request-time server rendering.
- “Generated page” does not require generating TSX.
- A `.quirq` journey is served at `/journey?j=<slug>`; it does not need a new `app/<slug>/page.tsx`.
- A catalog with SEO-distinct item URLs should use a `[slug]` route rather than query-only client loading.

## Architecture at a glance

### One persistent shot

The stage shell is:

```text
StagePage
├── ScrollRuntime
├── Stage
│   └── lazy Scene
│       ├── SpectrumEnv
│       ├── LightBurst
│       └── GlassForm
├── vignette
├── grain
├── Nav
└── main
    └── page beats
```

`StagePage` is shared. Pages provide the middle; they do not configure or duplicate the shell.

### Content-to-frame pipeline

```text
content object or custom component
  → StoryBeat or Beat
  → registerBeat({ id, index, element })
  → ScrollRuntime measures real section centres
  → viewport centre maps to fractional stage.beat
  → sampleKeyframes blends adjacent full keyframes
  → GlassForm damps pose and optics
  → LightBurst damps per-beat light
  → one mounted ribbon performs the page
```

### JSON-to-page pipeline

```text
.quirq/journeys/<slug>.json
  → GET /api/journeys/<slug>
  → validateDefinition
  → resolveDefinition
  ├── beat data → StoryBeat
  └── pose base + tweaks → full Keyframe
        → visited path → overrideLeaves
        → path becomes the live choreography track
```

### Ownership boundaries

| Layer | Owns | Must not own |
|---|---|---|
| Page or story file | Narrative content, metadata, beat order | Frame-loop state or Three.js implementation |
| `StoryBeat` | Generic content presentation | Page-specific business rules |
| Beat registry | Mounted section identity and order | Copy or choreography values |
| Scroll runtime | DOM measurement and scroll-to-beat mapping | React rendering |
| Choreography tree | Authored pose inheritance and conditional leaves | Per-frame DOM work |
| Choreography sampler | Smooth numeric interpolation | Content decisions |
| Journey definition | Branching content, legal edges, walk rules, poses | Executable code from JSON |
| Journey runtime | Active path, trace, replay, restore | Ad hoc schema changes |
| Stage | WebGL capability and quality selection | Narrative branching |
| Glass and burst | Per-frame visual application | React state or page loading |

## Core invariants

These are stronger than local convenience:

1. **One glass object remains mounted across beats.**
2. **Every staged section registers.** Use `Beat` or deliberately call `registerBeat`.
3. **IDs are stable identity.** They are not decorative labels.
4. **The hot frame path remains allocation-free and outside React state.**
5. **The camera stays fixed unless the project explicitly changes its visual grammar.**
6. **Brightness is changed through `LIGHTING`, not by independently retuning coupled call sites.**
7. **Text over the live stage carries a `GlassPool` or `TextScrim`.**
8. **The no-JavaScript, no-WebGL, and reduced-motion paths remain usable.**
9. **A generated document is validated before it affects the page.**
10. **A rules engine fails closed.** Unknown rules, nodes, poses, and targets do not render partial surprises.
11. **Refactors of scroll or choreography are golden-gated.**
12. **Do not make all of `app` a client boundary.**

## Page authoring mode 1: plain data-driven story

This is the default for a new linear stage page.

### File shape

```text
app/<slug>/
├── page.tsx
└── story.ts
```

Keep `story.ts` server-safe:

- import `BeatData` with `import type`;
- export plain serializable data;
- do not add `"use client"`;
- do not import browser-only modules;
- do not put functions, JSX, dates, maps, sets, or class instances in beat data.

### Canonical `story.ts`

```ts
import type { BeatData } from "@/components/story/types";

export const STORY: BeatData[] = [
  {
    index: 0,
    id: "example-hero",
    layout: "center",
    title: ["One clear idea,", "staged in light."],
    glass: 1,
    lede: "State the page promise in one compact paragraph.",
  },
  {
    index: 1,
    id: "example-proof",
    layout: "left",
    marker: "01 · the proof",
    title: ["Show the change,", "not the claim."],
    rows: [
      {
        title: "A concrete point.",
        note: "A precise explanation with no duplicated headline language.",
      },
    ],
  },
];
```

### Canonical `page.tsx`

```tsx
import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { StoryBeat } from "@/components/story/story-beat";
import { SiteFooter } from "@/components/ui/footer";
import { STORY } from "./story";

export const metadata: Metadata = {
  title: "Example",
  description: "A specific summary of the page.",
};

export default function Page() {
  return (
    <StagePage>
      {STORY.map((beat) => (
        <StoryBeat key={beat.id} data={beat} />
      ))}

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-linear-to-t from-black via-black/85 to-transparent"
        />
        <SiteFooter />
      </div>
    </StagePage>
  );
}
```

### Rules

- Use a unique route-prefixed ID such as `pricing-proof`, not `beat-1`.
- Indices must start at `0`, remain contiguous, and match rendered order.
- The default published choreography has five leaves. A normal data-driven page may use fewer; do not use more without supplying and testing a matching track.
- Export route metadata from the server `page.tsx`.
- Keep the page component a Server Component.
- Let the existing client `StoryBeat` boundary own animation and registration.
- Add the route to `Nav`’s `onStage` detection if navigation treatment depends on the stage.
- Add the footer base fade when the final pose would reduce footer contrast.

## Page authoring mode 2: custom composed React beats

Use this when a section needs structure or behavior outside `BeatData`.

Good reasons:

- interactive controls;
- a custom visualization;
- a bespoke numeric ledger;
- a hero aperture or similarly coupled stage effect;
- a layout that cannot be represented by the generic renderer.

Bad reasons:

- a different headline;
- a new row style that only one page wants;
- changing alignment;
- adding a CTA;
- applying a pose;
- avoiding the JSON or data schema.

### Rules for a custom beat

1. Use the shared `Beat` primitive.
2. Give it a stable, unique ID and correct index.
3. Use `Reveal`, `Rise`, `Marker`, `TextScrim`, `GlassPool`, `GlassText`, and `ActionLink` before inventing replacements.
4. Keep content in the DOM and the stage in the canvas; do not render copy inside WebGL.
5. Preserve semantic headings and keyboard behavior.
6. If the section is deliberately an interlude, do not give it a beat index and document why the glass should glide through it.
7. If a custom section cannot use `Beat`, register and unregister its element directly with `registerBeat`.

The home page and `components/beats/*` are the canonical examples.

## Page authoring mode 3: `.quirq` journey JSON

Use this when:

- visitor choices change the next section;
- the entire page should travel as one JSON object;
- non-code authoring or generation is important;
- the same renderer and scene vocabulary are sufficient; or
- a generated linear page may later gain forks.

### Location and URL

```text
.quirq/journeys/<slug>.json
/journey?j=<slug>
```

The filename and `slug` must match. Use lowercase kebab-case with at most 64 characters.

### Current schema

```ts
type JourneyDefinition = {
  slug: string;
  name: string;
  rules: {
    start: string;
    maxDepth?: number;
    allowRewind?: boolean;
    allowReplay?: boolean;
  };
  nodes: Record<
    string,
    {
      short: string;
      pose: {
        base: "centre" | "drained" | "flooded" | "recede" | "finale";
        tweaks?: Partial<Keyframe>;
      };
      beat: Omit<BeatData, "index" | "id">;
      prompt?: string;
      choices?: { label: string; to: string }[];
    }
  >;
  recording?: JourneyRecording;
};
```

This is descriptive. The imported types in `app/journey/defs.tsx` remain canonical.

### Minimal valid journey

```json
{
  "slug": "generated-story",
  "name": "Generated story",
  "rules": {
    "start": "intro",
    "maxDepth": 2,
    "allowRewind": true,
    "allowReplay": true
  },
  "nodes": {
    "intro": {
      "short": "start",
      "pose": {
        "base": "centre"
      },
      "beat": {
        "layout": "center",
        "title": ["A generated page,", "one valid object."],
        "glass": 1,
        "lede": "The renderer owns the layout; the document owns the story."
      },
      "prompt": "Continue?",
      "choices": [
        {
          "label": "Show the ending",
          "to": "ending"
        }
      ]
    },
    "ending": {
      "short": "ending",
      "pose": {
        "base": "finale"
      },
      "beat": {
        "layout": "center",
        "title": ["End with", "a clear action."],
        "glass": 1,
        "links": [
          {
            "href": "/",
            "label": "Return home"
          }
        ]
      }
    }
  }
}
```

### Journey validation rules

A generator must ensure:

1. the document is an object;
2. `slug` matches `^[a-z0-9-]{1,64}$`;
3. `name` is non-empty;
4. `nodes` is a non-empty object;
5. `rules.start` names an existing node;
6. every node has `short`;
7. every node has a two-line `beat.title`;
8. every node uses a known pose;
9. every choice target exists;
10. every intended ending has no choices;
11. `maxDepth` is at least the longest intended legal path, unless truncation is deliberate;
12. IDs remain stable after publication because URLs, traces, and recordings contain them; and
13. authored files omit `recording` unless the task explicitly concerns recorded state.

The current validator enforces the structural subset in `validateDefinition`. A generator should enforce the stricter authoring rules above before calling it.

### Journey runtime behavior

- `resolveDefinition` applies defaults and converts poses to complete keyframes.
- The active path begins at `rules.start`.
- The visited path is the active track: one resolved leaf per visited node.
- A choice appends one legal target.
- Rewind removes path state only when allowed.
- Replay performs recorded full-path snapshots only when allowed.
- A node without choices, or a path at `maxDepth`, is an ending.
- Non-journey CTA links open in a new tab during a walk.
- Shared URL paths are validated against actual graph edges.
- Invalid definitions and paths are refused with a note rather than crashing.

### Derived journeys

A journey document does not have to be authored by hand. `lib/research-journey.ts`
derives one from a research note: the note's `h2` headings become chapters, and
each chapter becomes a beat with a two-line title, a compact lede, and at most
one detail structure taken from what the chapter contains.

**Shape follows length.** Six sections or fewer derive a *scroll* document:
beats in order, no prompts, no choices, `rules: { start }` and nothing else.
That is the same shape `app/how-it-works/story.ts` ships by hand, expressed as
JSON. Only a note longer than six sections earns a graph, with entry points at
the opening and an exit at every chapter. Branching a four-section note would
only ask the reader to choose what to miss, and a document nobody forks should
not carry the vocabulary of forking.

Rules for any derivation of this kind:

- **Derive, never write.** Every line of copy in the output already exists in
  the source. A generated document has no standing to make a claim of its own.
- **Say what was cut.** A beat that condenses a longer list or table says so in
  its caption. Silent truncation reads as the whole thing.
- **Validate in the builder, not at the render.** `buildResearchJourney` throws
  on an invalid document, so a derivation bug fails the build instead of
  shipping a route the engine would refuse.
- **Deterministic ids.** Node ids come from headings, not positions, because
  shared trail URLs contain them.
- **One builder, every consumer.** The page and the API call the same function,
  so `/journey/read/<slug>` and `GET /api/journeys/research-<slug>` cannot
  disagree.
- **Derived slugs are not files.** `research-*` is served from the note on
  every read; the write routes refuse those slugs so `.quirq` never holds a
  stale copy.
- **Rotate poses, do not invent narrative.** A derived document cannot read
  intent, so the pose rotation carries the rhythm and the copy carries the
  meaning. Document the rotation rather than pretending it is authored.

### The loading engine

`components/journey/engine.tsx` takes one document, however it arrives (a prop,
a slug fetched from the API, pasted text, an opened file), validates it through
`loadDefinition`, and shows it. It renders beats, the trail, and the choices,
and deliberately nothing else: traces, recordings, replay and the `.quirq`
library belong to the studio at `/journey`. Both sit on the `defs.tsx` contract,
so a document that walks in one walks in the other.

The document decides which of two readings it gets, and no flag is involved:

- **no node offers a choice** → a scroll page. Every node renders as a beat in
  document order, and the whole document is the choreography track, so the
  glass performs it top to bottom. No trail, no prompts.
- **any node offers a choice** → a walk. One beat per visited node, the trail
  rewinds, and the chosen path is the track.

Node order in the JSON is therefore load-bearing for a scroll document. Keep
the opening node first.

Use the engine for any new surface that shows a journey. Do not add a third
walk implementation, and do not grow this one into a second studio.

### Journey persistence

- Reads are provided by `app/api/journeys`.
- Definition and recording writes are development-only.
- Cross-origin browser writes are refused.
- Writes are atomic: temporary file, then rename.
- Production filesystems are not an authoring database.
- To publish a journey, commit the JSON and deploy it with the application.
- Do not remove the development-only guard to make production editing “work.”

## Page authoring mode 4: generated `[slug]` routes

Use this for a content collection where every record needs:

- its own path;
- its own metadata;
- indexing and sharing;
- direct server rendering; and
- build-time generation when the record set is known.

The research route is the canonical example.

### Next.js 16 pattern

```tsx
export function generateStaticParams() {
  return ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = getItem((await params).slug);
  return item
    ? { title: item.title, description: item.description }
    : {};
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = getItem((await params).slug);
  if (!item) notFound();
  return <Article item={item} />;
}
```

Rules:

- `params` and `searchParams` are promises in this Next.js version.
- Await them.
- Use `notFound()` for unknown records.
- Keep metadata in a Server Component.
- Prefer direct server reads over calling this app’s own route handler from a Server Component.
- Use route handlers when a real HTTP boundary is needed.
- Do not place `page.tsx` and `route.ts` in the same route segment.

### Listing surfaces for a catalog

A catalog usually needs more than one listing: a front page, numbered pages,
and one archive per category. Build those as static sibling segments, not as
query strings, so every listing prerenders and keeps its own indexable URL.

The research route is the canonical example:

```text
app/research/page.tsx                → front page of the stream
app/research/page/[page]/page.tsx    → numbered pages, from two upward
app/research/topic/[topic]/page.tsx  → one archive per topic
app/research/[slug]/page.tsx         → one record
```

Rules:

- Resolve first, render second. One resolver in the data module (`resolveIndex`)
  turns a request into a resolved view or `null`; the routes are thin and
  `notFound()` on `null`. Unknown categories, page one under a second URL, and
  pages past the end all fail closed.
- One view component renders every listing, so the surfaces cannot drift apart.
- Do not paginate with `searchParams`: it opts the listing into request-time
  rendering and gives one listing several URLs.
- A static sibling segment shadows the `[slug]` route, so every listing segment
  is a reserved record slug. Record them next to the data (`page`, `topic`).
- Keep ordinals stable. A record's number is its position in the source
  collection, not its position on the page being rendered.
- Label controls by position, not by date, unless the collection is genuinely
  ordered by date.

## The story renderer contract

`StoryBeat` understands this vocabulary:

| Field | Requirement | Generation rule |
|---|---|---|
| `index` | Runtime page only | Contiguous render order. Omitted inside journey JSON. |
| `id` | Runtime page only | Unique, stable, semantic. Omitted inside journey JSON. |
| `layout` | Required | `center`, `left`, or `right`. |
| `title` | Required | Exactly two intentional lines. |
| `glass` | Optional | `0` for first title line or `1` for second. |
| `marker` | Optional | Short mono chapter label, usually `01 · phrase`. |
| `lede` | Optional | One compact supporting paragraph. |
| `rows` | Optional | Open numbered title/note rows. |
| `panelRows` | Optional | Numbered title/note rows in one panel. |
| `tiles` | Optional | Label/body tiles. |
| `code` | Optional | One preformatted string. |
| `caption` | Optional | Small mono qualifier or source note. |
| `links` | Optional | Calls to action with `solid` or `ghost` tone. |

### Content-generation rules

When generating copy:

1. Give every beat one job.
2. Use the first beat for the promise, middle beats for evidence or mechanism, and the final beat for synthesis or action.
3. Write exactly two headline lines; do not rely on automatic wrapping to create the intended rhythm.
4. Keep each headline line compact enough for the display scale.
5. Avoid repeating the title in the lede.
6. Prefer concrete nouns and verbs over generic technology claims.
7. Use one dominant detail structure per beat: `rows`, `panelRows`, or `tiles`.
8. A caption qualifies evidence; it must not carry the main claim.
9. Use `ghost` for the secondary CTA.
10. Preserve factual qualifiers such as “illustrative.”
11. Do not imply supported ecosystems are customers.
12. Keep external claims traceable to repository content or user-provided sources.
13. Do not generate fake metrics, customer names, integrations, or testimonials.

### Layout-generation rules

- `center`: openings, major reveals, conclusions.
- `left`: denser explanation while the form can occupy the right.
- `right`: contrast beat while the form can occupy the left.
- Alternate left and right when it helps the continuous shot, but do not alternate mechanically.
- Keep a beat near one viewport of narrative weight.
- Interludes may be shorter or longer but must deliberately remain unregistered.
- Fixed complete grids are preferred. Do not slice visual items at viewport edges.

## Scene generation and pose rules

### Pose presets

| Preset | Narrative use |
|---|---|
| `centre` | Neutral opening or reset |
| `drained` | Cost, failure, doubt, constraint |
| `flooded` | Value, proof, color, breakthrough |
| `recede` | Data-heavy beat where copy must dominate |
| `finale` | Closing synthesis and action |

Use a preset first. Add `tweaks` only for a narrative reason.

### Fourteen channels

```text
position: x, y, z, scale
attitude: spin, tiltX, tiltZ
optics:   chroma, thickness, distortion, aniso, rough, ior
light:    burst
```

Meanings:

- `x`, `y`: subject placement;
- `z`: apparent dolly;
- `scale`: subject size;
- `spin`: Y rotation rate, not an absolute angle;
- `tiltX`, `tiltZ`: absolute attitude targets;
- `chroma`: spectral channel separation;
- `thickness`: refraction depth;
- `distortion`: surface distortion;
- `aniso`: directional blur;
- `rough`: surface roughness;
- `ior`: index of refraction;
- `burst`: local light-source level before global gain.

Rules:

1. Do not write a full `tweaks` object when a named preset already matches.
2. Keep generated values inside the editor ranges unless a task explicitly explores outside them.
3. Use `chroma` and `burst` together with restraint; clipping the core destroys the glass read.
4. Use positive `z` and larger scale for approach; negative `z` and smaller scale for recession.
5. Remember narrow screens automatically collapse `x` and reduce fit.
6. Test the pose while copy is present, not against an empty canvas.
7. Do not adjust the fixed camera to compensate for one bad pose.

## Existing rule engines

There are three different existing rule systems.

### 1. Walk rules

Location: `JourneyDefinition.rules`.

They govern:

- opening node;
- maximum path depth;
- rewind permission; and
- replay permission.

These rules affect navigation state, not content validity or responsive layout.

### 2. Graph edge rules

Location: each node’s `choices`.

They define legal next nodes. A share link or replay path cannot invent an edge.

### 3. Choreography inclusion rules

Location: `ChoreoNode.when`.

They receive an explicit `TrackContext`, currently `{ width }`, and decide whether a node and its subtree participates in the resolved track.

These run on mount and resize, not per frame.

Do not encode one kind of rule inside another. For example:

- do not use `maxDepth` as a responsive layout rule;
- do not use a pose tweak to hide content;
- do not make a graph choice depend on an implicit DOM query;
- do not put executable predicates inside journey JSON.

## Rules-engine architecture for future generation

When adding more generation rules, extend the system as a pipeline:

```text
raw blueprint
  → parse
  → normalize defaults
  → validate structure
  → evaluate deterministic rules against explicit context
  → resolve to current canonical types
  → render with existing components
  → emit diagnostics
```

Never let rendering be the first place malformed generation data is discovered.

### Rule-design principles

1. **Typed:** define the rule shape once.
2. **Declarative:** JSON describes conditions and effects; it does not carry JavaScript.
3. **Deterministic:** the same blueprint and context produce the same resolved page.
4. **Pure:** rule evaluation does not write files, touch the DOM, or mutate global runtime state.
5. **Explicit context:** audience, viewport class, flags, and locale are passed in.
6. **Ordered:** precedence is documented and stable.
7. **Fail closed:** unknown condition or effect types are rejected.
8. **Diagnosable:** return rule IDs and reasons, not only the final object.
9. **Versioned:** add `schemaVersion` before persistent generation blueprints gain incompatible changes.
10. **Resolved once:** evaluate structural rules before render or on explicit context change, never inside the per-frame sampler.

### Recommended precedence

Apply rules in this order:

1. repository invariants;
2. schema defaults;
3. global generation policy;
4. page-level policy;
5. matching contextual rules;
6. explicit beat or node values;
7. visual pose tweaks;
8. final validation.

An explicit value may override a default. It may not override a repository invariant.

### Safe declarative condition model

If persistent generation rules are requested, prefer a constrained union:

```ts
type GenerationContext = {
  viewport: "compact" | "wide";
  audience?: string;
  locale?: string;
  flags: Record<string, boolean>;
};

type Condition =
  | { kind: "viewport"; is: GenerationContext["viewport"] }
  | { kind: "audience"; is: string }
  | { kind: "locale"; is: string }
  | { kind: "flag"; name: string; equals: boolean }
  | { kind: "all"; conditions: Condition[] }
  | { kind: "any"; conditions: Condition[] }
  | { kind: "not"; condition: Condition };
```

Effects should also be a closed union, for example:

```ts
type GenerationEffect =
  | { kind: "include-node"; id: string }
  | { kind: "exclude-node"; id: string }
  | { kind: "set-start"; id: string }
  | { kind: "set-pose"; id: string; pose: PoseSpec }
  | { kind: "set-layout"; id: string; layout: BeatData["layout"] };
```

Do not use:

- `eval`;
- `new Function`;
- arbitrary property paths from JSON;
- executable JavaScript strings;
- hidden reads from `window`, cookies, or the DOM;
- user-authored regular expressions without limits; or
- effects that directly mutate the renderer.

This model is a recommended extension, not an active journey schema. Do not add these keys to `.quirq` files until parsing, types, validation, resolution, tests, and migration behavior are implemented together.

### Recommended generation blueprint

If the task is to build a general page-generation engine, normalize every input into a versioned blueprint before producing `BeatData` or `JourneyDefinition`:

```ts
type PageBlueprint = {
  schemaVersion: 1;
  kind: "linear" | "journey";
  slug: string;
  metadata: {
    title: string;
    description: string;
  };
  policy?: {
    minBeats?: number;
    maxBeats?: number;
    requireCta?: boolean;
    allowedLayouts?: BeatData["layout"][];
  };
  // Use exactly one based on kind.
  beats?: Array<Omit<BeatData, "index" | "id"> & { id: string; pose: PoseSpec }>;
  journey?: JourneyDefinition;
};
```

Implementation requirements:

1. Keep the blueprint module server-safe.
2. Separate `parseBlueprint`, `normalizeBlueprint`, `validateBlueprint`, and `resolveBlueprint`.
3. Resolve linear blueprints to `BeatData[]` plus `ResolvedLeaf[]`.
4. Resolve journey blueprints through the existing journey resolver.
5. Reuse `StoryBeat`; do not generate JSX strings.
6. Return structured diagnostics:

```ts
type Diagnostic = {
  severity: "error" | "warning";
  code: string;
  path: string;
  message: string;
};
```

7. Reject output when any error diagnostic exists.
8. Add fixture blueprints and tests before connecting external or AI-generated input.
9. Preserve stable IDs across regeneration.
10. Never silently delete user-authored nodes or recordings.

Do not create this engine preemptively during an ordinary page request. Use it only when the user asks for a reusable generator or when multiple real consumers justify it.

## Generated-page planning contract

Before creating files, write down or infer this plan:

```text
route:
page goal:
audience:
authoring mode:
data source:
static, client-grown, or request-time:
beat/node IDs:
narrative sequence:
choice graph, if any:
pose sequence:
metadata:
primary and secondary CTA:
navigation change:
validation:
```

If a missing answer would materially change architecture or create unsafe production behavior, ask. Otherwise choose the simplest reasonable default and proceed.

## Next.js 16 rules for this repository

1. Use App Router only.
2. Pages and layouts are Server Components by default.
3. Add `"use client"` only at the narrow interactive boundary.
4. A client component cannot be `async`.
5. Server-to-client props must be serializable.
6. `params`, `searchParams`, `cookies()`, and `headers()` are async.
7. Use `next/navigation`, not `next/router`.
8. Use metadata exports, not `next/head`.
9. Use `generateStaticParams` for known dynamic records.
10. Use route handlers for real HTTP boundaries.
11. Do not put `route.ts` and `page.tsx` in the same segment.
12. Route handlers use Web `Request` and `Response`; they do not render React.
13. Use the default Node.js runtime for the filesystem-backed journey APIs.
14. Do not introduce `middleware.ts`; Next.js 16 uses `proxy.ts`.
15. Do not use `getStaticProps`, `getServerSideProps`, or `next export`.
16. Do not turn the root layout into a client component to solve a local interaction.
17. Keep Three.js imports behind the existing lazy `scene.tsx` boundary.
18. Do not read the app’s own HTTP API from a Server Component when direct module or filesystem access is appropriate.

The current `/journey` route intentionally restores `?j=` and `?t=` after hydration inside the client journey runtime. Moving those query params to the server page would opt the route into request-time rendering and change its initial/default behavior. Do not make that change casually.

## Navigation and metadata rules

For every new route:

1. Add specific `Metadata` in its server page.
2. Use the root title template; do not repeat `· quirq` manually.
3. Write a real description, not a copy of the title.
4. Add the route to navigation only when it belongs in the global information architecture.
5. If it mounts `StagePage`, update `Nav`’s `onStage` route detection.
6. Use `Link` for internal navigation unless journey behavior intentionally opens away from the walk.
7. Preserve PDF new-tab behavior.
8. Do not claim a page is indexable if it is an internal tool; the editor sets `robots.index` to false.

## Performance rules

- Keep `three`, `@react-three/fiber`, and `@react-three/drei` out of server content modules.
- Do not import the scene directly from a page.
- Do not route frame values through React state.
- Do not allocate arrays or objects in `useFrame` without a measured reason.
- Reuse the static `CHANNELS` list.
- Dispose created Three.js resources.
- Preserve automatic quality selection unless profiling justifies a change.
- Preserve the no-WebGL still fallback.
- Parallelize independent server reads.
- Avoid client fetch waterfalls when a Server Component can pass initial data.

## Accessibility rules

- Keep correct heading order.
- Keep body copy in the DOM.
- Respect reduced motion.
- Maintain no-JavaScript readability.
- Keep focus-visible states.
- Make horizontally scrollable code and tables keyboard reachable.
- Give controls real labels.
- Do not make a clickable `div`.
- Announce external new-tab behavior.
- Preserve contrast over the brightest pose, not only over black.
- Never remove a text scrim because it appears unnecessary at one viewport.

## Verification matrix

Match verification to the change.

### Any page or content change

- Check the route loads.
- Check metadata.
- Check every beat registers.
- Check title wrapping at narrow and wide widths.
- Check copy contrast over the live pose.
- Check CTA destinations.
- Run `pnpm build`.

### Data-driven story

- Verify unique IDs and contiguous indices.
- Verify beat count matches the active track.
- Verify story data is serializable.

### Journey JSON

- Parse it as JSON.
- Run or call `validateDefinition`.
- Verify filename equals slug.
- Verify every choice target exists.
- Walk every branch.
- Verify the longest intended path against `maxDepth`.
- Test rewind and replay flags.
- Test `/journey?j=<slug>`.
- Test one shared trace path.

### Choreography or scroll change

- Capture the relevant golden baseline before the change.
- Capture after the change.
- Explain every non-zero delta.
- Test reduced motion.
- Test narrow and wide viewports.
- Ensure the final frame loop remains allocation-free.

### API change

- Test success and rejected input.
- Test cross-origin rejection where relevant.
- Test production write rejection.
- Preserve atomic writes.
- Confirm no server-only module crosses into a client graph.

### Dynamic `[slug]` route

- Test `generateStaticParams`.
- Test one valid slug and one missing slug.
- Verify `notFound()`.
- Verify dynamic metadata.
- Verify params are awaited.

## Definition of done

A generated or new page is complete only when:

- the correct authoring mode was used;
- route and metadata are present;
- content is expressed in canonical types;
- IDs and indices are stable and valid;
- the stage track matches the rendered beats;
- rules are normalized, validated, and deterministic;
- navigation changes are intentional;
- accessibility fallbacks remain intact;
- local links and JSON parse;
- `pnpm build` passes; and
- the handoff states which files define content, rules, and visuals.

## Common failure modes

Avoid these:

- generating a TSX route for every journey JSON;
- inventing a second generic beat renderer;
- putting page-specific conditions in `StoryBeat`;
- using array position as identity after adding conditional branches;
- adding six beats to a five-leaf published track;
- putting functions inside persistent JSON;
- accepting dangling choices and hoping the UI handles them;
- changing the camera to fix one pose;
- separately tuning burst, environment, and scrims;
- importing Three.js into `story.ts`;
- making `page.tsx` a client component only to read a query string;
- writing to `.quirq` in production;
- editing an existing recording away while regenerating a definition;
- treating supported ecosystems as customer logos;
- inventing metrics or evidence;
- skipping a build because the change is “only data.”

## Canonical examples

Use these before inventing a pattern:

| Need | Example |
|---|---|
| Data-driven stage page | `app/dynamic` |
| Scene-control documentation | `app/scenes` |
| Journey-authoring documentation | `app/how-it-works` |
| Custom composed beats | `app/page.tsx`, `components/beats` |
| Branching generated page | `app/journey`, `.quirq/journeys/default.json` |
| Live track override | `app/editor/editor.tsx` |
| Static generated route | `app/research/[slug]/page.tsx` |
| Paginated, filtered listing | `app/research/page.tsx`, `app/research/page/[page]`, `app/research/topic/[topic]`, `components/research/index-view.tsx` |
| Journey derived from content | `lib/research-journey.ts`, `app/journey/read/[slug]/page.tsx` |
| Walking any journey document | `components/journey/engine.tsx`, `app/journey/load/page.tsx` |
| Catalog resolver and pagination rules | `lib/research.ts` (`resolveIndex`) |
| Framed content image | `components/research/banner.tsx` |
| Generic renderer contract | `components/story/types.ts`, `components/story/story-beat.tsx` |
| Beat registration | `components/ui/primitives.tsx`, `lib/beat-registry.ts` |
| Scroll mapping | `components/scroll-runtime.tsx` |
| Rule-based track authoring | `components/stage/choreo-tree.ts` |
| Runtime sampling | `components/stage/choreography.ts` |
| Pose and journey validation | `app/journey/defs.tsx` |
| Filesystem API guards | `app/api/journeys/guards.ts` |
| Visual regression data | `lib/golden.ts`, `docs/goldens` |

When an existing example and this guide appear to disagree, inspect the current canonical type and runtime code. Update this guide in the same change if the architecture has intentionally evolved.
