/**
 * The shape of a machine-local quirq instance, as XO Space reports it at
 * /api/quirq, plus the client that reaches one.
 *
 * These types are transcribed from a live payload rather than guessed. The
 * instance is a different thing from a ledger: it describes the environment
 * that would do the metering (where its root is, whether the watcher is
 * running, what it can see) rather than any settled work. The dashboard shows
 * them side by side and must not conflate them.
 */

export type InstanceRoot = {
  container_path: string;
  host_path: string;
  exists: boolean;
  readable: boolean;
  writable: boolean;
};

export type InstanceTotals = {
  files: number;
  directories: number;
  bytes: number;
  truncated: boolean;
};

export type InstanceNode = {
  path: string;
  name: string;
  depth: number;
  kind: "file" | "directory";
  size_bytes: number;
  modified_at: string;
  /** Credentials. The API masks the values; never try to render one. */
  sensitive: boolean;
  description: string;
};

export type ProjectActivity = {
  project_id: string;
  open_sessions: number;
  runtimes: string[];
  updated_at: string;
};

export type InstanceActivity = {
  workspace_open_sessions: number;
  workspace_updated_at: string;
  projects: ProjectActivity[];
};

export type WatcherState = {
  enabled: boolean;
  interval_seconds: number;
  source_mode: string;
  configured_enabled: boolean;
  tracked_files: number;
  offsets_present: boolean;
};

export type RuntimeState = {
  agent_name: string;
  watcher_enabled: boolean;
  watcher_interval_seconds: number;
  watcher_source_mode: string;
};

export type InstallState = {
  present: boolean;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
};

export type ProjectOutput = {
  project_id: string;
  container_path: string;
  host_path: string;
  watcher_files: string[];
  watcher_file_count: number;
  bytes: number;
  updated_at: string;
  legacy_activity_file: boolean;
};

export type ContractRow = {
  path: string;
  producer: string;
  purpose: string;
  used_by: string;
  location: string;
  present_count: number;
  bytes: number;
  /** Null for contract files that exist but have never been written. */
  updated_at: string | null;
};

export type ProjectOutputs = {
  root: Omit<InstanceRoot, "writable">;
  project_count: number;
  projects: ProjectOutput[];
  project_contract: ContractRow[];
  workspace_contract: ContractRow[];
  legacy_activity_files: number;
  legacy_activity_note: string;
};

export type InstancePayload = {
  generated_at: string;
  root: InstanceRoot;
  totals: InstanceTotals;
  tree: InstanceNode[];
  activity: InstanceActivity;
  watcher: WatcherState;
  runtime: RuntimeState;
  credentials: unknown[];
  install_state: InstallState;
  root_change_required: boolean;
  project_outputs: ProjectOutputs;
};

export type Connection =
  | { state: "idle" }
  | { state: "connecting"; endpoint: string }
  | {
      state: "connected";
      endpoint: string;
      latencyMs: number;
      fetchedAt: string;
      payload: InstancePayload;
    }
  | { state: "failed"; endpoint: string; reason: string };

export const DEFAULT_ENDPOINT = "http://localhost:5003";
export const INSTANCE_ENDPOINT_STORAGE_KEY = "quirq.instance.endpoint";
/** One-shot: onboarding sets it, the dashboard consumes and removes it. */
export const INSTANCE_RECONNECT_STORAGE_KEY = "quirq.instance.reconnect";

/**
 * Ask the same-origin proxy to reach an instance.
 *
 * The proxy exists because Space sends no CORS header; see app/api/instance.
 * Everything this returns is either a payload or a reason, never a silent
 * empty state, because "is it connected" is the question the panel answers.
 */
