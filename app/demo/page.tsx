import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { Mint, MintHero } from "./mint";

export const metadata: Metadata = {
  title: "Mint your first quirq",
  description:
    "Write a todo, say what would make it done, run it. The snapshot is taken when the worker reports done, and the meter decides what it was worth. Every number is computed in your browser.",
};

/**
 * The front door, on the same stage as everything else. A todo list that
 * happens to mint: the visitor writes what done means, and the arithmetic
 * that answers them is the same engine.mjs the CLI runs.
 *
 * Four beats, not five: the page is short and hands-on, and the track's fifth
 * keyframe simply never plays. MintHero is beat 0 and holds no state; Mint
 * renders beats 1 to 3 around the one piece of state they share.
 */
export default function Page() {
  return (
    <StagePage>
      <MintHero />
      <Mint />

      {/* The last beat leaves the form small and high, so the footer still
          needs a base rather than floating over the glass. */}
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
