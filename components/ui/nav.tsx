"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn, Mark } from "./primitives";
import { OpenIn } from "./open-in";

export function Nav() {
  const pathname = usePathname();
  const home = pathname === "/";
  const onWhat = pathname.startsWith("/what-is-quirq");
  const onHow = pathname.startsWith("/how-it-works");
  const onBeats = pathname.startsWith("/beats");
  const onResearch = pathname.startsWith("/research");
  // Pages that run the 3D shot supply their own darkness and a live
  // scroll-progress value; text pages get the glass bar instead.
  const onStage = home || onWhat || onHow || onBeats;

  return (
    <>
      {/* Scroll progress. Driven by the --scroll custom property the scroll
          runtime writes each frame, so it costs no React renders. Pages
          without the runtime leave it at 0, so the rule simply never shows. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px">
        <div
          className="spectrum-rule h-full origin-left"
          style={{ transform: "scaleX(var(--scroll))" }}
        />
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        // The long delay belongs to the stage entrance choreography; text
        // pages shouldn't wait for an entrance that isn't happening.
        transition={{
          duration: 0.9,
          delay: onStage ? 0.8 : 0.1,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-5 sm:px-8 lg:px-11",
          !onStage && "border-b border-hair-soft bg-black/60 backdrop-blur-xl",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 text-ink"
          aria-label={home ? "quirq, back to top" : "quirq, home"}
        >
          <Mark className="h-[19px] w-auto" />
          <span className="font-mark text-[19px] font-semibold tracking-tight">
            quirq
          </span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          {/* Hidden on phones like the whitepaper link: the mark, Research
              and the CTA are the load-bearing trio at small widths. */}
          <Link
            href="/what-is-quirq"
            aria-current={onWhat ? "page" : undefined}
            className={cn(
              "label hidden items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink sm:inline-flex",
              onWhat && "text-ink",
            )}
          >
            {onWhat && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
            )}
            What is quirq
          </Link>

          <Link
            href="/how-it-works"
            aria-current={onHow ? "page" : undefined}
            className={cn(
              "label hidden items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink sm:inline-flex",
              onHow && "text-ink",
            )}
          >
            {onHow && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
            )}
            How it works
          </Link>

          {/* Deepest of the dev pages; earns its slot only where the bar has
              room to spare. */}
          <Link
            href="/beats"
            aria-current={onBeats ? "page" : undefined}
            className={cn(
              "label hidden items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink lg:inline-flex",
              onBeats && "text-ink",
            )}
          >
            {onBeats && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
            )}
            Beats
          </Link>

          <Link
            href="/research"
            aria-current={onResearch ? "page" : undefined}
            // Invisible padding: the 10px label alone is far under a usable
            // touch target, and the transparent bleed moves no geometry.
            className={cn(
              "label inline-flex items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink",
              onResearch && "text-ink",
            )}
          >
            {/* The active page gets the spectrum tick; hover only gets ink. */}
            {onResearch && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
            )}
            Research
          </Link>

          {/* Drops out on phones so the CTA never gets pushed off the edge;
              the whitepaper is still linked from the ledger note and footer. */}
          {/* Opens in its own tab: it's a PDF, and losing the page you were
              reading to a document viewer is a bad trade. */}
          <a
            href="/quirq-whitepaper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="label hidden items-center gap-1.5 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink sm:inline-flex"
          >
            Whitepaper
            <svg
              width="9"
              height="9"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
              className="translate-y-px opacity-70"
            >
              <path
                d="M4.5 1.5H10.5V7.5M10.5 1.5L5.5 6.5M8.5 8.5V10.5H1.5V3.5H3.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sr-only">(opens in a new tab)</span>
          </a>

          <OpenIn variant="nav" />
        </div>
      </motion.nav>
    </>
  );
}
