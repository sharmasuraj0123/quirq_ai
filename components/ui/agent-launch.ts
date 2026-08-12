/**
 * One-click handoffs into coding agents.
 *
 * URL schemes match what the product docs and the site's OpenIn menu already
 * ship: Claude Code and Cursor accept https web links that prefill the
 * composer; Codex and OpenCode use their desktop protocol handlers. Nothing
 * auto-runs — every target only prefills a prompt.
 */

/** Install-oriented brief for the home "OR LAUNCH FROM" tiles. */
export const INSTALL_AGENT_PROMPT = [
  "Install quirq on this machine.",
  "Run: curl -fsSL quirq.ai/install | sh",
  "Then read https://quirq.ai/llm.txt and walk me through the first agentic environment launch from what the installer put in place.",
].join("\n");

const Q = encodeURIComponent(INSTALL_AGENT_PROMPT);

export type AgentLaunchTarget = {
  id: "claude-code" | "codex" | "cursor" | "opencode";
  name: string;
  /** Short note for tooltips / secondary labels. */
  note: string;
  href: string;
  /** True for custom schemes that need the desktop app installed. */
  needsApp: boolean;
};

/**
 * The four agents shown under "OR LAUNCH FROM". Order is the product set the
 * page names: Claude Code, Codex, Cursor, OpenCode.
 */
export const INSTALL_LAUNCH_TARGETS: readonly AgentLaunchTarget[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    note: "claude.ai/code",
    href: `https://claude.ai/code/new?q=${Q}`,
    needsApp: false,
  },
  {
    id: "codex",
    name: "Codex",
    note: "needs the app",
    href: `codex://new?prompt=${Q}`,
    needsApp: true,
  },
  {
    id: "cursor",
    name: "Cursor",
    note: "cursor.com/link",
    href: `https://cursor.com/link/prompt?text=${Q}`,
    needsApp: false,
  },
  {
    id: "opencode",
    name: "OpenCode",
    note: "needs the app",
    // Desktop handler: prefill only. Directory is optional on newer builds;
    // older builds ignore prompt-only links, so the note still says "app".
    href: `opencode://new-session?prompt=${Q}`,
    needsApp: true,
  },
];
