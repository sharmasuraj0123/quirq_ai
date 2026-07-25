"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { createRibbonGeometry } from "./ribbon-geometry";
import { KEYFRAMES, damp, sampleKeyframes, type Keyframe } from "./choreography";
import { LIGHT } from "@/lib/lighting";
import { stage } from "@/lib/stage-store";

/** drei's transmission material exposes its uniforms as plain properties. */
type TransmissionMaterial = THREE.MeshPhysicalMaterial & {
  chromaticAberration: number;
  anisotropicBlur: number;
  distortion: number;
  distortionScale: number;
  temporalDistortion: number;
};

export type StageQuality = {
  samples: number;
  resolution: number;
  backside: boolean;
};

export function GlassForm({ quality }: { quality: StageQuality }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => createRibbonGeometry(), []);

  // Two copies of the keyframe shape: where we're headed, and where we are.
  // Damping between them is what stops scroll input feeling mechanical.
  const target = useRef<Keyframe>({ ...KEYFRAMES[0] });
  const live = useRef<Keyframe>({ ...KEYFRAMES[0] });
  const spin = useRef(0);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    // A backgrounded tab hands back one enormous delta; clamp or the form lurches.
    const dt = Math.min(delta, 0.05);
    const k = sampleKeyframes(stage.beat, target.current);
    const l = live.current;

    // Narrow viewports collapse the horizontal choreography toward centre,
    // otherwise the form parks itself off-screen on a phone.
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const spread = THREE.MathUtils.clamp((aspect - 0.72) / 0.78, 0, 1);
    const fit = 0.66 + 0.34 * spread;

    const reduced = stage.reduced;
    // Reduced motion: snap rather than glide, and drop the parallax entirely.
    const lambda = reduced ? 400 : 3.2;
    const px = reduced ? 0 : stage.pointerX;
    const py = reduced ? 0 : stage.pointerY;

    l.x = damp(l.x, k.x * spread + px * 0.3, lambda, dt);
    l.y = damp(l.y, k.y + py * 0.2, lambda, dt);
    l.z = damp(l.z, k.z, lambda, dt);
    l.scale = damp(l.scale, k.scale * fit, lambda, dt);
    l.tiltX = damp(l.tiltX, k.tiltX + py * 0.12, lambda, dt);
    l.tiltZ = damp(l.tiltZ, k.tiltZ, lambda, dt);

    if (!reduced) spin.current += k.spin * dt;

    const t = state.clock.elapsedTime;
    const breathe = reduced ? 1 : 1 + Math.sin(t * 0.42) * 0.022;
    const sway = reduced ? 0 : Math.sin(t * 0.31) * 0.05;

    g.position.set(l.x, l.y, l.z);
    g.rotation.set(l.tiltX, spin.current, l.tiltZ + sway);
    g.scale.setScalar(l.scale * breathe);

    // The optics carry the story, so they are animated exactly like transforms.
    const m = mesh.current?.material as TransmissionMaterial | undefined;
    if (!m) return;
    l.chroma = damp(l.chroma, k.chroma, lambda, dt);
    l.thickness = damp(l.thickness, k.thickness, lambda, dt);
    l.distortion = damp(l.distortion, k.distortion, lambda, dt);
    l.aniso = damp(l.aniso, k.aniso, lambda, dt);
    l.rough = damp(l.rough, k.rough, lambda, dt);
    l.ior = damp(l.ior, k.ior, lambda, dt);

    m.chromaticAberration = l.chroma;
    m.thickness = l.thickness;
    m.distortion = l.distortion;
    m.anisotropicBlur = l.aniso;
    m.roughness = l.rough;
    m.ior = l.ior;
  });

  return (
    <group ref={group}>
      <mesh ref={mesh} geometry={geometry}>
        <MeshTransmissionMaterial
          samples={quality.samples}
          resolution={quality.resolution}
          backside={quality.backside}
          backsideThickness={0.4}
          transmission={1}
          thickness={KEYFRAMES[0].thickness}
          roughness={KEYFRAMES[0].rough}
          ior={KEYFRAMES[0].ior}
          chromaticAberration={KEYFRAMES[0].chroma}
          anisotropicBlur={KEYFRAMES[0].aniso}
          distortion={KEYFRAMES[0].distortion}
          distortionScale={0.4}
          temporalDistortion={0.06}
          attenuationDistance={4}
          attenuationColor="#ffffff"
          color="#ffffff"
          // No `background` override: the transmission sampler renders the real
          // scene, which is the light burst upstage. That is what the glass bends.
          envMapIntensity={LIGHT.envMapIntensity}
          backsideEnvMapIntensity={LIGHT.backsideEnvMapIntensity}
        />
      </mesh>
    </group>
  );
}
