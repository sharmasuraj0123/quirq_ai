import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { StoryBeat } from "@/components/story/story-beat";
import { STORY } from "./story";

export const metadata: Metadata = {
  title: "Scenes",
  description:
    "How to customize and create scenes: the four parts of the shot, the fourteen knobs you may turn, why the camera never moves, and the pose presets to compose from.",
};

/** The scene-customization guide, staged by the scene it customizes. */
export default function Page() {
  return (
    <StagePage>
      {STORY.map((beat) => (
        <StoryBeat key={beat.id} data={beat} />
      ))}

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
