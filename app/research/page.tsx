import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/lib/research";
import { Reveal, Rise } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Experiments, frameworks, and field notes from the research program behind quirq. Every claim ships with its falsifier.",
};

export default function ResearchIndex() {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pt-36 sm:px-8 sm:pt-40 lg:px-11">
      <header className="max-w-3xl">
        <Rise className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-[3px]"
            style={{ background: "var(--spectrum)" }}
          />
          <span className="label">Research · XO Labs</span>
          <span className="spectrum-rule h-px w-12 opacity-70" />
        </Rise>

        <h1 className="display mt-7 max-w-[14ch]">
          <Reveal delay={0.05}>Every claim,</Reveal>
          <Reveal delay={0.13}>
            {/* Styling only: research pages carry no live stage behind the
                scrim, so there is no light to cut a hole for. */}
            <span className="glass-text">on the record.</span>
          </Reveal>
        </h1>

        <Rise delay={0.24}>
          <p className="lede mt-7 max-w-[46ch]">
            Experiments, frameworks, and field notes from the program behind
            quirq. Hypotheses ship with falsifiers; results land here as they
            land.
          </p>
        </Rise>
      </header>

      <div className="mt-16 border-t border-hair sm:mt-20">
        {POSTS.map((post, i) => (
          <Rise key={post.slug} delay={0.08 + i * 0.05}>
            <Link
              href={`/research/${post.slug}`}
              className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 border-b border-hair py-8 transition-colors hover:bg-white/[0.02] sm:grid-cols-[64px_1fr_auto] sm:gap-x-8 sm:py-9"
            >
              <span className="font-mono text-[11px] text-faint transition-colors group-hover:text-dim">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="min-w-0">
                <span className="block text-[clamp(20px,2.4vw,28px)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
                  {post.title}
                </span>
                <span className="mt-2.5 block max-w-[62ch] text-[14.5px] leading-[1.65] text-dim">
                  {post.dek}
                </span>
                <span className="mt-3.5 block font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
                  {[post.tag, post.date, `${post.readingMinutes} min`]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>

              <svg
                width="14"
                height="14"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                className="hidden self-center text-dim opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 sm:block"
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
        ))}
      </div>

      <Rise delay={0.2}>
        <p className="mt-10 font-mono text-[10.5px] leading-relaxed tracking-[0.08em] text-faint">
          Adapted from the XO research program ·{" "}
          <a
            href="https://docs.xo.builders/research"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-dim"
          >
            docs.xo.builders/research
          </a>
        </p>
      </Rise>
    </div>
  );
}
