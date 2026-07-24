"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GlassForm, type StageQuality } from "./glass-form";
import { LightBurst } from "./light-burst";
import { SpectrumEnv } from "./spectrum-env";

/**
 * Everything that pulls in three.js lives behind this module boundary so it can
 * be code-split. The hero's type and layout paint from the static HTML while
 * this chunk is still downloading; the stage then fades in over it.
 */
export default function Scene({
  quality,
  onReady,
}: {
  quality: StageQuality;
  onReady: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 9], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={onReady}
    >
      <Suspense fallback={null}>
        <SpectrumEnv resolution={quality.resolution} />
        <LightBurst />
        <GlassForm quality={quality} />
      </Suspense>
    </Canvas>
  );
}
