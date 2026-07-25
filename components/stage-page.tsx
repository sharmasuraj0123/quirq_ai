import type { ReactNode } from "react";
import Stage from "@/components/stage/stage";
import ScrollRuntime from "@/components/scroll-runtime";
import { Nav } from "@/components/ui/nav";

/**
 * The shared shell for any page that runs the 3D shot: the scroll runtime,
 * the persistent stage, the film overlays, and the nav. Pages differ only in
 * the beats they pass as children.
 *
 * The contract with the choreography is unchanged from the single-page days:
 * children carry `data-beat={0..4}` sections (via the Beat primitive), the
 * runtime measures their centres, and the same KEYFRAMES track drives the
 * glass. A page may use fewer beats (the track simply stops earlier); using
 * more than the track has would flatten past the last keyframe, so don't.
 */
export function StagePage({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollRuntime />

      {/* One continuous shot: the glass form lives behind every beat and is
          re-staged by scroll rather than swapped out between sections. */}
      <Stage />
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />

      <Nav />

      <main className="relative z-10">{children}</main>
    </>
  );
}
