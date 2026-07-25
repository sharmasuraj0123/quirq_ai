# quirq · landing site

The marketing site for [quirq](https://quirq.ai), the unit of verified agent work: tokens meter what agents consume, quirqs meter what they deliver. One click, and your agents run in an environment that snapshots state, verifies outcomes, and mints value against an auditable ledger.

The site is deliberately not a wall of copy. It is one continuous 3D shot: a twisted glass ribbon travels behind five "beats" of content, re-staged by scroll, with color doing the arguing (drained monochrome at the tokens beat, full spectrum at the quirqs beat).

## Pages

| Route | What it is |
|---|---|
| `/` | The five-beat scroll story: hero, ecosystem shelf, tokens, quirqs, ledger, invite |
| `/what-is-quirq` | The explainer cut: same stage and keyframe track, its own five beats (`app/what-is-quirq/beats.tsx`) |
| `/how-it-works` | The journey-authoring manual: the .quirq file's shape, node anatomy, and what each key affects |
| `/beats` | The beats-array deep dive: fractional traversal, a live `stage.beat` meter, and the array's honest limits |
| `/scenes` | The scene-customization guide: anatomy, the fourteen knobs, camera-by-relativity, pose presets |
| `/editor` | The live page editor: beats, tree, registry and golden tabs; drag the real glass, diff captures, save drafts out |
| `/journey` | The branching walk: choices generate the page, traces save/share/replay, and whole journeys (tree + rules) load from the local `.quirq/journeys/` folder |
| `/golden` `/registry` `/tree` | Feature pages for the migration's machinery: the golden harness, the beat registry, the choreography tree |
| `/research` | Research index: single posts adapted from [docs.xo.builders/research](https://docs.xo.builders/research) |
| `/research/[slug]` | Individual research posts |
| `/quirq-whitepaper.pdf` | The whitepaper (static) |
| `/llm.txt` | The whitepaper as one plain-text document for language models; the "Open in" menu hands this to agents |

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **Tailwind 4**
- **react-three-fiber 9 + drei 10 + three** for the glass stage (lazily imported, ~1MB stays off the critical path)
- **motion 12** for entrance choreography · **Lenis** for smooth scroll

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
```

The workspace launch config (`.claude/launch.json` at the workspace root) runs it as `quirq-web` on port 3210.

## How the page works

A full walkthrough of the scroll/animation system (and a proposal for evolving
its flat beat list into a tree) lives in [docs/animation.md](docs/animation.md).

```
app/
  page.tsx              the home beats, in order
  what-is-quirq/        a second stage page: same shell, different beats
  how-it-works/         a third: the system explaining itself, plus the plan
  beats/                a fourth: the traversal deep dive, with a live meter
  scenes/               the scene-customization guide, as story data
  editor/               the live page editor (inspector over the real stage)
  journey/              the branching walk; defs.tsx is the definition model
  api/journeys/         reads (and, in dev, writes) .quirq/journeys/*.json
  golden/ registry/ tree/  feature pages, each a story.ts + StoryBeat map
  research/             index + [slug] post pages
  globals.css           design tokens: void black, ink, the spectrum gradient
components/
  stage-page.tsx        the shared shell: runtime + stage + overlays + nav
  story/                BeatData type + the StoryBeat renderer (data-driven middles)
  scroll-runtime.tsx    Lenis + rAF loop; measures the active beat, writes --scroll
  stage/
    stage.tsx           fixed full-viewport canvas host
    scene.tsx           lazy three/drei entry point (keep the imports here)
    glass-form.tsx      MeshTransmissionMaterial ribbon
    ribbon-geometry.ts  procedural twisted ribbon, 4 quad strips
    choreo-tree.ts      the choreography as a tree: cascade + branch predicates
    choreography.ts     resolved track state + the track-agnostic sampler
    light-burst.tsx     shader plane upstage; the glass needs light to refract
  beats/                hero, ecosystem, consumption, delivery, ledger, invite
  ui/
    nav.tsx             fixed nav, page links, scroll progress rule
    open-in.tsx         early-access split button + "open in agent" menu
    primitives.tsx      Beat, Reveal, Rise, TextScrim, Marker, ActionLink, Mark
lib/
  beat-registry.ts      sections self-register; the runtime measures the registry
  golden.ts             dev harness (window.__golden); baselines in docs/goldens/
  lighting.ts           LIGHTING preset: one switch for page brightness
  research.ts           research posts as data; the routes render from this
  spectrum.ts           the seven spectrum stops
```

The invariants that keep it coherent:

- **One object, never remounted.** The ribbon exists once; sections carry `data-beat={n}` and the scroll runtime maps section positions to `choreography.ts` keyframe `n`. A section without `data-beat` (the ecosystem shelf) is invisible to the 3D and the glass just keeps travelling.
- **Brightness is one switch.** `LIGHTING` in `lib/lighting.ts` drives the burst shader, the glass `envMapIntensity`, and both scrim gradients together. Change the preset, never the individual call sites; they are coupled.
- **Text over live 3D always sits on a `TextScrim`.**
- **Fixed geometry only.** No marquees, nothing sliced at an edge; grids stay perfect rectangles (the ecosystem lattice keeps 12 items because 12 divides by its 2/4/6 column counts).
- **Sections stay about one viewport tall**, or a beat's visual peak desyncs from its copy.
- **No JS still renders.** Entrance animations start at `opacity: 0`, so `app/layout.tsx` carries a `<noscript>` override; keep it.

## Editing content

- **Hero copy / CTA:** `components/beats/hero.tsx`. The early-access dropdown and its agent deep links (Claude Code, Codex, Cursor) live in `components/ui/open-in.tsx`.
- **Add a research post:** add an entry to `lib/research.ts` (slug, dek, dated body blocks). The index and post routes pick it up; no other change needed.
- **Ledger numbers:** `components/beats/ledger.tsx`; they trace to the whitepaper's worked quarter, and the "illustrative" caption is load-bearing. Do not drop it.
- **Ecosystem lattice:** the `ECOSYSTEM` array in `components/beats/ecosystem.tsx`. These are supported runtimes and clouds, not customers; never present them as customers.

## The .quirq folder

`.quirq/journeys/*.json` holds journey definitions: the entire node tree
(beats, poses as named presets plus tweaks, prompts, choices) and the rules
(start node, maxDepth, allowRewind, allowReplay). The /journey page lists the
folder, loads any definition live, and in development can store the active
journey back as an editable file. Definitions are validated on load (edges
must resolve, poses must exist); a bad file is refused with a note, never a
crash.

The walk itself is recorded: every transition (start, choose, rewind, loop,
trace jump) is captured with a full path snapshot. Recordings persist to
localStorage everywhere and, in development, are written into the journey's
own JSON as a `recording` key, so the file grows with the walk. At the end of
a branch the page shows the recap and can replay every transition, swapping
the path back through each snapshot while the glass re-walks it. Endings are
circular (Walk again loops to the start node), and any link that leaves the
journey opens in a new tab.

## Deploy

Standard Next.js production build (`pnpm build && pnpm start`), or any host that runs Next 16. All content is static or client-side; there are no server environment variables.
