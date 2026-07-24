"use client";

import { motion } from "motion/react";
import { Mark } from "./primitives";

export function Nav() {
  return (
    <>
      {/* Scroll progress. Driven by the --scroll custom property the scroll
          runtime writes each frame, so it costs no React renders. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px">
        <div
          className="spectrum-rule h-full origin-left"
          style={{ transform: "scaleX(var(--scroll))" }}
        />
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-5 sm:px-8 lg:px-11"
      >
        <a
          href="#hero"
          className="flex items-center gap-2.5 text-ink"
          aria-label="quirq, back to top"
        >
          <Mark className="h-[19px] w-auto" />
          <span className="font-mark text-[19px] font-semibold tracking-tight">
            quirq
          </span>
        </a>

        <div className="flex items-center gap-5 sm:gap-7">
          {/* Drops out on phones so the CTA never gets pushed off the edge —
              the whitepaper is still linked from the ledger note and footer. */}
          {/* Opens in its own tab: it's a PDF, and losing the page you were
              reading to a document viewer is a bad trade. */}
          <a
            href="/quirq-whitepaper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="label hidden items-center gap-1.5 transition-colors hover:text-ink sm:inline-flex"
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
          <a
            href="mailto:suraj@xo.builders?subject=quirq%20early%20access"
            className="rounded-full bg-ink px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-void transition-transform duration-300 hover:-translate-y-0.5"
          >
            Early access
          </a>
        </div>
      </motion.nav>
    </>
  );
}
