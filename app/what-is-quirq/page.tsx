import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { WhatHero, WhatProblem, WhatUnit, WhatNumbers, WhatRun } from "./beats";

export const metadata: Metadata = {
  title: "What is quirq",
  description:
    "The unit of verified work: a human budgets an outcome, the workspace verifies it against captured state, and V x B quirqs are minted. Same stage, the explainer cut.",
};

/**
 * The first proof that the stage and its content are separable: this page
 * mounts the exact same shell and keyframe track as the home page, with a
 * different set of five beats in front of the glass.
 */
export default function Page() {
  return (
    <StagePage>
      <WhatHero />
      <WhatProblem />
      <WhatUnit />
      <WhatNumbers />
      <WhatRun />

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
