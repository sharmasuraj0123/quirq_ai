/**
 * Every value that controls how bright the page is, in one place.
 *
 * The look depends on five things staying in balance: the burst shader, the
 * per-beat burst levels, how hard the glass samples the emitter rig, and the
 * two scrims that keep copy readable over it. Tuning them separately is how you
 * end up with a page that is either washed out or dead. Change `LIGHTING` and
 * all five move together.
 */
export type LightingPreset = "max" | "draft" | "mid" | "soft";

/**
 * ─────────────────────────────────────────────────────────────
 *  The one line to change.
 *
 *  "max"  : as bright as the scene goes before the core blows out
 *            to a flat white disc and the ribbon stops reading as
 *            glass. Scrims are at their strongest to compensate. ← current
 *  "draft": the original: hot core, long rays reaching the frame
 *            edges.
 *  "mid"  : draft's brightness with a tighter falloff, so the
 *            glow stays off the paragraphs.
 *  "soft" : dimmest, maximum legibility, least atmosphere.
 * ─────────────────────────────────────────────────────────────
 */
export const LIGHTING: LightingPreset = "max";

export type Lighting = {
  /** Scales every beat's `burst` keyframe. 1 = the values in choreography.ts. */
  burstGain: number;
  /** [falloff, brightness]: larger falloff means a tighter, less spread source. */
  core: readonly [number, number];
  rays: readonly [number, number];
  halo: readonly [number, number];
  bloom: readonly [number, number];
  /** How hard the glass samples the emitter rig. Drives the ribbon's sparkle. */
  envMapIntensity: number;
  backsideEnvMapIntensity: number;
  /** Pool of shadow behind body copy: the TextScrim eclipse, everywhere
   *  including the hero (which used to carry its own full-section veil). */
  scrimGradient: string;
};

const PRESETS: Record<LightingPreset, Lighting> = {
  /**
   * Brightest usable setting. Past roughly here the core clips to a flat white
   * disc, the rays lose their separation and the ribbon reads as a silhouette
   * rather than glass: brighter stops looking better. The scrims are pushed to
   * their strongest at the same time, so the ambient can run hot while body
   * copy keeps its contrast; they are local to the text, not the whole frame.
   */
  max: {
    burstGain: 1.35,
    core: [205, 1.95],
    // Rays reach far but not edge-to-edge: past this they flood the frame and
    // the ribbon flattens into a silhouette against its own light source.
    rays: [5.4, 0.92],
    halo: [24, 0.34],
    bloom: [44, 0.32],
    // Pushed hard so the glass stays brighter than the burst behind it: the
    // ribbon has to out-shine its backlight or it reads as a cut-out.
    envMapIntensity: 4.6,
    backsideEnvMapIntensity: 3.2,
    scrimGradient:
      "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.88) 58%, rgba(0,0,0,0) 100%)",
  },
  draft: {
    burstGain: 1.17,
    core: [220, 1.7],
    rays: [5.5, 0.85],
    halo: [26, 0.3],
    bloom: [46, 0.28],
    envMapIntensity: 3.5,
    backsideEnvMapIntensity: 2.5,
    scrimGradient:
      "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.76) 58%, rgba(0,0,0,0) 100%)",
  },
  mid: {
    burstGain: 1,
    core: [250, 1.45],
    rays: [6.2, 0.72],
    halo: [28, 0.24],
    bloom: [50, 0.22],
    envMapIntensity: 3.4,
    backsideEnvMapIntensity: 2.4,
    scrimGradient:
      "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.82) 58%, rgba(0,0,0,0) 100%)",
  },
  soft: {
    burstGain: 0.76,
    core: [260, 1.05],
    rays: [6.5, 0.5],
    halo: [30, 0.17],
    bloom: [52, 0.15],
    envMapIntensity: 3.2,
    backsideEnvMapIntensity: 2.2,
    scrimGradient:
      "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.86) 58%, rgba(0,0,0,0) 100%)",
  },
};

export const LIGHT: Lighting = PRESETS[LIGHTING];

/** GLSL needs a decimal point on every float literal. */
export const glsl = (n: number, places = 2) => n.toFixed(places);
