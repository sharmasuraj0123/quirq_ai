"use client";

import { motion } from "motion/react";
import { Mark, Reveal, Rise } from "@/components/ui/primitives";
import { GlassPool, GlassText } from "@/components/ui/glass";

const MAIL = "mailto:suraj@xo.builders?subject=quirq%20early%20access";

export function Invite() {
  return (
    <section
      id="invite"
      data-beat={4}
      className="relative flex min-h-svh flex-col overflow-hidden"
    >
      <div className="flex flex-1 items-center py-28">
        <div className="relative mx-auto w-full max-w-[1180px] px-5 text-center sm:px-8 lg:px-11">
          <GlassPool scrimClassName="mx-auto max-w-3xl">
          <h2 className="display over-stage mx-auto max-w-[16ch]">
            <Reveal delay={0.05}>Put a meter on</Reveal>
            <Reveal delay={0.13}>
              <GlassText>the other side.</GlassText>
            </Reveal>
          </h2>

          <Rise delay={0.24}>
            <p className="lede over-stage mx-auto mt-7 text-center">
              Early access is open for teams running agents in production.
            </p>
          </Rise>

          <Rise delay={0.34}>
            <motion.a
              href={MAIL}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="group focus-on-ink relative mt-11 inline-flex items-center gap-4 rounded-full bg-ink px-8 py-5 text-void sm:px-10"
            >
              {/* Spectrum bloom that lights up under the button on hover. */}
              <span
                aria-hidden
                className="absolute -inset-px -z-10 rounded-full opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-70"
                style={{ background: "var(--spectrum)" }}
              />
              <span className="font-mono text-[13px] tracking-[0.06em] sm:text-[15px]">
                suraj@xo.builders
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  d="M2 10L10 2M10 2H4M10 2V8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
          </Rise>
          </GlassPool>
        </div>
      </div>

      <footer className="relative">
        {/* The form is at its largest here and fills the lower frame, so the
            footer needs a base to sit on rather than floating over the glass. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 bg-linear-to-t from-black via-black/90 to-transparent"
        />
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-end justify-between gap-7 px-5 pb-9 sm:px-8 lg:px-11">
          <div>
            <div className="flex items-center gap-2.5">
              <Mark className="h-[18px] w-auto text-ink" />
              <span className="font-mark text-[17px] font-semibold">quirq</span>
              <span className="text-[13px] text-faint">· by XO Labs</span>
            </div>
            <p className="mt-3 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
              Tokens meter consumption.{" "}
              <span className="glass-text">Quirqs meter delivery.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-5 sm:gap-7">
            {[
              { href: "/quirq-whitepaper.pdf", label: "Whitepaper", newTab: true },
              { href: "/llm.txt", label: "llm.txt", newTab: true },
              { href: "https://xo.builders", label: "xo.builders", newTab: true },
              { href: "mailto:suraj@xo.builders", label: "Contact", newTab: false },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noopener noreferrer" : undefined}
                className="label px-2 py-2 -mx-2 -my-2 transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="spectrum-rule h-px w-full opacity-50" />
      </footer>
    </section>
  );
}
