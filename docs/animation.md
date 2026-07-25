# How the scroll animation works, and a path from list to tree

Part 1 documents the system as it was originally built; its per-frame story
is unchanged. Part 2 was the migration proposal, and phases 0 to 4 are now
IMPLEMENTED, golden-gated (max delta 0.000000 against docs/goldens/*.json):
the harness is `window.__golden` (dev only, lib/golden.ts), the sampler takes
the track as an argument, sections register via lib/beat-registry.ts (the
data-beat query remains as a fallback; a section with custom layout registers
directly, see invite.tsx), and the track resolves from the CHOREOGRAPHY tree
in components/stage/choreo-tree.ts with cascading partial keyframes and
`when` predicates re-resolved on resize. Phase 5 (the first live branch or
sub-beat) is intentionally left for a design decision.

---

## Part 1 · The system today

### The cast

| Layer | File | Job |
|---|---|---|
| Scroll runtime | `components/scroll-runtime.tsx` | Owns Lenis smooth scrolling; turns raw scroll into a fractional beat index |
| Stage store | `lib/stage-store.ts` | A plain mutable module object; the bus between DOM-world and GL-world |
| Choreography | `components/stage/choreography.ts` | `KEYFRAMES`: one full keyframe per beat, plus the sampler and damper |
| The stage | `components/stage/*` | The react-three-fiber canvas: glass ribbon, light burst, spectrum environment |
| Beats | `components/beats/*` + `ui/primitives.tsx` | Full-viewport DOM sections carrying `data-beat={i}` |
| Entrances | `motion` (Reveal / Rise / hero) | Once-per-element entrance animations, driven by IntersectionObserver, not by the scroll sample |
| Glass pools | `components/ui/glass.tsx` | Rasterized mask holes in the text scrims; re-cut on settle/resize, unrelated to the per-frame path |

### What happens when you scroll, in order

1. **Input.** The wheel/touch goes to Lenis (`duration 1.15`, long-tail
   easing). Lenis animates the *native* window scroll on a rAF loop the
   runtime drives (`lenis.raf` inside `requestAnimationFrame`).

2. **Write.** On every Lenis `scroll` event, `write(scroll, limit)` runs:
   - `toBeat(scroll)` computes the **eye line** (`scroll + viewport/2`) and
     finds which two adjacent section centres it sits between, returning a
     fractional index: `2.37` means "37% of the way from beat 2's centre to
     beat 3's centre". Section centres were measured once (and on resize /
     font-swap) into a sorted array `centres[]` from every `[data-beat]`
     element, ordered by beat index.
   - The result is written to `stage.beat`, whole-page progress to
     `stage.progress`, and `--scroll` onto `<html>` (the nav's progress rule
     reads that with zero React involvement).

3. **Read, per GL frame.** Inside the canvas, `GlassForm.useFrame` and
   `LightBurst.useFrame` each call `sampleKeyframes(stage.beat, out)`:
   - The sampler clamps the index, takes `KEYFRAMES[i]` and `KEYFRAMES[i+1]`,
     applies a smoothstep to the fraction, and lerps **every channel**
     (position, scale, spin rate, tilts, chromatic aberration, thickness,
     distortion, roughness, IOR, burst level) into a preallocated `target`
     object. No allocation per frame.
   - Each live channel is then **damped** toward its target
     (`damp`, frame-rate-independent exponential approach, λ = 3.2, or 400 =
     effectively snap under reduced motion). Damping is why fast scrolling
     feels like a camera move rather than a scrub.
   - The damped values are written straight onto the Three.js group transform
     and the transmission material's uniforms. The burst plane also tracks the
     form's x at 2.2× parallax and scales its shader intensity by the beat's
     `burst` × the `LIGHTING` preset gain.

4. **Not involved.** React renders nothing during scroll: the store is a
   module singleton precisely so no state flows through React at 60fps. The
   `motion` entrances and the glass-pool mask cuts key off IntersectionObserver
   and settle-timers, not off `stage.beat`.

### So is it a linked list of components?

No, and nothing "loads" as you scroll. Every component mounts exactly once;
scrolling only changes numbers. The structure is **two parallel flat arrays
coupled by index**:

```
DOM:          section[data-beat=0] ... section[data-beat=4]   →  centres[0..4]  (measured px)
Choreography: KEYFRAMES[0..4]                                 (hand-tuned values)
```

Adjacency is implicit (`i`, `i+1`), which makes it a **piecewise timeline**
(a keyframe track, like an animation curve), not a list of nodes with links.
The per-frame cost is O(1)-ish: a ≤4-step scan to find the bracket, one lerp
per channel, one damp per channel. A section without `data-beat` (the
ecosystem shelf) simply does not exist on the timeline; the glass keeps
travelling from beat 0 toward beat 1 behind it. That is the extension point
the current design gives you: interludes are free, but they cannot *say*
anything to the 3D.

### The invariants that keep it coherent

- **One object, never remounted.** Continuity of the single ribbon is the
  design; any refactor must keep the mesh alive across the whole page.
- **Beat index == keyframe index** is a convention, enforced by nothing but
  discipline. (This is the weakest joint in the design, and the first thing
  Part 2 fixes.)
- **Sections stay ≈ one viewport tall**, or a beat's visual peak (measured at
  its centre) desyncs from where its copy reads.
- **The hot path never touches React**, and never allocates.
- **Damping decouples input from output**, which is also what makes timeline
  *changes* safe: wherever the target jumps, the live values glide.

---

## Part 2 · From a flat list to a tree

### What a tree would buy

The flat array is the right size for today's page: five hand-tuned shots, one
object, one narrative path. A tree pays for itself the moment any of these
land:

1. **Sub-beats.** A beat's interior gets its own micro-choreography: e.g. the
   mint rule inside `delivery` pulling the form closer as the equation
   assembles, then releasing it, without promoting those moments to top-level
   beats and re-numbering everything.
2. **Branches.** Different timelines chosen by state: a stage variant for
   `/research`, a shorter choreography under `max-width: 820px`, an A/B
   narrative. Today the runtime hard-assumes the one home-page track.
3. **Dynamic composition.** Sections that register themselves at runtime
   (CMS/MDX-driven pages, conditional beats), instead of a build-time array
   that must match a build-time set of `data-beat` attributes by hand.
4. **Cascade.** Partial keyframes that inherit: a subtree sets `burst` and
   palette once; leaves override only position/optics. Today every keyframe
   must restate all 14 channels.
5. **Named actors later.** Tree nodes could namespace channels per object
   (`ribbon.*`, `burst.*`, a future second form), which the flat shape cannot
   express without column explosion.

### Proposed model

```ts
type ChoreoNode = {
  id: string;                      // "delivery", "delivery.mint"
  keyframe?: Partial<Keyframe>;    // cascades over ancestors; leaves resolve full
  when?: () => boolean;            // branch predicate: route, media query, flag
  children?: ChoreoNode[];
};
```

- **DOM binding by id, not by index.** A `useBeatSection("delivery.mint")`
  hook (or a `<Beat id>` prop) registers the element with a registry context.
  The string path replaces the `data-beat` integer convention, so numbering
  stops being load-bearing.
- **The tree is an authoring structure, not a runtime one.** On registration
  change, resize, or font swap (never per frame), a resolver runs:
  1. filter the tree by `when` predicates;
  2. depth-first flatten to an ordered list of **leaves**;
  3. resolve each leaf's effective keyframe by merging root → ancestors →
     leaf (every leaf ends up *full*, so interpolation never has channel
     holes);
  4. measure each leaf's registered element into the same `centres[]` array
     the runtime already uses.
- **The per-frame path does not change.** Same bracket scan, same smoothstep,
  same damp, same zero allocations. Tree traversal cost lives entirely at
  (re)build time. Interior nodes are grouping + cascade + predicate only;
  a parent that wants its own presence on the timeline declares a keyframe
  *and* registers an element, making it a leaf like any other.
- **Branch switches are safe by construction:** when a predicate flips and the
  flattened track changes, the damping layer glides the form from wherever it
  was to the new targets, the same way it already absorbs fast scrolling.

### Migration plan (each phase shippable, pixel-identical until phase 4)

| Phase | Work | Proof it changed nothing |
|---|---|---|
| 0 | **Golden harness.** A dev-only script samples `toBeat` + `sampleKeyframes` at fixed scroll fractions and snapshots the numbers to JSON. | The snapshot is the baseline. |
| 1 | **Track-agnostic sampler.** `sampleKeyframes(track, beat, out)` takes the track as an argument; `KEYFRAMES` becomes one track passed in. | Golden numbers unchanged. |
| 2 | **Registry.** `BeatProvider` + registration hook; `Beat` registers its element and id. `ScrollRuntime` reads the registry instead of querying `[data-beat]`; keeps the attribute as a fallback for one release, then drops it. | Golden numbers unchanged; DOM identical. |
| 3 | **Tree resolver.** Today's five beats expressed as five root leaves with full keyframes; resolver = filter → flatten → merge → measure. | Golden numbers unchanged by construction. |
| 4 | **Capabilities.** Partial keyframes + cascade; `when` predicates; nested sub-beat spans; optional per-actor namespaces. | New goldens per branch/subtree. |
| 5 | **First real use.** Sub-beats inside `delivery`'s mint rule, or a `/research` stage variant behind a predicate. | Design review against the page. |

### Risks and their answers

- **The one-viewport rule multiplies.** Every leaf's visual peak still lands
  at its element's centre; nested leaves inside one section subdivide that
  span, so short sub-elements produce fast transitions. Mitigation: document
  a minimum span per leaf and have the resolver warn in dev when a leaf's
  measured span is under ~60vh.
- **Measurement thrash** from dynamic registration: debounce rebuilds and use
  a single ResizeObserver, mirroring what GlassPool already does.
- **Authoring complexity.** Cascade means a keyframe's effective value is no
  longer visible in one place. Mitigation: the dev harness prints resolved
  leaves as a table; keep full keyframes for the five root beats.
- **The hot path must stay allocation-free.** The resolver builds flat
  `Float64Array`-friendly structures once; `useFrame` never sees the tree.
- **The single-object invariant is untouched** by all of this; only *where
  the numbers come from* changes, not what consumes them.

### Recommendation

Do phases 0 to 2 whenever the code is next touched: they remove the fragile
index convention and cost little. Hold phases 3 to 5 until a concrete need
from the list at the top exists (sub-beats, a second route with a stage, or
CMS-driven sections). For a five-beat, hand-tuned page, the flat track is not
a limitation; it is the appropriately sized tool.
