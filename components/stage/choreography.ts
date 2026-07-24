/**
 * One keyframe per beat. The glass form is a single object that never unmounts —
 * it is transformed and re-tuned as the page scrolls, so the whole site reads as
 * one continuous shot rather than five separate scenes.
 *
 * The optical values carry the argument: colour is *value*. Beat 1 (the token
 * meter) drains the glass to near-monochrome and roughens it; beat 2 (the quirq)
 * opens chromatic aberration wide and the spectrum floods back in.
 */
export type Keyframe = {
  /** Position, world units. `x` is scaled by available width at runtime. */
  x: number;
  y: number;
  z: number;
  scale: number;
  /** Rotation *rate* about Y, radians/second. */
  spin: number;
  /** Absolute tilt targets. */
  tiltX: number;
  tiltZ: number;
  /** Optics — how far the refracted RGB channels separate. Colour = value. */
  chroma: number;
  /** Refraction depth. Thicker glass bends light further. */
  thickness: number;
  distortion: number;
  aniso: number;
  rough: number;
  ior: number;
  /**
   * Brightness of the light source upstage — what the glass has to refract.
   * These are the base levels; `LIGHT.burstGain` in lib/lighting.ts scales all
   * of them together, so change the preset there to re-light the page rather
   * than editing these one by one.
   */
  burst: number;
};

export const KEYFRAMES: Keyframe[] = [
  // 0 · hero — centred behind the wordmark, breathing slowly.
  {
    x: 0,
    y: -0.32,
    z: -2.6,
    scale: 1.34,
    spin: 0.075,
    tiltX: 0.42,
    tiltZ: -0.12,
    chroma: 0.5,
    thickness: 1.5,
    distortion: 0.15,
    aniso: 0.22,
    rough: 0.05,
    ior: 1.62,
    burst: 0.56,
  },
  // 1 · the meter you already have — colour drained out, glass gone murky.
  {
    x: 2.5,
    y: -0.15,
    z: -0.7,
    scale: 1.0,
    spin: 0.045,
    tiltX: 0.86,
    tiltZ: 0.3,
    chroma: 0.015,
    thickness: 0.5,
    distortion: 0.7,
    aniso: 0.6,
    rough: 0.26,
    ior: 1.32,
    burst: 0.19,
  },
  // 2 · the meter that was missing — full spectrum floods back.
  {
    x: -2.35,
    y: 0.15,
    z: 0.5,
    scale: 1.12,
    spin: 0.16,
    tiltX: 0.2,
    tiltZ: -0.42,
    chroma: 0.95,
    thickness: 2.3,
    distortion: 0.1,
    aniso: 0.14,
    rough: 0.02,
    ior: 1.72,
    burst: 0.66,
  },
  // 3 · the ledger — recedes upstage so the numbers own the frame.
  {
    x: 3.05,
    y: 1.5,
    z: -3.2,
    scale: 0.8,
    spin: 0.1,
    tiltX: 1.15,
    tiltZ: 0.2,
    chroma: 0.6,
    thickness: 1.6,
    distortion: 0.2,
    aniso: 0.2,
    rough: 0.06,
    ior: 1.6,
    burst: 0.42,
  },
  // 4 · the invitation — returns centre, biggest, fully lit.
  {
    x: 0,
    y: 0,
    z: 1.2,
    scale: 1.42,
    spin: 0.2,
    tiltX: 0.55,
    tiltZ: 0.5,
    chroma: 1.15,
    thickness: 2.6,
    distortion: 0.12,
    aniso: 0.1,
    rough: 0.02,
    ior: 1.78,
    burst: 0.9,
  },
];

const KEYS = Object.keys(KEYFRAMES[0]) as Array<keyof Keyframe>;

/** Ease the crossfade so beats settle instead of arriving linearly. */
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Sample the keyframe track at a fractional beat index, writing into `out` to
 * avoid allocating a new object on every frame.
 */
export function sampleKeyframes(beat: number, out: Keyframe): Keyframe {
  const last = KEYFRAMES.length - 1;
  const clamped = Math.min(Math.max(beat, 0), last);
  const i = Math.min(Math.floor(clamped), last - 1);
  const t = smooth(clamped - i);
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  for (const key of KEYS) out[key] = a[key] + (b[key] - a[key]) * t;
  return out;
}

/** Frame-rate independent exponential approach. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
