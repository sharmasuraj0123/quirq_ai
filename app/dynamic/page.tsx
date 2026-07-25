import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { STORY } from "./story";
import { StoryBeat } from "./beats";

export const metadata: Metadata = {
  title: "Dynamic main, static shell",
  description:
    "How the middle of a stage page swaps while everything around it stays static: composition, data-driven beats, deferred slots, and the contract the middle must honor.",
};

/**
 * The fifth stage page, and the first whose middle is pure data: STORY is an
 * array, StoryBeat is the only component, and the shell neither knows nor
 * cares.
 */
export default function Page() {
  return (
    <StagePage>
      {STORY.map((beat) => (
        <StoryBeat key={beat.id} data={beat} />
      ))}

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
