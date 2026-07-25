import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { HowHero, HowPipeline, HowMath, HowPlan, HowTree } from "./beats";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The scroll stage, documented by itself: how sections drive the glass, the three functions behind the shot, and the phased plan for turning the flat beat track into a tree.",
};

/**
 * The third stage page, and the most self-referential: the system described
 * in these beats is the one rendering them.
 */
export default function Page() {
  return (
    <StagePage>
      <HowHero />
      <HowPipeline />
      <HowMath />
      <HowPlan />
      <HowTree />

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
