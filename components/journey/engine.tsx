"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { StoryBeat } from "@/components/story/story-beat";
import type { BeatData } from "@/components/story/types";
import { Rise, TextScrim, cn } from "@/components/ui/primitives";
import { overrideLeaves } from "@/components/stage/choreography";
import {
  resolveDefinition,
  validateDefinition,
  type JourneyDefinition,
  type ResolvedJourney,
} from "@/app/journey/defs";

/**
 * The loading engine: give it one journey document and it walks it.
 *
 * Input is a JourneyDefinition, however it arrives: a prop from a server
 * component, a slug fetched from the journeys API, a pasted string, or a
 * dropped `.json` file. Everything goes through `loadDefinition`, so an
 * unparseable, invalid or hostile document ends as a printed reason and never
 * as a half-rendered walk.
 *
 * Deliberately simple, and the simplicity is the point: it renders the beats,
 * the trail, and the choices, and nothing else. Traces, recordings, replay,
 * and the `.quirq` library live in the studio at /journey; this is the reader.
 * Both sit on the same defs.tsx contract, so a document that walks here walks
 * there.
 */

export type Loaded =
  | { journey: ResolvedJourney; problem: null }
  | { journey: null; problem: string };

/**
 * Parse if needed, validate, resolve. The one door into the engine, so every
 * source of JSON is held to the same standard.
 */
export function loadDefinition(input: string | JourneyDefinition): Loaded {
  let raw: unknown = input;

  if (typeof input === "string") {
    if (!input.trim()) {
      return { journey: null, problem: "Nothing to load yet." };
    }
    try {
      raw = JSON.parse(input);
    } catch (err) {
      return {
        journey: null,
        problem: `Not JSON: ${err instanceof Error ? err.message : "could not parse"}`,
      };
    }
  }

  const problem = validateDefinition(raw as JourneyDefinition);
  if (problem) return { journey: null, problem: `Refused: ${problem}` };

  return { journey: resolveDefinition(raw as JourneyDefinition), problem: null };
}

/* --------------------------------- the walk -------------------------------- */

function Chip({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono text-[9.5px] tracking-[0.08em] uppercase transition-colors",
        active
          ? "border-ink/40 bg-white/[0.1] text-ink"
          : "border-hair-soft bg-white/[0.03] text-dim hover:border-ink/30 hover:text-ink",
        disabled && "cursor-not-allowed opacity-40 hover:border-hair-soft hover:text-dim",
      )}
    >
      {children}
    </button>
  );
}

/**
 * A document with nowhere to fork is a page, not a walk: no node offers a
 * choice, so there is nothing to decide and no trail to keep. Those render as
 * one scroll, in document order, which is also the order the JSON reads in.
 */
const isScroll = (journey: ResolvedJourney) =>
  Object.values(journey.nodes).every((node) => !node.choices?.length);

/** A node's beat, staged. Only journey pages stay in this tab. */
const stagedBeat = (
  journey: ResolvedJourney,
  id: string,
  index: number,
): BeatData => {
  const beat = journey.nodes[id].beat;
  return {
    ...beat,
    index,
    id: `walk-${id}`,
    links: beat.links?.map((link) => ({
      ...link,
      newTab: !link.href.startsWith("/journey"),
    })),
  };
};

