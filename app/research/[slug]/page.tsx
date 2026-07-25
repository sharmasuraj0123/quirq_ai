import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost, type Block } from "@/lib/research";
import { Rise } from "@/components/ui/primitives";

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
  return { title: post.title, description: post.dek };
}

/**
 * One block of long-form article body. Kinds map 1:1 to the shapes in lib/research.ts.
 */
function BodyBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case "h2":
      return (
        <h2 className="mt-14 text-[clamp(21px,2.4vw,28px)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-10 text-[17px] font-semibold tracking-[-0.01em] text-ink">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p className="mt-5 text-[15.5px] leading-[1.8] text-ink/70">
          {block.text}
        </p>
      );
    case "quote":
      return (
        <blockquote className="relative mt-7 pl-5 text-[16.5px] leading-[1.7] text-ink/90">
          <span
            aria-hidden
            className="absolute inset-y-1 left-0 w-px"
            style={{ background: "var(--spectrum)" }}
          />
          {block.text}
        </blockquote>
      );
    case "code":
      return (
        // Focusable because it scrolls: without tabIndex the clipped part is
        // unreachable by keyboard. The global :focus-visible ring styles it.
        <pre
          tabIndex={0}
          role="region"
          aria-label="Code"
          className="mt-6 overflow-x-auto rounded-xl border border-hair-soft bg-white/[0.04] p-4 font-mono text-[12.5px] leading-[1.7] text-ink/80"
        >
          {block.text}
        </pre>
      );
    case "table":
      return (
        <div
          tabIndex={0}
          role="region"
          aria-label="Table"
          className="mt-6 overflow-x-auto rounded-xl border border-hair-soft"
        >
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-hair-soft bg-white/[0.03]">
                {block.header.map((cell, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-2.5 font-mono text-[9.5px] font-medium tracking-[0.14em] text-faint uppercase"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr
                  key={r}
                  className="border-b border-hair-soft last:border-b-0"
                >
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={
                        c === 0
                          ? "px-4 py-2.5 text-[13px] text-ink/85"
                          : "numeric px-4 py-2.5 font-mono text-[12.5px] text-ink/70 tabular-nums"
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "list":
      return (
        <ul className="mt-5 space-y-2.5">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-[15.5px] leading-[1.7] text-ink/70"
            >
              <span
                aria-hidden
                className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
  }
}

export default async function ResearchPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const index = POSTS.indexOf(post);
  const next = POSTS[(index + 1) % POSTS.length];

  return (
    <article className="mx-auto w-full max-w-[760px] px-5 pt-32 sm:px-8 sm:pt-36">
      <Rise>
        <Link
          href="/research"
          className="label inline-flex items-center gap-2 transition-colors hover:text-ink"
        >
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

      <header className="mt-9">
        <Rise delay={0.05}>
          <p className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
            {[post.tag, post.date, `${post.readingMinutes} min read`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </Rise>
        <Rise delay={0.1}>
          <h1 className="mt-5 text-[clamp(30px,4.4vw,50px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            {post.title}
          </h1>
        </Rise>
        <Rise delay={0.16}>
          <p className="mt-6 text-[17px] leading-[1.65] text-dim">{post.dek}</p>
        </Rise>
        <Rise delay={0.2}>
          <div className="spectrum-rule mt-9 h-px w-14" />
        </Rise>
      </header>

      {/* Not a Rise: whileInView needs a quarter of the element on screen at
          once, which a long article body can never satisfy, so a wrapped body
          would simply stay invisible. Long-form text needs no entrance. */}
      <div>
        {post.body.map((block, i) => (
          <BodyBlock key={i} block={block} />
        ))}

        <p className="mt-14 border-t border-hair-soft pt-6 font-mono text-[10.5px] leading-relaxed tracking-[0.08em] text-faint">
          Adapted from the XO research program · canonical version at{" "}
          <a
            href={post.source}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-dim"
          >
            docs.xo.builders
          </a>
        </p>
      </div>

      {next && next !== post && (
        <Rise delay={0.05}>
          <Link
            href={`/research/${next.slug}`}
            className="group mt-12 flex items-center justify-between gap-6 rounded-2xl border border-hair bg-black/40 px-6 py-6 transition-colors hover:border-ink/25 sm:px-7"
          >
            <span className="min-w-0">
              <span className="label block">Next</span>
              <span className="mt-2 block truncate text-[16.5px] font-semibold text-ink">
                {next.title}
              </span>
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className="shrink-0 text-dim transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M2 10L10 2M10 2H4M10 2V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </Rise>
      )}
    </article>
  );
}
