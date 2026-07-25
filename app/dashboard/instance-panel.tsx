"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  DEFAULT_ENDPOINT,
  INSTANCE_ENDPOINT_STORAGE_KEY,
  INSTANCE_RECONNECT_STORAGE_KEY,
  formatAgo,
  formatBytes,
  healthOf,
  probeInstance,
  secondsSince,
  type Connection,
  type ContractRow,
  type InstanceNode,
  type InstancePayload,
} from "@/lib/quirq/instance";
import { Rise, TextScrim, cn } from "@/components/ui/primitives";
import { beatsResized } from "@/lib/beat-registry";

/* ------------------------------------------------------------------ *
 * Local chrome
 *
 * Deliberately not imported from dashboard.tsx: that module imports this one,
 * and a cycle between two client components is a worse trade than thirty lines
 * of shared idiom. These match the panel conventions used across the site.
 *
 * Surfaces are darker than the flat-page versions were. Every block below now
 * sits over the live 3D shot, and a half-black panel over the burst is not a
 * readable surface for twelve columns of mono figures.
 * ------------------------------------------------------------------ */

const PILL =
  "rounded-full px-4 py-2 font-mono text-[10.5px] tracking-[0.14em] uppercase transition-colors";

const DISABLED =
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-hair disabled:hover:text-dim";

const GHOST = `border border-hair text-dim hover:border-ink/30 hover:text-ink ${DISABLED}`;

const TONE: Record<"ok" | "warn" | "fail", string> = {
  ok: "text-spec-green",
  warn: "text-spec-yellow",
  fail: "text-spec-red",
};

/** Case is the second channel after colour, so a failure is findable by
 *  scanning a column rather than only by hue. */
const VERDICT: Record<"ok" | "warn" | "fail", string> = {
  ok: "ok",
  warn: "warn",
  fail: "FAIL",
};

/**
 * `scrolls` drops the clip. A horizontally scrolling table inside a block is
 * focusable, and the global focus ring sits 4px outside its element, which an
 * overflow-hidden ancestor would shave away. It cannot be corrected per
 * element either: the `:focus-visible` rule in globals.css is unlayered, so no
 * Tailwind utility can beat it.
 */