export async function probeInstance(endpoint: string): Promise<Connection> {
  const trimmed = endpoint.trim() || DEFAULT_ENDPOINT;

  try {
    const response = await fetch(
      `/api/instance?endpoint=${encodeURIComponent(trimmed)}`,
      { cache: "no-store" },
    );
    const body = (await response.json()) as
      | { ok: true; endpoint: string; latencyMs: number; payload: InstancePayload }
      | { ok: false; reason: string };

    if (!body.ok) return { state: "failed", endpoint: trimmed, reason: body.reason };

    return {
      state: "connected",
      endpoint: body.endpoint,
      latencyMs: body.latencyMs,
      fetchedAt: new Date().toISOString(),
      payload: body.payload,
    };
  } catch (error) {
    return {
      state: "failed",
      endpoint: trimmed,
      reason:
        error instanceof Error
          ? `The proxy route did not answer: ${error.message}`
          : "The proxy route did not answer.",
    };
  }
}

/* ------------------------------------------------------------------ *
 * Derivations the dashboard needs, kept out of the components
 * ------------------------------------------------------------------ */

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Seconds since a timestamp, for a "last seen" that does not lie by rounding. */
export function secondsSince(iso: string, now = Date.now()): number | null {
  const then = Date.parse(iso);
  return Number.isNaN(then) ? null : Math.max(0, Math.round((now - then) / 1000));
}

export function formatAgo(iso: string | null | undefined, now = Date.now()): string {
  // Several instance timestamps are genuinely null (a contract file that
  // exists but has never been written), so this has to absorb that rather
  // than render "NaN ago".
  if (!iso) return "unknown";
  const seconds = secondsSince(iso, now);
  if (seconds === null) return "unknown";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}

export type HealthCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
  /** A warning is a fact worth surfacing that is not a failure. */
  severity: "ok" | "warn" | "fail";
};

/**
 * The status readout, derived rather than reported.
 *
 * The instance does not send a "healthy" flag and should not: health is a
 * judgement about the facts, and the facts are the root's permissions, the
 * watcher's state, and whether onboarding ever finished.
 */
export function healthOf(payload: InstancePayload): HealthCheck[] {
  const { root, watcher, install_state, project_outputs, root_change_required } = payload;

  const checks: HealthCheck[] = [
    {
      id: "root",
      label: "Root directory",
      ok: root.exists && root.readable,
      severity: root.exists && root.readable ? "ok" : "fail",
      detail: root.exists
        ? `${root.host_path} · ${root.readable ? "readable" : "unreadable"}, ${root.writable ? "writable" : "read only"}`
        : `${root.host_path} does not exist`,
    },
    {
      id: "writable",
      label: "Can record",
      ok: root.writable,
      severity: root.writable ? "ok" : "fail",
      detail: root.writable
        ? "The environment can append to its own ledger"
        : "Read only: nothing can be minted here",
    },
    {
      id: "watcher",
      label: "Watcher",
      ok: watcher.enabled,
      severity: watcher.enabled ? "ok" : "warn",
      detail: watcher.enabled
        ? `Running every ${watcher.interval_seconds}s over ${watcher.source_mode} sources`
        : watcher.configured_enabled
          ? "Configured on but not currently running"
          : "Disabled: nothing is being observed",
    },
    {
      id: "onboarding",
      label: "Onboarding",
      ok: install_state.onboarding_completed,
      severity: install_state.onboarding_completed ? "ok" : "warn",
      detail: install_state.present
        ? install_state.onboarding_completed
          ? `Completed ${install_state.onboarding_completed_at ? formatAgo(install_state.onboarding_completed_at) : ""}`.trim()
          : "Started but never completed"
        : "No install state recorded",
    },
    {
      id: "projects",
      label: "Projects discovered",
      ok: project_outputs.project_count > 0,
      severity: project_outputs.project_count > 0 ? "ok" : "warn",
      detail: `${project_outputs.project_count} project${project_outputs.project_count === 1 ? "" : "s"} reporting`,
    },
  ];

  if (root_change_required) {
    checks.push({
      id: "root-change",
      label: "Root change required",
      ok: false,
      severity: "warn",
      detail: "The instance is asking to be re-rooted before it can proceed",
    });
  }

  if (project_outputs.legacy_activity_files > 0) {
    checks.push({
      id: "legacy",
      label: "Legacy activity files",
      ok: true,
      severity: "warn",
      detail: `${project_outputs.legacy_activity_files} project${project_outputs.legacy_activity_files === 1 ? "" : "s"} still writing the old activity file`,
    });
  }

  return checks;
}
