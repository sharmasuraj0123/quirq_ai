"use client";

import { useEffect, useRef, useState } from "react";
import { INSTALL_COMMAND } from "@/components/ui/install-command";
import styles from "./frame-one-home-responsive.module.css";

/**
 * The copy control for the home page's install command.
 *
 * Rides inside the command pill at its right end, beside the command text. It
 * is deliberately a small island: `frame-one-home` is a server component, and
 * only this button needs clipboard + state, so the client boundary stops here.
 * The `.copy-command` class keeps it hidden under the site's no-JS fallback
 * (see app/layout.tsx), where the command remains selectable text.
 */
export function CopyCommand() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } catch {
      // Denied, or no clipboard outside a secure context. The command is
      // selectable text either way, so there is nothing to fall back to.
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy the install command"
      className={`copy-command ${styles.installCopyBtn} ${
        copied ? styles.installCopyBtnDone : ""
      }`}
    >
      {copied ? "Copied" : "Copy"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Install command copied to clipboard" : ""}
      </span>
    </button>
  );
}
