import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResearchIndexView } from "@/components/research/index-view";
import { PAGE_SIZE, POSTS, resolveIndex } from "@/lib/research";

/**
 * Numbered pages of the whole stream, from two upward. Page one is /research
 * itself and is deliberately not generated here, so one listing never has two
 * URLs.
 *
 * The literal `page` segment wins over the sibling [slug] route, which is why
 * `page` is a reserved slug in lib/research.ts.
 */
export function generateStaticParams() {
  const pageCount = Math.max(1, Math.ceil(POSTS.length / PAGE_SIZE));
  return Array.from({ length: pageCount - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

const readPage = (raw: string) => (/^\d+$/.test(raw) ? Number(raw) : NaN);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const page = readPage((await params).page);
  if (!resolveIndex({ page })) return {};

  return {
    title: `Research, page ${page}`,
    description: `Page ${page} of the research program behind quirq: experiments, frameworks, and field notes, each with its falsifier.`,
  };
}

export default async function ResearchIndexPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const page = readPage((await params).page);
  // Page one, a non-number, and anything past the end all fail closed here.
  const view = page === 1 ? null : resolveIndex({ page });
  if (!view) notFound();

  return <ResearchIndexView view={view} />;
}
