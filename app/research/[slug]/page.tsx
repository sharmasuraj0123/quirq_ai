import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  POSTS,
  getPost,
  getTopic,
  neighbours,
  noteNumber,
  relatedPosts,
  type Post,
} from "@/lib/research";
import { PostBanner } from "@/components/research/banner";
import { PostCard } from "@/components/research/card";
import { BodyBlock } from "@/components/prose/body";
import { Rise } from "@/components/ui/primitives";
import { ArticleToc } from "@/components/research/toc";
import { headingId } from "@/lib/prose";
import { Source_Serif_4 } from "next/font/google";

/* The reading face: a calm transitional serif for titles and body, set
   against the site's Inter for headings, labels and figures. */
const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};

  // The banner doubles as the share card: one image per note, so a shared
  // link is recognisably that note rather than the site's generic card.
  const image = {
    url: post.banner.src,
    width: post.banner.width,
    height: post.banner.height,
    alt: post.banner.alt,
  };

  return {
    title: post.title,
    description: post.dek,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.dek,
      url: `/research/${post.slug}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.dek,
      images: [post.banner.src],
    },
  };
}

/** One neighbour in the program: the note before or after this one. */
function NeighbourLink({
  post,
  direction,
}: {
  post: Post;
  direction: "previous" | "next";
}) {
  const back = direction === "previous";

  return (
    <Link
      href={`/research/${post.slug}`}
      rel={back ? "prev" : "next"}
      className={`group flex items-center gap-4 rounded-2xl border border-hair px-5 py-5 transition-colors hover:border-ink/25 ${
        back ? "" : "flex-row-reverse text-right"
      }`}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
        className={`shrink-0 text-dim transition-transform duration-300 ${
          back
            ? "group-hover:-translate-x-1"
            : "rotate-180 group-hover:translate-x-1"
        }`}
      >
        <path
          d="M7.5 2L3.5 6L7.5 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="min-w-0">
        <span className="label block">{back ? "Previous" : "Next"}</span>
        <span className="mt-2 block truncate text-[16px] font-semibold text-ink">
          {post.title}
        </span>
      </span>
    </Link>
  );
}

export default async function ResearchPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const topic = getTopic(post.topic);
  const { previous, next } = neighbours(post);
  const related = relatedPosts(post, 2, [previous, next]);

  // The side contents list: the note's own h2s, anchored by the same
  // headingId the body renderer stamps on each heading.
  const toc = post.body.flatMap((block) =>
    block.kind === "h2"
      ? [{ id: headingId(block.text), text: block.text }]
      : [],
  );

  return (
    // The paper surface: a light reading page laid over the site's void, so a
    // long note reads like a printed article rather than copy on a stage.
    <div className={`paper ${serif.variable}`}>
      <article className="paper-article">
        <header className="paper-head">
          <Rise>
            <Link href="/research" className="paper-back">
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M7.5 2L3.5 6L7.5 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Research
            </Link>
          </Rise>

          <Rise delay={0.04}>
            <p className="paper-eyebrow">
              {topic && (
                /* The one cross-link out of an article into its shelf. */
                <Link href={`/research/topic/${topic.slug}`}>
                  {topic.label}
                </Link>
              )}
              {topic && post.tag && <span aria-hidden> · </span>}
              {post.tag && <span>{post.tag}</span>}
            </p>
          </Rise>
          <Rise delay={0.08}>
            <h1 className="paper-title">{post.title}</h1>
          </Rise>
          <Rise delay={0.12}>
            <p className="paper-dek">{post.dek}</p>
          </Rise>

          <Rise delay={0.16}>
            <div className="paper-meta">
              <span className="numeric">
                Note {String(noteNumber(post)).padStart(2, "0")}
              </span>
              {post.date && <span>{post.date}</span>}
              <span>{post.readingMinutes} min read</span>
              {/* The other way to read it: a page that mounts the 3D shot. */}
              <Link
                href={`/journey/read/${post.slug}`}
                className="paper-meta-link"
              >
                Read it interactively
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </Rise>
        </header>

        {/* The banner is the note's plate: wider than the text column. */}
        <Rise delay={0.2} className="paper-hero">
          <PostBanner
            banner={post.banner}
            priority
            sizes="(min-width: 1180px) 1080px, 94vw"
            className="aspect-[2.4/1] w-full"
          />
        </Rise>

        <div className="paper-grid">
          {toc.length > 2 && (
            <aside className="paper-aside">
              <ArticleToc items={toc} />
            </aside>
          )}

          {/* Not a Rise: whileInView needs a quarter of the element on screen at
          once, which a long article body can never satisfy, so a wrapped body
          would simply stay invisible. Long-form text needs no entrance. */}
          <div className="paper-body">
            {post.body.map((block, i) => (
              <BodyBlock key={i} block={block} />
            ))}

            {post.source && (
              <p className="paper-source">
                Adapted from the XO research program · canonical version at{" "}
                <a href={post.source} target="_blank" rel="noopener noreferrer">
                  docs.xo.builders
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="paper-foot">
          {(previous || next) && (
            <Rise delay={0.05}>
              <nav
                aria-label="Notes either side of this one"
                className="mt-12 grid gap-4 sm:grid-cols-2"
              >
                {previous && (
                  <NeighbourLink post={previous} direction="previous" />
                )}
                {/* Column two even when there is no previous note, so `next`
                always sits on the side its arrow points to. */}
                {next && (
                  <div className="sm:col-start-2">
                    <NeighbourLink post={next} direction="next" />
                  </div>
                )}
              </nav>
            </Rise>
          )}

          {related.length > 0 && (
            <section className="mt-16 border-t border-hair pt-12">
              <Rise>
                {/* Not "more in <topic>": the list falls back to the wider
                program once a topic runs out, so a topic heading would lie. */}
                <h2 className="label">Keep reading</h2>
              </Rise>
              <div className="mt-8 grid gap-x-7 gap-y-12 sm:grid-cols-2">
                {related.map((it, i) => (
                  <Rise key={it.slug} delay={0.06 + i * 0.06}>
                    <PostCard post={it} />
                  </Rise>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
