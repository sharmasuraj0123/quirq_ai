"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "./content";
import styles from "./machinespeed.module.css";

/** In-page section links; highlights the section crossing the middle of the viewport. */
export function SectionLinks() {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setCurrent(en.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav className={styles.navLinks} aria-label="MachineSpeed sections">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={current === s.id ? styles.on : undefined} aria-current={current === s.id ? "location" : undefined}>
          {s.label}
        </a>
      ))}
    </nav>
  );
}
