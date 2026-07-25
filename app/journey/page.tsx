import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { Journey } from "./journey";

export const metadata: Metadata = {
  title: "The journey",
  description:
    "A branching walk: the page's content is generated from your previous choices, the glass follows the path you take, and the trail rewinds to explore the other branches of the tree.",
};

/**
 * The first live branching walk: content generated from previous choices,
 * choreography following the chosen path. Phase 5's machinery, in use.
 */
export default function Page() {
  return (
    <StagePage>
      <Journey />

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
