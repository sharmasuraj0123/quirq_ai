"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { PICKS } from "./content";
import styles from "./machinespeed.module.css";

/**
 * The optional intake card beside the closing section. Booking the call is
 * the main action; this is for people who would rather write first. It opens
 * collapsed and expands on request.
 *
 * Submissions go to the "MachineSpeed leads" Google Sheet (machinespeed@quirq.ai)
 * through an Apps Script web app; source in machinespeed-int/leads/apps-script.gs.
 * The script adds a row to the "Website" tab and emails the team. The post is
 * fire-and-forget (no-cors), so the confirmation shows either way.
 */
const LEADS_URL = "https://script.google.com/macros/s/AKfycbxk13GLnwhXmbNraomlLWEPHHaUHwA9tHmgRIC-Itw33lMjwKSrAEKXxi9Zm86uBL-8/exec";
export function Intake() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [warn, setWarn] = useState(false);
  const [sent, setSent] = useState(false);
  const email = useRef<HTMLInputElement>(null);

  const choose = (label: string) => setPick(pick === label ? null : label);

  const DEFAULT_EXAMPLE =
    "e.g. Three people re-key orders between Shopify and NetSuite every morning, and our Zapier fix keeps breaking";
  const example = PICKS.find((p) => p.label === pick)?.example || DEFAULT_EXAMPLE;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const field = email.current;
    if (!field?.value || !field.checkValidity()) {
      setWarn(true);
      field?.focus();
      return;
    }
    const form = new FormData(event.currentTarget);
    const data = new URLSearchParams({
      source: "website",
      email: field.value.trim(),
      pick: pick ?? "",
      q1: String(form.get("about") ?? ""),
      q2: String(form.get("tools") ?? ""),
      q3: String(form.get("team") ?? ""),
      company_url: String(form.get("company_url") ?? ""),
      page: window.location.href,
    });
    if (LEADS_URL.startsWith("https:")) {
      fetch(LEADS_URL, { method: "POST", mode: "no-cors", body: data }).catch(() => {});
    }
    setSent(true);
  };

  if (!open) {
    return (
      <div className={`${styles.intake} ${styles.intakeClosed}`}>
        <span className={styles.k}>Optional</span>
        <h3>Prefer to write first?</h3>
        <p>
          Tell us about the workflow in a few lines and we&rsquo;ll come to the call already knowing it. You won&rsquo;t
          repeat any of it.
        </p>
        <button className={`${styles.btn} ${styles.btnGhost}`} type="button" onClick={() => setOpen(true)} aria-expanded={false} aria-controls={`${id}-form`}>
          Tell us about your workflow
        </button>
      </div>
    );
  }

  return (
    <form className={styles.intake} id={`${id}-form`} noValidate onSubmit={submit}>
      {sent ? (
        <div className={styles.sent} role="status">
          <b>✓ Got it</b>
          <p>We&rsquo;ll read it before the call. Book a time above, or we&rsquo;ll reply within one business day to set one up.</p>
        </div>
      ) : (
        <div className={styles.intakeFields}>
          <div className={styles.intakeH}>
            <h3>What kind of business are you?</h3>
            <span className={styles.k}>Pick one · optional</span>
          </div>
          <div className={styles.picks} role="group" aria-label="Your kind of business">
            {PICKS.map((p) => (
              <button key={p.label} type="button" aria-pressed={pick === p.label} onClick={() => choose(p.label)}>
                {p.label}
              </button>
            ))}
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-about`}>Which workflow would you bring? A sentence or two is enough</label>
            <textarea id={`${id}-about`} name="about" rows={3} placeholder={example} />
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-tools`}>Tools it touches today</label>
            <input id={`${id}-tools`} name="tools" type="text" placeholder="A quick list is enough" />
          </div>
          <div className={styles.two}>
            <div className={styles.field}>
              <label htmlFor={`${id}-team`}>Team size</label>
              <input id={`${id}-team`} name="team" type="text" inputMode="numeric" placeholder="Roughly" />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${id}-email`}>Work email</label>
              <input ref={email} id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder="you@company.com" />
            </div>
          </div>
          {/* Honeypot: hidden from people, filled in by bots; the sheet script drops those. */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor={`${id}-company-url`}>Leave this empty</label>
            <input id={`${id}-company-url`} name="company_url" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit">
            Send it ahead of the call <span className={styles.arr} aria-hidden>→</span>
          </button>
          <p className={`${styles.intakeFoot}${warn ? ` ${styles.intakeWarn}` : ""}`} aria-live="polite">
            {warn ? "Add a work email so we can reply." : "Optional. We reply within one business day. No sequence, no SDR."}
          </p>
        </div>
      )}
    </form>
  );
}