function Block({
  title,
  aside,
  scrolls,
  children,
}: {
  title: string;
  aside?: ReactNode;
  scrolls?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        // min-w-0 is load bearing: a block holding a table wider than the
        // viewport is a grid item, and the auto minimum would size the track to
        // the table and drag every sibling block off the page with it.
        "min-w-0 rounded-2xl border border-hair bg-black/70 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.6)]",
        scrolls ? "overflow-visible" : "overflow-hidden",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair-soft px-5 py-3.5 sm:px-6">
        <h3 className="label">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="border-t border-hair-soft px-5 py-4 font-mono text-[10.5px] leading-relaxed text-dim sm:px-6">
      {children}
    </p>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "fail";
}) {
  return (
    <div className="bg-black/80 px-5 py-5">
      <p className="label text-[9.5px]">{label}</p>
      <p
        className={cn(
          "numeric mt-2.5 font-mono text-[13px] leading-snug break-words tabular-nums",
          tone ? TONE[tone] : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Fact({
  term,
  value,
  mono = true,
}: {
  term: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">
        {term}
      </dt>
      <dd
        className={cn(
          "numeric mt-1.5 break-words tabular-nums",
          mono ? "font-mono text-[11.5px] text-ink/85" : "text-[13px] text-ink/85",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Th({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 font-mono text-[9.5px] font-medium tracking-[0.14em] text-faint uppercase whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Scroller({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div tabIndex={0} role="region" aria-label={label} className="overflow-x-auto">
      {children}
    </div>
  );
}

const CELL = "px-4 py-3 font-mono text-[12px] tabular-nums whitespace-nowrap";

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

/**
 * The transcribed types say `updated_at: string`, but a contract row for a file
 * that has never been written arrives with null. `formatAgo` already answers
 * "unknown" for anything unparseable; this only makes the nullability visible
 * where it is read.
 */
const ago = (iso: string | null | undefined, now: number) =>
  iso ? formatAgo(iso, now) : "unknown";

const yesNo = (value: boolean) => (value ? "yes" : "no");

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/* ------------------------------------------------------------------ *
 * The connection, held above the beats
 * ------------------------------------------------------------------ */

type InstanceValue = {
  endpoint: string;
  setEndpoint: (value: string) => void;
  connection: Connection;
  /** One shared clock for every relative time on the page. */
  now: number;
  connect: (target: string) => void;
  disconnect: () => void;
};

const InstanceCtx = createContext<InstanceValue | null>(null);

function useInstance(): InstanceValue {
  const value = useContext(InstanceCtx);
  if (!value) {
    throw new Error("Instance panels must be rendered inside <InstanceProvider>.");
  }
  return value;
}

/**
 * The connection now spans two beats: the form and the health verdict stand in
 * front of the glass in one, the environment detail in the next. So the state
 * lives above both rather than inside a single panel.
 *
 * Children are passed straight through instead of being built here, which is
 * what keeps the once-a-second clock cheap: the element tree handed in is
 * referentially unchanged on a tick, so React re-renders only the two panels
 * that actually read the context.
 */
export function InstanceProvider({ children }: { children: ReactNode }) {
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
  const [connection, setConnection] = useState<Connection>({ state: "idle" });

  // One shared clock for every relative time in a render, so two figures on the
  // same screen can never disagree about what "now" is.
  const [now, setNow] = useState(() => Date.now());

  const probe = useRef(0);
  const restored = useRef(false);

  // The payload is a snapshot, but how old that snapshot is keeps changing.
  // Only ticks while something is on screen to age.
  useEffect(() => {
    if (connection.state !== "connected") return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [connection]);

  // Connecting mounts several viewports of detail and disconnecting takes them
  // away again, which moves every beat centre below. The runtime observes the
  // sections too, but this is the deliberate change, so say so directly rather
  // than waiting on a delivery the browser is free to defer.
  useEffect(() => {
    beatsResized();
  }, [connection]);

  const connect = useCallback(async (target: string) => {
    const trimmed = target.trim() || DEFAULT_ENDPOINT;
    const token = probe.current + 1;
    probe.current = token;

    setConnection({ state: "connecting", endpoint: trimmed });

    const result = await probeInstance(trimmed);
    // Disconnecting, or starting a later probe, bumps the token. A slow answer
    // to an abandoned request must not resurrect a connection the reader closed.
    if (probe.current !== token) return;
    setConnection(result);

    // Only an endpoint that answered is worth remembering. Persisting a typo
    // would greet the next visit with a failure the reader has to undo.
    if (result.state === "connected") {
      try {
        window.localStorage.setItem(INSTANCE_ENDPOINT_STORAGE_KEY, trimmed);
      } catch {
        // Storage can be denied outright. Nothing here is worth failing over.
      }
    }
  }, []);

  // Restore after mount only: storage and the one-shot handoff do not exist on
  // the server. A successful homepage probe leaves both; the dashboard consumes
  // the reconnect flag once so the user does not repeat an action they just
  // completed. Direct dashboard visits still remain explicit and idle.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    let saved: string | null = null;
    let shouldReconnect = false;
    try {
      saved = window.localStorage.getItem(INSTANCE_ENDPOINT_STORAGE_KEY);
    } catch {
      // Storage can be denied. The default endpoint remains usable.
    }
    try {
      shouldReconnect =
        window.sessionStorage.getItem(INSTANCE_RECONNECT_STORAGE_KEY) === "1";
      window.sessionStorage.removeItem(INSTANCE_RECONNECT_STORAGE_KEY);
    } catch {
      // A blocked handoff degrades to the existing explicit Connect button.
    }

    const target = saved || DEFAULT_ENDPOINT;
    if (saved) setEndpoint(saved);
    if (shouldReconnect) void connect(target);
  }, [connect]);

  const disconnect = useCallback(() => {
    probe.current += 1;
    setConnection({ state: "idle" });
  }, []);

  const value = useMemo<InstanceValue>(
    () => ({
      endpoint,
      setEndpoint,
      connection,
      now,
      connect: (target: string) => void connect(target),
      disconnect,
    }),
    [endpoint, connection, now, connect, disconnect],
  );

  return <InstanceCtx.Provider value={value}>{children}</InstanceCtx.Provider>;
}

/* ------------------------------------------------------------------ *
 * Beat 2: the action, and what the environment answers
 * ------------------------------------------------------------------ */

export function InstanceConnect() {
  const uid = useId();
  const { endpoint, setEndpoint, connection, now, connect, disconnect } =
    useInstance();

  const endpointId = `${uid}-endpoint`;
  const hintId = `${uid}-hint`;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    connect(endpoint);
  };

  const busy = connection.state === "connecting";
  const payload = connection.state === "connected" ? connection.payload : null;

  const primaryLabel = busy
    ? "Connecting…"
    : connection.state === "connected"
      ? "Check status"
      : connection.state === "failed"
        ? "Try again"
        : "Connect";

  return (
    <section aria-labelledby={`${uid}-heading`}>
      <Rise>
        <h2 id={`${uid}-heading`} className="label relative">
          Instance · a machine-local XO Space
        </h2>

        {/* The one line that keeps the two halves of this page apart. */}
        <p className="over-stage relative mt-4 text-[14.5px] leading-[1.65] text-ink/85">
          An instance is not a ledger. Everything in this beat and the next
          describes the{" "}
          <span className="text-ink">environment that would do the metering</span>
          : where its root is, whether it can write, whether it is watching.
          None of it is settled work, none of it mints anything, and none of it
          belongs in the figures further down.
        </p>
      </Rise>

      <Rise delay={0.1} className="mt-6">
        <Block title="Connect" aside={<StatusPill connection={connection} />}>
          <form onSubmit={onSubmit} className="px-5 py-6 sm:px-6">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1 basis-[260px]">
                <label htmlFor={endpointId} className="label text-[9.5px]">
                  Endpoint
                </label>
                <input
                  id={endpointId}
                  name="endpoint"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  value={endpoint}
                  onChange={(event) => setEndpoint(event.target.value)}
                  placeholder={DEFAULT_ENDPOINT}
                  aria-describedby={hintId}
                  className="mt-2.5 h-[38px] w-full rounded-full border border-hair bg-black/50 px-5 font-mono text-[12px] text-ink transition-colors placeholder:text-faint hover:border-ink/20 focus:border-ink/30"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className={cn(
                  PILL,
                  "focus-on-ink h-[38px] bg-ink text-void disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {primaryLabel}
              </button>

              {/* Rendered in every state rather than mounted on connect: a
                  control that appears and disappears moves the row it sits in. */}
              <button
                type="button"
                onClick={disconnect}
                disabled={connection.state === "idle" || busy}
                className={cn(PILL, GHOST, "h-[38px]")}
              >
                Disconnect
              </button>
            </div>

            <p
              id={hintId}
              className="mt-3 font-mono text-[10.5px] leading-relaxed text-faint"
            >
              Loopback only: localhost, 127.0.0.1 or ::1. The site reaches the
              instance through a same-origin proxy, and anything that is not a
              local address is refused before a socket opens.
            </p>

            {/* Always in the DOM so the region is registered before its
                contents change; a live region mounted with its message is
                not reliably announced. */}
            <div aria-live="polite" className="mt-6 border-t border-hair-soft pt-5">
              <StatusReadout connection={connection} now={now} />
            </div>
          </form>
        </Block>
      </Rise>

      {payload && (
        <div className="mt-6">
          <HealthBlock payload={payload} />
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Beat 3: the rest of the environment, at full width
 * ------------------------------------------------------------------ */

export function InstanceDetail() {
  const { connection, now } = useInstance();
  const payload = connection.state === "connected" ? connection.payload : null;
  if (!payload) return null;

  return (
    <section aria-label="Instance detail">
      <div className="relative">
        <TextScrim />
        <p className="label relative">The environment · continued</p>
        <p className="over-stage relative mt-3 max-w-[78ch] font-mono text-[10.5px] leading-relaxed text-faint">
          Still the instance and not the ledger. Nothing in these eight blocks
          is settled work, none of it mints anything, and none of it feeds a
          figure below.
        </p>
      </div>

      {/* Not wrapped in Rise: whileInView needs a quarter of the element on
          screen at once, and the detail below is several viewports tall. */}
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6">
        <RootBlock payload={payload} />
        <WatcherBlock payload={payload} />
        <ActivityBlock payload={payload} now={now} />
        <OutputsBlock payload={payload} now={now} />
        <ContractsBlock payload={payload} />
        <CatalogBlock payload={payload} now={now} />
        <TotalsBlock payload={payload} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Connection state
 * ------------------------------------------------------------------ */

function StatusPill({ connection }: { connection: Connection }) {
  const word =
    connection.state === "connected"
      ? "connected"
      : connection.state === "connecting"
        ? "reaching"
        : connection.state === "failed"
          ? "no answer"
          : "not connected";

  return (
    <span
      className={cn(
        "flex items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[9.5px] tracking-[0.08em] uppercase",
        connection.state === "connected" && "bg-spec-green/10 text-spec-green",
        connection.state === "failed" && "bg-spec-yellow/10 text-spec-yellow",
        (connection.state === "idle" || connection.state === "connecting") &&
          "bg-white/8 text-dim",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-[7px] w-[7px] shrink-0 rounded-full",
          connection.state === "connected"
            ? "bg-spec-green"
            : connection.state === "failed"
              ? "bg-spec-yellow"
              : "bg-dim",
        )}
      />
      {word}
    </span>
  );
}

function StatusReadout({
  connection,
  now,
}: {
  connection: Connection;
  now: number;
}) {
  if (connection.state === "idle") {
    return (
      <p className="max-w-[74ch] text-[13.5px] leading-[1.65] text-dim">
        Not connected. Connecting is an action you take: nothing is probed until
        you press the button. The instance is the XO Space app running on this
        machine, and what comes back is read here and sent nowhere.
      </p>
    );
  }

  if (connection.state === "connecting") {
    return (
      <p className="font-mono text-[12px] text-dim">
        Reaching <span className="text-ink">{connection.endpoint}</span>
        …
      </p>
    );
  }

  if (connection.state === "failed") {
    return (
      <div>
        <p className="font-mono text-[9.5px] tracking-[0.14em] text-spec-yellow uppercase">
          No answer
        </p>
        {/* Outside the uppercase run on purpose: an endpoint is a URL, and
            printing it in caps both misreads and misquotes what was typed. */}
        <p className="mt-2 font-mono text-[11.5px] break-all text-dim">
          {connection.endpoint}
        </p>
        {/* Verbatim. The proxy writes a specific reason for each failure mode
            and paraphrasing it would cost the reader the diagnosis. */}
        <p className="mt-2.5 max-w-[74ch] font-mono text-[12px] leading-relaxed text-ink/80">
          {connection.reason}
        </p>
        <p className="mt-3 max-w-[74ch] font-mono text-[10.5px] leading-relaxed text-faint">
          Nothing is broken here. The instance is the local XO Space app, and
          this panel only reaches loopback addresses, so it can find an instance
          on this machine and nothing else. If Space is running, check the port.
        </p>
      </div>
    );
  }

  const stale = secondsSince(connection.payload.generated_at, now);

  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
        <Fact term="Endpoint" value={connection.endpoint} />
        <Fact term="Round trip" value={`${connection.latencyMs} ms`} />
        <Fact term="Read" value={ago(connection.fetchedAt, now)} />
        <Fact
          term="Instance clock"
          value={ago(connection.payload.generated_at, now)}
        />
      </dl>
      <p className="mt-5 max-w-[74ch] font-mono text-[10.5px] leading-relaxed text-faint">
        This is a snapshot, not a stream. The instance stamped it{" "}
        <span className="text-dim">{connection.payload.generated_at}</span>
        {stale === null
          ? ""
          : `, ${stale} ${plural(stale, "second", "seconds")} ago by this machine's clock`}
        , and every figure below is frozen at that moment until you check status
        again.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Health
 * ------------------------------------------------------------------ */

function HealthBlock({ payload }: { payload: InstancePayload }) {
  // healthOf is the single source of this judgement; nothing is added to it
  // here, and the row order is the order it returns.
  const checks = useMemo(() => healthOf(payload), [payload]);
  const failing = checks.filter((check) => check.severity === "fail").length;
  const warning = checks.filter((check) => check.severity === "warn").length;

  return (
    <Block
      title="Health"
      aside={
        <span className="numeric font-mono text-[11px] text-dim tabular-nums">
          {failing > 0
            ? `${failing} failing · ${warning} to note`
            : warning > 0
              ? `${checks.length - warning} ok · ${warning} to note`
              : `all ${checks.length} ok`}
        </span>
      }
    >
      <ul>
        {checks.map((check) => (
          <li
            key={check.id}
            className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1.5 border-b border-hair-soft px-5 py-3.5 last:border-b-0 sm:grid-cols-[3.25rem_11rem_minmax(0,1fr)] sm:px-6"
          >
            <span
              className={cn(
                "font-mono text-[10px] tracking-[0.1em]",
                TONE[check.severity],
              )}
            >
              {VERDICT[check.severity]}
            </span>
            <span className="text-[13px] text-ink/90">{check.label}</span>
            <span className="col-start-2 font-mono text-[11px] leading-relaxed break-words text-dim sm:col-start-3">
              {check.detail}
            </span>
          </li>
        ))}
      </ul>
      <Note>
        Health is derived here, not reported. The instance sends facts: what its
        root permits, what the watcher is doing, whether onboarding ever
        finished. The verdict beside each one is this page reading them.
      </Note>
    </Block>
  );
}

/* ------------------------------------------------------------------ *
 * Root
 * ------------------------------------------------------------------ */

function RootBlock({ payload }: { payload: InstancePayload }) {
  const { root } = payload;

  return (
    <Block title="Root">
      <div className="grid gap-px bg-white/6 md:grid-cols-2">
        <div className="bg-black/80 px-5 py-5 sm:px-6">
          <p className="label text-[9.5px]">On this machine · host path</p>
          <p className="mt-2.5 font-mono text-[12.5px] break-all text-ink">
            {root.host_path}
          </p>
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-faint">
            The directory you could open in a file browser right now.
          </p>
        </div>
        <div className="bg-black/80 px-5 py-5 sm:px-6">
          <p className="label text-[9.5px]">Inside the container</p>
          <p className="mt-2.5 font-mono text-[12.5px] break-all text-dim">
            {root.container_path}
          </p>
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-faint">
            The same directory as the instance sees it, mounted under its own
            filesystem.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-white/6">
        <Stat
          label="Exists"
          value={yesNo(root.exists)}
          tone={root.exists ? "ok" : "fail"}
        />
        <Stat
          label="Readable"
          value={yesNo(root.readable)}
          tone={root.readable ? "ok" : "fail"}
        />
        <Stat
          label="Writable"
          value={yesNo(root.writable)}
          tone={root.writable ? "ok" : "fail"}
        />
      </div>

      <Note>
        Two names for one directory. Paths inside the instance are container
        paths and will not resolve in a host shell, which is why both are
        printed rather than one being chosen for you.
      </Note>
    </Block>
  );
}

/* ------------------------------------------------------------------ *
 * Watcher and runtime
 * ------------------------------------------------------------------ */

function WatcherBlock({ payload }: { payload: InstancePayload }) {
  const { watcher, runtime } = payload;

  // The gap worth naming: what the config asks for against what is running.
  const configGap = watcher.enabled !== watcher.configured_enabled;
  const runtimeGap =
    runtime.watcher_enabled !== watcher.enabled ||
    runtime.watcher_interval_seconds !== watcher.interval_seconds ||
    runtime.watcher_source_mode !== watcher.source_mode;
  const idle = watcher.enabled && watcher.tracked_files === 0;

  return (
    <Block
      title="Watcher and runtime"
      aside={
        <span
          className={cn(
            "font-mono text-[11px]",
            watcher.enabled ? "text-spec-green" : "text-spec-yellow",
          )}
        >
          {watcher.enabled ? "running" : "not running"}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-px bg-white/6 md:grid-cols-3">
        <Stat
          label="Enabled"
          value={yesNo(watcher.enabled)}
          tone={watcher.enabled ? "ok" : "warn"}
        />
        <Stat label="Interval" value={`${watcher.interval_seconds}s`} />
        <Stat label="Source mode" value={watcher.source_mode} />
        <Stat
          label="Tracked files"
          value={String(watcher.tracked_files)}
          tone={idle ? "warn" : undefined}
        />
        <Stat
          label="Offsets on disk"
          value={yesNo(watcher.offsets_present)}
          tone={watcher.offsets_present ? undefined : "warn"}
        />
        <Stat label="Agent" value={runtime.agent_name} />
      </div>

      {(configGap || runtimeGap || idle) && (
        <div className="border-t border-hair-soft px-5 py-5 sm:px-6">
          <p className="label text-[9.5px]">Worth noticing</p>
          <ul className="mt-3 grid gap-2.5">
            {configGap && (
              <li className="font-mono text-[11.5px] leading-relaxed text-spec-yellow">
                Configured {yesNo(watcher.configured_enabled)}, actually{" "}
                {watcher.enabled ? "running" : "not running"}. The config and
                the process disagree, so the observed state is the one to
                believe.
              </li>
            )}
            {runtimeGap && (
              <li className="font-mono text-[11.5px] leading-relaxed text-spec-yellow">
                The runtime reports the watcher as{" "}
                {yesNo(runtime.watcher_enabled)} at{" "}
                {runtime.watcher_interval_seconds}s over{" "}
                {runtime.watcher_source_mode} sources, which is not what the
                watcher itself reports above.
              </li>
            )}
            {idle && (
              <li className="font-mono text-[11.5px] leading-relaxed text-dim">
                Running with 0 tracked files and{" "}
                {watcher.offsets_present ? "offsets" : "no offsets"} on disk: it
                is polling every {watcher.interval_seconds}s and has not yet
                found a source to follow.
              </li>
            )}
          </ul>
        </div>
      )}

      <Note>
        The watcher is the part that would notice work happening. Nothing here
        measures value: an interval and a source mode say how often the
        environment looks, not what it found.
      </Note>
    </Block>
  );
}

/* ------------------------------------------------------------------ *
 * Live activity
 * ------------------------------------------------------------------ */

function ActivityBlock({
  payload,
  now,
}: {
  payload: InstancePayload;
  now: number;
}) {
  const { activity } = payload;

  // Open sessions first, then a stable name order. Not localeCompare: a
  // locale-sensitive sort makes row order an environment detail.
  const ranked = useMemo(
    () =>
      [...activity.projects].sort(
        (a, b) =>
          b.open_sessions - a.open_sessions ||
          (a.project_id < b.project_id ? -1 : a.project_id > b.project_id ? 1 : 0),
      ),
    [activity.projects],
  );

  const busy = ranked.reduce((sum, project) => sum + project.open_sessions, 0);
  const quiet = busy === 0 && activity.workspace_open_sessions === 0;

  return (
    <Block
      title="Live activity"
      scrolls
      aside={
        <span className="numeric font-mono text-[11px] text-dim tabular-nums">
          {activity.workspace_open_sessions} workspace{" "}
          {plural(activity.workspace_open_sessions, "session", "sessions")} ·
          updated {ago(activity.workspace_updated_at, now)}
        </span>
      }
    >
      <p className="max-w-[78ch] px-5 pt-5 text-[13.5px] leading-[1.65] text-ink/80 sm:px-6">
        {quiet ? (
          <>
            Nothing is running right now. All {ranked.length}{" "}
            {plural(ranked.length, "project", "projects")} report zero open
            sessions, so the zeros below are the answer rather than missing
            data: the watcher is reporting, it simply has no live session to
            report.
          </>
        ) : (
          <>
            {busy} open {plural(busy, "session", "sessions")} across{" "}
            {ranked.filter((project) => project.open_sessions > 0).length} of{" "}
            {ranked.length} {plural(ranked.length, "project", "projects")}.
          </>
        )}
      </p>

      {ranked.length > 0 && (
        <div className="mt-5">
          <Scroller label="Per-project live sessions">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <caption className="sr-only">
                Every project the instance has discovered, with its open
                sessions, the runtimes attached to them, and when its presence
                file was last written.
              </caption>
              <thead>
                <tr className="border-y border-hair-soft bg-white/[0.03]">
                  <Th className="w-[38%]">Project</Th>
                  <Th align="right">Open sessions</Th>
                  <Th>Runtimes</Th>
                  <Th align="right">Updated</Th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((project) => (
                  <tr
                    key={project.project_id}
                    className="border-b border-hair-soft last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 text-left font-mono text-[12px] font-normal text-ink"
                    >
                      {project.project_id}
                    </th>
                    <td
                      className={cn(
                        CELL,
                        "numeric text-right",
                        project.open_sessions > 0 ? "text-spec-green" : "text-faint",
                      )}
                    >
                      {project.open_sessions}
                    </td>
                    <td className={cn(CELL, "text-dim")}>
                      {project.runtimes.length > 0 ? (
                        project.runtimes.join(" · ")
                      ) : (
                        <span className="text-faint">none attached</span>
                      )}
                    </td>
                    <td className={cn(CELL, "numeric text-right text-dim")}>
                      {ago(project.updated_at, now)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroller>
        </div>
      )}

      <Note>
        An open session is a live agent attached to a project, not a settled
        unit. A busy instance mints nothing on its own; a quiet one is not
        evidence that no work was done.
      </Note>
    </Block>
  );
}

/* ------------------------------------------------------------------ *
 * Project outputs
 * ------------------------------------------------------------------ */

function OutputsBlock({
  payload,
  now,
}: {
  payload: InstancePayload;
  now: number;
}) {
  const outputs = payload.project_outputs;

  return (
    <Block
      title="Project outputs"
      scrolls
      aside={
        <span className="numeric font-mono text-[11px] text-dim tabular-nums">
          {outputs.project_count}{" "}
          {plural(outputs.project_count, "project", "projects")} writing
        </span>
      }
    >
      <p className="max-w-[78ch] px-5 pt-5 font-mono text-[10.5px] leading-relaxed text-faint sm:px-6">
        Discovered under{" "}
        <span className="text-dim">{outputs.root.host_path}</span> on the host,{" "}
        <span className="text-dim">{outputs.root.container_path}</span> inside
        the container.
      </p>

      <div className="mt-5">
        <Scroller label="Project output directories">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <caption className="sr-only">
              Each discovered project, where its watcher directory lives on the
              host, how many watcher files it holds, and whether it still writes
              the legacy activity file.
            </caption>
            <thead>
              <tr className="border-y border-hair-soft bg-white/[0.03]">
                <Th>Project</Th>
                <Th className="w-[40%]">Host path</Th>
                <Th align="right">Watcher files</Th>
                <Th align="right">Bytes</Th>
                <Th align="right">Updated</Th>
                <Th align="right">Legacy file</Th>
              </tr>
            </thead>
            <tbody>
              {outputs.projects.map((project) => (
                <tr
                  key={project.project_id}
                  className="border-b border-hair-soft last:border-b-0"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-mono text-[12px] font-normal whitespace-nowrap text-ink"
                  >
                    {project.project_id}
                  </th>
                  <td className="max-w-0 px-4 py-3 font-mono text-[11.5px] text-dim">
                    <span className="block truncate" title={project.host_path}>
                      {project.host_path}
                    </span>
                  </td>
                  <td className={cn(CELL, "numeric text-right text-ink/80")}>
                    {project.watcher_file_count}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-ink/80")}>
                    {formatBytes(project.bytes)}
                  </td>
                  <td className={cn(CELL, "numeric text-right text-dim")}>
                    {ago(project.updated_at, now)}
                  </td>
                  <td
                    className={cn(
                      CELL,
                      "text-right",
                      project.legacy_activity_file
                        ? "text-spec-yellow"
                        : "text-faint",
                    )}
                  >
                    {project.legacy_activity_file ? "present" : "no"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroller>
      </div>

      <div className="border-t border-hair-soft px-5 py-5 sm:px-6">
        <p className="label text-[9.5px]">
          Legacy activity files · {outputs.legacy_activity_files}
        </p>
        <p className="mt-3 max-w-[78ch] font-mono text-[11.5px] leading-relaxed text-dim">
          {outputs.legacy_activity_note}
        </p>
      </div>

      <Note>
        Bytes here are what the environment has written about itself, not
        anything it produced. A project with a large watcher directory has been
        observed a lot; it has not necessarily delivered anything.
      </Note>
    </Block>
  );
}

/* ------------------------------------------------------------------ *
 * Contracts
 * ------------------------------------------------------------------ */

function ContractRows({
  scope,
  rows,
}: {
  scope: string;
  rows: readonly ContractRow[];
}) {
  return (
    <>
      {rows.map((row) => {
        const absent = row.present_count === 0;
        return (
          <tr
            key={`${scope}-${row.path}`}
            className="border-b border-hair-soft last:border-b-0"
          >
            <td className={cn(CELL, "text-faint")}>{scope}</td>
            <th scope="row" className="px-4 py-3 text-left font-normal">
              <span
                className={cn(
                  "block font-mono text-[12px]",
                  absent ? "text-dim" : "text-ink",
                )}
              >
                {row.path}
              </span>
              <span className="mt-1 block font-mono text-[10px] break-all text-faint">
                {row.location}
              </span>
            </th>
            <td className="px-4 py-3 align-top">
              <span className="block max-w-[42ch] text-[12.5px] leading-relaxed text-ink/80">
                {row.purpose}
              </span>
              <span className="mt-1 block max-w-[42ch] font-mono text-[10px] leading-relaxed text-faint">
                written by {row.producer}
              </span>
            </td>
            <td className="px-4 py-3 align-top">
              <span className="block max-w-[24ch] font-mono text-[11px] leading-relaxed text-dim">
                {row.used_by}
              </span>
            </td>
            <td
              className={cn(
                CELL,
                "numeric text-right align-top",
                absent ? "text-faint" : "text-ink/80",
              )}
            >
              {row.present_count}
            </td>
            <td
              className={cn(
                CELL,
                "numeric text-right align-top",
                absent ? "text-faint" : "text-ink/80",
              )}
            >
              {formatBytes(row.bytes)}
            </td>
          </tr>
        );
      })}
    </>
  );
}

function ContractsBlock({ payload }: { payload: InstancePayload }) {
  const outputs = payload.project_outputs;
  const rows = outputs.project_contract.length + outputs.workspace_contract.length;
  const present = [...outputs.project_contract, ...outputs.workspace_contract].filter(
    (row) => row.present_count > 0,
  ).length;

  return (
    <Block
      title="Contracts"
      scrolls
      aside={
        <span className="numeric font-mono text-[11px] text-dim tabular-nums">
          {present} of {rows} {plural(rows, "file", "files")} present
        </span>
      }
    >
      <p className="max-w-[78ch] px-5 pt-5 text-[13.5px] leading-[1.65] text-ink/80 sm:px-6">
        The contract is the instance saying what each file it writes is for, who
        writes it, and who reads it. A row with a present count of zero is a
        file the contract declares and nothing has produced yet.
      </p>

      <div className="mt-5">
        <Scroller label="Project and workspace file contracts">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <caption className="sr-only">
              Every file in the project contract and the workspace contract:
              what it is for, who reads it, how many copies exist, and how much
              they hold.
            </caption>
            <thead>
              <tr className="border-y border-hair-soft bg-white/[0.03]">
                <Th>Scope</Th>
                <Th>Path</Th>
                <Th className="w-[36%]">Purpose</Th>
                <Th>Used by</Th>
                <Th align="right">Present</Th>
                <Th align="right">Bytes</Th>
              </tr>
            </thead>
            <tbody>
              <ContractRows scope="project" rows={outputs.project_contract} />
              <ContractRows scope="workspace" rows={outputs.workspace_contract} />
            </tbody>
          </table>
        </Scroller>
      </div>

      <Note>
        Project rows are counted across every discovered project, so a present
        count of {outputs.project_count} means the file exists in all of them.
        Workspace rows are single files at the root, so their count is 1 or 0.
      </Note>
    </Block>
  );
}

/* ------------------------------------------------------------------ *
 * File catalog
 * ------------------------------------------------------------------ */

function CatalogRow({ node, now }: { node: InstanceNode; now: number }) {
  const directory = node.kind === "directory";

  return (
    <tr
      className={cn(
        "border-b border-hair-soft last:border-b-0",
        directory && "bg-white/[0.02]",
      )}
    >
      <th scope="row" className="px-4 py-3 text-left font-normal">
        {/* Depth is a number, so the indent is arithmetic rather than a set of
            hand-written classes for every level the tree might reach. */}
        <span
          className="flex items-center gap-2.5"
          style={{ paddingLeft: `${node.depth * 16}px` }}
        >
          <span
            className={cn(
              "font-mono text-[12px] whitespace-nowrap",
              directory ? "text-dim" : "text-ink",
            )}
          >
            {node.name}
            {directory && "/"}
          </span>
          {node.sensitive && (
            <span className="rounded-full bg-spec-yellow/10 px-2 py-0.5 font-mono text-[9px] tracking-[0.08em] text-spec-yellow uppercase">
              masked
            </span>
          )}
        </span>
      </th>
      <td className={cn(CELL, directory ? "text-faint" : "text-dim")}>
        {directory ? "dir" : "file"}
      </td>
      <td
        className={cn(
          CELL,
          "numeric text-right",
          node.sensitive ? "text-spec-yellow" : directory ? "text-faint" : "text-ink/80",
        )}
      >
        {/* A masked file must never print a size: the API sends 0 because it
            withholds the contents, not because the file is empty. */}
        {node.sensitive ? "masked" : directory ? "·" : formatBytes(node.size_bytes)}
      </td>
      <td className={cn(CELL, "numeric text-right text-dim")}>
        {ago(node.modified_at, now)}
      </td>
      <td className="px-4 py-3 align-top">
        <span className="block max-w-[46ch] text-[12.5px] leading-relaxed text-dim">
          {node.description}
        </span>
      </td>
    </tr>
  );
}

function CatalogBlock({
  payload,
  now,
}: {
  payload: InstancePayload;
  now: number;
}) {
  const masked = payload.tree.filter((node) => node.sensitive).length;

  return (
    <Block
      title="File catalog"
      scrolls
      aside={
        <span className="numeric font-mono text-[11px] text-dim tabular-nums">
          {payload.tree.length} {plural(payload.tree.length, "entry", "entries")}
          {masked > 0 && ` · ${masked} masked`}
        </span>
      }
    >
      <Scroller label="Instance root file tree">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <caption className="sr-only">
            Everything under the instance root, indented by depth, with its
            kind, size, last modification and what the instance says it is for.
          </caption>
          <thead>
            <tr className="border-b border-hair-soft bg-white/[0.03]">
              <Th className="w-[30%]">Entry</Th>
              <Th>Kind</Th>
              <Th align="right">Size</Th>
              <Th align="right">Modified</Th>
              <Th>Description</Th>
            </tr>
          </thead>
          <tbody>
            {payload.tree.map((node) => (
              <CatalogRow key={node.path} node={node} now={now} />
            ))}
          </tbody>
        </table>
      </Scroller>

      <Note>
        {masked > 0 ? (
          <>
            {masked} {plural(masked, "entry is", "entries are")} marked masked.
            The instance reports that{" "}
            {plural(masked, "this file exists", "these files exist")} and
            nothing more: no size, no contents, no value. The API is write-only
            for credentials and there is nothing here to reveal.
          </>
        ) : (
          <>
            Nothing under this root is marked sensitive. Where a credential file
            does appear, the API reports its existence and withholds everything
            else.
          </>
        )}
      </Note>
    </Block>
  );
}

/* ------------------------------------------------------------------ *
 * Totals
 * ------------------------------------------------------------------ */

function TotalsBlock({ payload }: { payload: InstancePayload }) {
  const { totals } = payload;

  return (
    <Block title="Totals">
      <div className="grid grid-cols-2 gap-px bg-white/6 sm:grid-cols-4">
        <Stat label="Files" value={String(totals.files)} />
        <Stat label="Directories" value={String(totals.directories)} />
        <Stat label="Bytes" value={formatBytes(totals.bytes)} />
        <Stat
          label="Listing"
          value={totals.truncated ? "truncated" : "complete"}
          tone={totals.truncated ? "warn" : "ok"}
        />
      </div>
      <Note>
        {totals.truncated ? (
          <>
            The instance stopped walking before it finished, so the counts above
            are a floor and the catalog is a prefix of what is really there.
          </>
        ) : (
          <>
            The whole root fits in {formatBytes(totals.bytes)}. An instance is
            configuration and cursors: it is small because it holds the state of
            the meter, never the work that was measured.
          </>
        )}
      </Note>
    </Block>
  );
}
