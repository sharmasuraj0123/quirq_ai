/**
 * Bootstrapper behind `curl -fsSL quirq.ai/install | sh`.
 *
 * It fetches xo-space's install.sh and runs it, and does nothing else. The
 * installer owns the checkout, the Python environment, the configuration and
 * the server; duplicating any of that here would put the same logic on two
 * release cycles, where the copy served by this site can silently fall behind
 * the copy in the repository.
 *
 * The one-liner is advertised with `| sh`, so this script stays POSIX. The
 * installer needs Bash — it uses BASH_SOURCE and `set -o pipefail` — so it is
 * handed to `bash` explicitly rather than inherited into `sh`.
 *
 * The route is dynamic so the handler runs on every request: each fetch of the
 * install one-liner is counted in PostHog. Counting is fail-open — a missing
 * key, a network error, or a slow PostHog never delays or breaks the install,
 * because serving the script is the job and the metric is not. `no-store` stops
 * any cache from answering a fetch without the handler running, which would
 * silently undercount.
 */
import { PostHog } from "posthog-node";

export const dynamic = "force-dynamic";

export const INSTALL_SCRIPT =
  [
    "#!/bin/sh",
    "# Download the xo-space installer, then run it. Everything the install",
    "# actually does lives in that script, not in this one.",
    "set -eu",
    "",
    "# Serves the installer from one branch and tells the installer to clone the",
    "# same one, so QUIRQ_SOURCE_REF=development moves the whole install together.",
    'REF="${QUIRQ_SOURCE_REF:-main}"',
    'INSTALL_URL="https://raw.githubusercontent.com/quirq-ai/xo-space/${REF}/install.sh"',
    "",
    "fail() {",
    "  printf '\\nquirq: %s\\n' \"$*\" >&2",
    "  exit 1",
    "}",
    "",
    "require_command() {",
    '  command -v "$1" >/dev/null 2>&1 || fail "$2"',
    "}",
    "",
    "cat <<'QUIRQ_BANNER'",
    "             _",
    "  __ _ _   _(_)_ __ __ _",
    " / _` | | | | | '__/ _` |",
    "| (_| | |_| | | | | (_| |",
    " \\__, |\\__,_|_|_|  \\__, |",
    "    |_|               |_|",
    "QUIRQ_BANNER",
    "",
    'require_command curl "curl is required to download the Quirq installer."',
    'require_command bash "Bash is required to run the Quirq installer."',
    "",
    "# Written to a file rather than piped straight into bash. A transfer that",
    "# drops halfway would otherwise hand bash a truncated script and it would",
    "# run what arrived, and this leaves the terminal on the installer's stdin.",
    'TMP="$(mktemp "${TMPDIR:-/tmp}/quirq-install.XXXXXX")" ||',
    '  fail "Could not create a temporary file."',
    "trap 'rm -f \"$TMP\"' EXIT INT TERM",
    "",
    "printf '\\nFetching the Quirq installer (%s)...\\n' \"$REF\"",
    'curl -fsSL "$INSTALL_URL" -o "$TMP" ||',
    '  fail "Could not download $INSTALL_URL"',
    '[ -s "$TMP" ] || fail "The downloaded installer is empty."',
    "",
    "# The installer reads this too, so the branch that served it is the branch",
    "# it goes on to clone.",
    'export QUIRQ_SOURCE_REF="$REF"',
    "",
    "# Not exec: the trap above still has a temporary file to remove afterwards.",
    'bash "$TMP"',
  ].join("\n") + "\n";

// One client per warm runtime. `captureImmediate` sends the event synchronously,
// so there is no background flush timer to miss and no `shutdown()` to call
// between requests — the singleton is reused across warm invocations.
let posthog: PostHog | null = null;

function client(): PostHog | null {
  const key = process.env.POSTHOG_KEY;
  if (!key) return null;
  if (!posthog) {
    posthog = new PostHog(key, {
      host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
    });
  }
  return posthog;
}

async function countInstall(userAgent: string | null): Promise<void> {
  const ph = client();
  if (!ph) return;
  try {
    await ph.captureImmediate({
      distinctId: "installer",
      event: "install_script_fetched",
      properties: {
        // The tool that fetched it — `curl/*` for a real `| sh` run, a browser
        // UA for someone reading it, a crawler UA for a bot. Filter on this in
        // PostHog to separate installs from reads.
        user_agent: userAgent ?? "unknown",
        // An anonymous count: no per-event person profile, and no geolocation
        // from the (meaningless) server IP.
        $process_person_profile: false,
      },
      disableGeoip: true,
    });
  } catch {
    // Fail open: analytics must never break the installer.
  }
}

export async function GET(request: Request) {
  // Bounded so a slow or hung PostHog cannot stall the install. The script is
  // served either way; a dropped count is preferable to a delayed install.
  await Promise.race([
    countInstall(request.headers.get("user-agent")),
    new Promise<void>((resolve) => setTimeout(resolve, 1500)),
  ]);

  return new Response(INSTALL_SCRIPT, {
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Content-Disposition": 'inline; filename="quirq-install.sh"',
      // Every fetch must reach this handler to be counted; a cached copy would
      // be served without running it.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
