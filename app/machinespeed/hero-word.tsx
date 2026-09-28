"use client";

import { useEffect, useState } from "react";
import styles from "./machinespeed.module.css";

/**
 * The changing word in "Run your ___ at machinespeed."
 *
 * Every word is stacked in one grid cell, so the slot always measures the
 * widest word and the headline never reflows as it cycles. Screen readers get
 * the static sentence from the h1's sr-only text; this is decoration. With
 * reduced motion it stays on the first word.
 */

const WORDS = ["business", "sales", "finance", "support", "pipeline", "growth", "ops"];
const HOLD_MS = 2400;

export function HeroWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), HOLD_MS);
    return () => clearInterval(id);
  }, []);

  const prev = (index - 1 + WORDS.length) % WORDS.length;

  return (
    // .w carries the entrance animation and sets display, so the grid sits inside it.
    <span className={styles.w} aria-hidden>
      <span className={styles.rotor}>
        {WORDS.map((word, i) => (
          <span key={word} data-state={i === index ? "in" : i === prev ? "out" : "next"}>
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
