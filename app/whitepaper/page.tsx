import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { WHITEPAPER } from "@/lib/whitepaper";
import {
  PaperHero,
  PaperProblem,
  PaperMint,
  PaperLedger,
  PaperClose,
} from "./beats";

export const metadata: Metadata = {
  title: "Whitepaper",
  description: WHITEPAPER.dek,
};

/**
 * The whitepaper on the stage: the same shell and keyframe track as the home
 * page, with the paper's argument as its five beats. The typeset PDF at
 * /whitepaper/pdf stays the version of record, and both the first beat and
 * the last one send the reader there.
 */
export default function Page() {
  return (
    <StagePage>
      <PaperHero />
      <PaperProblem />
      <PaperMint />
      <PaperLedger />
      <PaperClose />

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
