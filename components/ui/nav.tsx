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
  const onPaper = pathname.startsWith("/whitepaper");
  const onDemo = pathname.startsWith("/demo");
  const onDashboard = pathname.startsWith("/dashboard");
  const onJourney = pathname.startsWith("/journey");
  // Every page runs the 3D shot now, so the glass bar is the exception rather
  // than the rule. /demo and /dashboard joined once the scroll runtime started
  // observing section heights: an interactive surface that grows after mount
  // no longer desyncs the choreography from the copy. /research keeps the bar
  // because it is long-form text and mounts no stage.
  const onStage =
    home ||
    onWhat ||
    onHow ||
    onBeats ||
    onPaper ||
    onDemo ||
    onDashboard ||
    onJourney;

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
          {/* The bar's breakpoint budget is fully spent, so a new route means
              re-ranking rather than appending, and eight links do not fit at
              1280. The three surfaces where the product is actually doing
              something rank first: Demo survives to phone widths, Dashboard
              and Journey join at sm. The pages that only describe it follow.
              Beats moved to the footer: it is a dev deep-dive and it was the
              cheapest seat to give up. */}
          <Link
            href="/demo"
            aria-current={onDemo ? "page" : undefined}
            className={cn(
              "label inline-flex items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink",
              onDemo && "text-ink",
            )}
          >
            {onDemo && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
            )}
            Demo
          </Link>

          <Link
            href="/dashboard"
            aria-current={onDashboard ? "page" : undefined}
            className={cn(
              "label hidden items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink sm:inline-flex",
              onDashboard && "text-ink",
            )}
          >
            {onDashboard && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
            )}
            Dashboard
          </Link>

          <Link
            href="/journey"
            aria-current={onJourney ? "page" : undefined}
            className={cn(
              "label hidden items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink sm:inline-flex",
              onJourney && "text-ink",
            )}
          >
            {onJourney && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
            )}
            Journey
          </Link>

          <Link
            href="/what-is-quirq"
            aria-current={onWhat ? "page" : undefined}
            className={cn(
              "label hidden items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink lg:inline-flex",
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
              "label hidden items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink lg:inline-flex",
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

          <Link
            href="/research"
            aria-current={onResearch ? "page" : undefined}
            // Invisible padding: the 10px label alone is far under a usable
            // touch target, and the transparent bleed moves no geometry.
            className={cn(
              "label hidden items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink xl:inline-flex",
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
              the whitepaper is still linked from the ledger note and footer.
              Points at the readable page, not the PDF: the PDF is one click
              further in, from that page's own calls to action. */}
          <Link
            href="/whitepaper"
            aria-current={onPaper ? "page" : undefined}
            className={cn(
              "label hidden items-center gap-2 px-2 py-3 -mx-2 -my-3 transition-colors hover:text-ink sm:inline-flex",
              onPaper && "text-ink",
            )}
          >
            {onPaper && (
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-[2px]"
                style={{ background: "var(--spectrum)" }}
              />
            )}
            Whitepaper
          </Link>

          <OpenIn variant="nav" />
        </div>
      </motion.nav>
    </>
  );
}