/** The whole document as one scroll page: every node, in order, staged. */
function Scroll({
  journey,
  footer,
}: {
  journey: ResolvedJourney;
  footer?: React.ReactNode;
}) {
  const ids = Object.keys(journey.nodes);

  // Every node is on the page, so every node is a leaf of the track: the glass
  // performs the document from top to bottom as the reader scrolls.
  useEffect(() => {
    overrideLeaves(
      ids.map((id) => ({
        id: `walk-${id}`,
        keyframe: journey.nodes[id].keyframe,
      })),
    );
    // ids is derived from journey; keying on the document is the real dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey]);
  useEffect(() => () => overrideLeaves(null), []);

  return (
    <>
      {ids.map((id, i) => (
        <StoryBeat key={id} data={stagedBeat(journey, id, i)} />
      ))}

      {footer && (
        <section className="relative overflow-hidden pb-20">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
            <div className="over-stage relative mx-auto max-w-2xl text-center">
              <TextScrim />
              {footer}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/**
 * One walk of one journey. Mounted with a key on the journey slug, so loading
 * another document remounts this and the path starts over rather than
 * pointing at ids from the previous tree.
 */
function Walk({
  journey,
  footer,
}: {
  journey: ResolvedJourney;
  /** Controls that belong to whoever loaded the document. */
  footer?: React.ReactNode;
}) {
  const [path, setPath] = useState<string[]>([journey.rules.start]);
  const tip = journey.nodes[path[path.length - 1]];
  const atDepthLimit = path.length >= journey.rules.maxDepth;

  // The walked path IS the choreography track: one leaf per visited node, in
  // order, so the glass performs the branch the reader chose.
  useEffect(() => {
    overrideLeaves(
      path.map((id) => ({
        id: `walk-${id}`,
        keyframe: journey.nodes[id].keyframe,
      })),
    );
  }, [path, journey]);
  // Handing the stage back to the published track on the way out.
  useEffect(() => () => overrideLeaves(null), []);

  return (
    <>
      {path.map((id, i) => (
        <StoryBeat key={`${id}-${i}`} data={stagedBeat(journey, id, i)} />
      ))}

      {/* The choice point is an interlude, deliberately unregistered, so the
          glass keeps gliding from the last chosen pose while you decide. */}
      <section className="relative flex min-h-[70svh] items-center overflow-hidden pb-24">
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
          <div className="over-stage relative mx-auto flex max-w-2xl flex-col items-center text-center">
            <TextScrim />

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[9.5px] tracking-[0.22em] text-faint uppercase">
                Your path
              </span>
              {path.map((id, i) => (
                <Chip
                  key={`${id}-${i}`}
                  active={i === path.length - 1}
                  disabled={i === path.length - 1 || !journey.rules.allowRewind}
                  onClick={() => setPath(path.slice(0, i + 1))}
                >
                  {journey.nodes[id].short}
                </Chip>
              ))}
            </div>

            {tip.prompt && tip.choices?.length && !atDepthLimit ? (
              <>
                <p className="display-sm mt-8 max-w-[18ch]">{tip.prompt}</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {tip.choices.map((choice) => (
                    <button
                      key={`${choice.to}-${choice.label}`}
                      type="button"
                      onClick={() => setPath([...path, choice.to])}
                      className="group inline-flex items-center gap-2.5 rounded-full border border-hair bg-black/40 px-6 py-3.5 font-mono text-[11.5px] tracking-[0.14em] text-ink/85 uppercase backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/30 hover:text-ink"
                    >
                      {choice.label}
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        <path
                          d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="mt-7 font-mono text-[10px] leading-relaxed tracking-[0.1em] text-faint">
                  {path.length} of {journey.rules.maxDepth} beats walked · the
                  glass is on your branch
                </p>
              </>
            ) : (
              <>
                <p className="display-sm mt-8 max-w-[18ch]">
                  {atDepthLimit && tip.choices?.length
                    ? "The rules end this branch here."
                    : "End of this branch."}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPath([journey.rules.start])}
                    className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 font-mono text-[11.5px] tracking-[0.14em] text-void uppercase transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Walk it again
                  </button>
                  {path.length > 1 && journey.rules.allowRewind && (
                    <button
                      type="button"
                      onClick={() => setPath(path.slice(0, -1))}
                      className="inline-flex items-center gap-2.5 rounded-full border border-hair bg-black/40 px-6 py-3.5 font-mono text-[11.5px] tracking-[0.14em] text-ink/85 uppercase backdrop-blur-md transition-colors hover:border-ink/30 hover:text-ink"
                    >
                      One step back
                    </button>
                  )}
                </div>
              </>
            )}

            {footer && <div className="mt-8 w-full">{footer}</div>}
          </div>
        </div>
      </section>
    </>
  );
}

/* -------------------------------- the engine ------------------------------- */

/** A panel for anything the engine has to say before it can walk. */
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-24 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-11">
        <div className="over-stage relative mx-auto max-w-2xl">
          <TextScrim />
          <Rise>
            <p className="label">Journey loader</p>
            <h1 className="display-sm mt-5 max-w-[20ch]">{title}</h1>
          </Rise>
          <Rise delay={0.08}>{children}</Rise>
        </div>
      </div>
    </section>
  );
}

export function JourneyEngine({
  definition,
  accept = false,
  footer,
}: {
  /** A document the server already has; the common case. */
  definition?: JourneyDefinition;
  /** Show the paste, file and slug inputs when no document is supplied. */
  accept?: boolean;
  footer?: React.ReactNode;
}) {
  // Resolving during the first render keeps the server and client agreed on
  // the opening beat: this is pure, so both arrive at the same document.
  const [state, setState] = useState<Loaded | null>(() =>
    definition ? loadDefinition(definition) : null,
  );
  const [text, setText] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  /** Pull a document from the journeys API by slug (files and derived alike). */
  const loadSlug = async (slug: string) => {
    setPending(slug);
    try {
      const res = await fetch(`/api/journeys/${slug}`);
      if (!res.ok) throw new Error(await res.text());
      setState(loadDefinition((await res.json()) as JourneyDefinition));
    } catch (err) {
      setState({
        journey: null,
        problem: `Could not fetch ${slug}: ${err instanceof Error ? err.message : "unknown"}`,
      });
    } finally {
      setPending(null);
    }
  };

  // ?src=<slug> loads a document straight from the API. Read from the address
  // bar after hydration rather than through searchParams, so this route stays
  // static and its default state is the empty loader.
  useEffect(() => {
    if (!accept) return;
    const src = new URLSearchParams(window.location.search).get("src");
    if (src && /^[a-z0-9-]{1,64}$/.test(src)) loadSlug(src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accept]);

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    const raw = await picked.text();
    setText(raw);
    setState(loadDefinition(raw));
  };

  if (state?.journey) {
    // Same document, same contract; only the shape of the reading differs.
    const Show = isScroll(state.journey) ? Scroll : Walk;
    return (
      <Show
        key={state.journey.slug}
        journey={state.journey}
        footer={
          accept ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[9.5px] tracking-[0.22em] text-faint uppercase">
                Loaded
              </span>
              <Chip active onClick={() => {}} disabled>
                {state.journey.slug}
              </Chip>
              <Chip
                onClick={() => {
                  setState(null);
                  setText("");
                }}
              >
                Load another
              </Chip>
            </div>
          ) : (
            footer
          )
        }
      />
    );
  }

  // Nothing walkable: hand the stage back to the published track so the shot
  // still performs while the reader is at the loader.
  return (
    <Panel
      title={
        accept ? "Paste a journey, watch it walk." : "This document cannot walk."
      }
    >
      {accept ? (
        <>
          <p className="mt-6 text-[15px] leading-[1.7] text-dim">
            Any JourneyDefinition works: a file from{" "}
            <code className="font-mono text-[13px] text-ink/80">
              .quirq/journeys
            </code>
            , one derived from a research note, or one you wrote by hand. It is
            checked before it renders, and refused with a reason if it cannot
            be walked.
          </p>

          <label
            htmlFor="journey-json"
            className="label mt-8 block text-[9.5px]"
          >
            The document
          </label>
          <textarea
            id="journey-json"
            value={text}
            onChange={(event) => setText(event.target.value)}
            spellCheck={false}
            rows={10}
            placeholder={'{\n  "slug": "my-journey",\n  "name": "My journey",\n  "rules": { "start": "open" },\n  "nodes": { "open": { "short": "start", "pose": { "base": "centre" }, "beat": { "layout": "center", "title": ["One document,", "one walk."] } } }\n}'}
            className="mt-2 w-full resize-y rounded-2xl border border-hair bg-black/50 p-4 font-mono text-[12px] leading-[1.7] text-ink/85 backdrop-blur-md placeholder:text-faint/70"
          />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setState(loadDefinition(text))}
              className="focus-on-ink inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 font-mono text-[11.5px] tracking-[0.14em] text-void uppercase transition-transform duration-300 hover:-translate-y-0.5"
            >
              Load the journey
            </button>
            <button
              type="button"
              onClick={() => file.current?.click()}
              className="inline-flex items-center gap-2.5 rounded-full border border-hair bg-black/40 px-6 py-3.5 font-mono text-[11.5px] tracking-[0.14em] text-ink/85 uppercase backdrop-blur-md transition-colors hover:border-ink/30 hover:text-ink"
            >
              Open a .json file
            </button>
            <input
              ref={file}
              id="journey-file"
              type="file"
              accept="application/json,.json"
              onChange={onFile}
              className="sr-only"
            />
            <label htmlFor="journey-file" className="sr-only">
              Open a journey document from a file
            </label>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9.5px] tracking-[0.22em] text-faint uppercase">
              Or fetch
            </span>
            {["default", "research-the-quirq"].map((slug) => (
              <Chip
                key={slug}
                onClick={() => loadSlug(slug)}
                disabled={pending !== null}
              >
                {pending === slug ? "Fetching" : slug}
              </Chip>
            ))}
          </div>

          {state?.problem && (
            <p
              role="alert"
              className="mt-6 font-mono text-[11px] leading-relaxed tracking-[0.06em] text-spec-orange"
            >
              {state.problem}
            </p>
          )}
        </>
      ) : (
        <p
          role="alert"
          className="mt-6 font-mono text-[12px] leading-relaxed tracking-[0.06em] text-spec-orange"
        >
          {state?.problem ?? "No journey document was supplied."}
        </p>
      )}
    </Panel>
  );
}
