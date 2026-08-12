import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { Editor } from "./editor";

export const metadata: Metadata = {
  title: "Page editor",
  description:
    "Compose story beats, drag the live glass's pose and optics, and copy the result out as data for a new page.",
  robots: { index: false },
};

/**
 * The page editor: the live stage with an inspector over it. The middle it
 * renders is the draft being edited; the editor pushes the draft's keyframes
 * into the live track via the choreography override.
 */
export default function Page() {
  return (
    <StagePage>
      <Editor />
      <div className="relative">
        <SiteFooter />
      </div>
    </StagePage>
  );
}
