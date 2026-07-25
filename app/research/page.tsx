import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchIndexView } from "@/components/research/index-view";
import { resolveIndex } from "@/lib/research";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Experiments, frameworks, and field notes from the research program behind quirq. Every claim ships with its falsifier.",
};

/**
 * Page one of the whole stream. Later pages live at /research/page/<n> and
 * topic archives at /research/topic/<topic>; all three render the same
 * resolved view.
 */
export default function ResearchIndex() {
  const view = resolveIndex({});
  // Only reachable if PAGE_SIZE or POSTS were changed into something
  // incoherent; the resolver fails closed rather than rendering an empty list.
  if (!view) notFound();

  return <ResearchIndexView view={view} />;
}
