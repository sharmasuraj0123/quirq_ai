import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchIndexView } from "@/components/research/index-view";
import { TOPICS, getTopic, resolveIndex } from "@/lib/research";

/**
 * One archive per topic. Every topic is smaller than a page, so an archive is
 * one page by construction; see resolveIndex for what to add if that changes.
 *
 * The literal `topic` segment wins over the sibling [slug] route, which is why
 * `topic` is a reserved slug in lib/research.ts.
 */
export function generateStaticParams() {
  return TOPICS.map((topic) => ({ topic: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const topic = getTopic((await params).topic);
  if (!topic) return {};

  return {
    title: `Research: ${topic.label}`,
    description: topic.blurb,
  };
}

export default async function ResearchTopic({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const view = resolveIndex({ topic: (await params).topic });
  if (!view) notFound();

  return <ResearchIndexView view={view} />;
}
