"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ActionLink, Beat, cn } from "@/components/ui/primitives";
import { GlassHole, GlassPool, GlassText } from "@/components/ui/glass";
import { OpenIn } from "@/components/ui/open-in";

const LETTERS = ["q", "u", "i", "r", "q"];
const EASE = [0.22, 1, 0.36, 1] as const;

/** The whole install. One line, and it is the same line on every machine. */
const INSTALL = "curl -fsSL quirq.ai/install | sh";

function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL);
    } catch {
      // Denied, or no clipboard at all outside a secure context. The command
      // is selectable text either way, so there is nothing to fall back to.
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2.5 rounded-full border border-hair bg-black/40 py-1.5 pr-1.5 pl-4 backdrop-blur-md sm:gap-3 sm:py-2 sm:pr-2 sm:pl-5">
        {/* The prompt is scenery, not part of what you paste. */}
        <span
          aria-hidden
          className="font-mono text-[11px] text-faint select-none"
        >
          $
        </span>
        <code className="font-mono text-[10.5px] whitespace-nowrap text-ink/90 sm:text-[13px]">
          {INSTALL}
        </code>
        {/* Fixed width: a button that resized on click would shift the command
            out from under the pointer at the exact moment it was clicked. */}
        <button
          type="button"
          onClick={copy}
          aria-label="Copy the install command"
          className={cn(
            "w-[70px] shrink-0 rounded-full border border-hair-soft bg-white/5 py-2 font-mono text-[9.5px] tracking-[0.14em] uppercase transition-colors duration-300 hover:border-ink/30 sm:w-[86px] sm:text-[10.5px]",
            copied ? "text-spec-green" : "text-dim hover:text-ink",
          )}
        >
          {copied ? "Copied" : "Copy"}
        </button>
        {/* Always mounted so the announcement is a content change in a live
            region rather than a region arriving with content already in it. */}
        <span aria-live="polite" className="sr-only">
          {copied ? "Install command copied to clipboard" : ""}
        </span>
      </div>

      <p className="label mt-3 text-[9.5px]">
        Runs anywhere · macOS, Linux, your cloud
      </p>
    </div>
  );
}

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <Beat index={0} id="hero">
      <div className="over-stage relative flex flex-col items-center text-center">
        {/* The eclipse: the text block occludes the burst's core while the
            rays fan out past its edge. The pool cuts real holes in it for the
            i's aperture and the "light speed" glyphs, so the raw light stands
            behind them. */}
        <GlassPool>
          <motion.p
            className="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 1 }}
          >
            One command · agentic environment
          </motion.p>

          <h1 className="mt-6 flex flex-col items-center">
            <span className="sr-only">quirq: work at light speed.</span>

            {/* The wordmark resolves out of the light rather than sliding in:
                each letter arrives from blur, like the beam coming into focus. */}
            <span
              aria-hidden
              className="flex font-mark text-[clamp(72px,15.5vw,204px)] leading-[0.86] font-semibold tracking-[-0.03em]"
            >
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  // initial/animate must be identical on server and client:
                  // useReducedMotion() is null during SSR, so branching them
                  // bakes full-motion inline styles into HTML that a
                  // reduced-motion client would never clear. Only the
                  // transition (never serialized) may branch.
                  initial={{ opacity: 0, y: "30%", filter: "blur(20px)" }}
                  animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { delay: 0.2 + i * 0.075, duration: 1.25, ease: EASE }
                  }
                >
                  {letter === "i" ? (
                    /* The i's dot is an aperture: the glyph's own tittle is
                       clipped away and a fully transparent hole takes its
                       place. Offsets calibrated against rasterized Poppins
                       600 ink: the tittle is a 0.165em circle whose centre
                       sits 0.07em below this box's top (baseline at 0.779em,
                       dot ink 0.79 to 0.625em above it), and the stem starts
                       at 0.219em; the clip line falls mid-gap at 0.19em. */
                    <span className="relative inline-block">
                      <span
                        className="inline-block"
                        style={{ clipPath: "inset(0.19em 0 0 0)" }}
                      >
                        i
                      </span>
                      <GlassHole
                        className="backdrop-brightness-110 backdrop-saturate-110"
                        style={{
                          width: "0.165em",
                          height: "0.165em",
                          left: "50%",
                          top: "-0.01em",
                          transform: "translateX(-50%)",
                        }}
                      />
                    </span>
                  ) : (
                    letter
                  )}
                </motion.span>
              ))}
            </span>

            <motion.span
              aria-hidden
              className="display-sm mt-3 max-w-[22ch] sm:mt-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 1.1, ease: EASE }}
            >
              Work at{" "}
              <GlassText className="whitespace-nowrap">light speed</GlassText>.
            </motion.span>
          </h1>

          {/* The install sits between the promise and the CTAs because it is
              the shortest path to the product; the margins above and below it
              were taken out of the old spacing so the beat stays one viewport. */}
          <motion.div
            className="mt-8 sm:mt-9"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.88, duration: 1, ease: EASE }}
          >
            <InstallCommand />
          </motion.div>

          <motion.div
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 1, ease: EASE }}
          >
            <OpenIn />
            <ActionLink href="/whitepaper" tone="ghost">
              Read the whitepaper
            </ActionLink>
          </motion.div>
        </GlassPool>
      </div>

      <motion.div
        aria-hidden
        className="absolute bottom-9 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <span className="font-mono text-[9.5px] tracking-[0.3em] text-faint uppercase">
          Scroll
        </span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 top-0 block h-1/2 bg-linear-to-b from-transparent to-ink/70"
            animate={reduced ? {} : { y: ["-100%", "200%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </Beat>
  );
}
