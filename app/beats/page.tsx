import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { BeatsHero, BeatsMechanics, BeatsLive, BeatsLimits, BeatsDynamic } from "./beats";

export const metadata: Metadata = {
  title: "The beats array",
  description:
    "How the beats array is traversed as you scroll: fractional blending instead of steps, a live stage.beat readout, the honest limitations, and how the walk becomes dynamic.",
};

/**
 * The fourth stage page: the beats array explained in beats, with a live
 * meter on beat 2 showing the traversal happening.
 */
export default function Page() {
  return (
    <StagePage>
      <BeatsHero />
      <BeatsMechanics />
      <BeatsLive />
      <BeatsLimits />
      <BeatsDynamic />

      {/* The form is at its largest under the last beat, so the footer needs
          a base to sit on rather than floating over the glass. */}
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
