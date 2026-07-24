"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { SPECTRUM } from "@/lib/spectrum";

/**
 * The lighting *is* the brand.
 *
 * Nothing here is a rainbow texture: one hot white core plus seven coloured
 * emitters ringed around the form, baked into an environment map. The spectrum
 * on screen is real dispersion — white light entering glass and leaving split.
 * Baked once (`frames={1}`) because the lights hold still and the form turns.
 */
export function SpectrumEnv({ resolution = 256 }: { resolution?: number }) {
  return (
    <Environment frames={1} resolution={resolution} background={false}>
      {/* The source. Small, fierce, just behind the form. */}
      <Lightformer
        form="circle"
        intensity={40}
        color="#ffffff"
        position={[0, 0.35, -7]}
        scale={2}
      />

      {/* Soft top and bottom fill so the ribbon's hard edges catch a rim. */}
      <Lightformer
        form="rect"
        intensity={0.6}
        color="#9a9ae0"
        position={[0, 7, -2]}
        scale={[16, 9, 1]}
      />
      <Lightformer
        form="rect"
        intensity={0.3}
        color="#ffffff"
        position={[0, -7, -2]}
        scale={[16, 9, 1]}
      />

      {/* The spectrum, fanned around the form. Circles stay correct whichever
          way the emitter ends up facing the target. */}
      {SPECTRUM.map((color, i) => {
        const angle = (i / SPECTRUM.length) * Math.PI * 2;
        return (
          <Lightformer
            key={color}
            form="circle"
            color={color}
            intensity={14}
            scale={3.4}
            position={[
              Math.cos(angle) * 7,
              Math.sin(angle) * 5,
              Math.sin(angle * 2) * 4.5 - 1,
            ]}
          />
        );
      })}
    </Environment>
  );
}
