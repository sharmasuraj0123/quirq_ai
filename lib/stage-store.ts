/**
 * A module-level store instead of React context.
 *
 * The <Canvas> from react-three-fiber renders through its own reconciler root,
 * so provider context from the DOM tree is not reliably visible inside it.
 * More importantly, scroll and pointer values change every frame — routing them
 * through React state would re-render the whole page ~60×/second. The scroll
 * runtime writes here; useFrame reads here. No renders, no context bridge.
 */
export const stage = {
  /** Fractional beat index. 0 = beat 0 centred, 1.5 = midway between 1 and 2. */
  beat: 0,
  /** Whole-document scroll progress, 0 → 1. */
  progress: 0,
  /** Pointer position in clip space, −1 → 1. */
  pointerX: 0,
  pointerY: 0,
  /** True when the visitor asked for less motion. */
  reduced: false,
  /** Set once the first frame has rendered, so we can fade the stage in. */
  ready: false,
};

export type StageStore = typeof stage;
