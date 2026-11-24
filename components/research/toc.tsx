"use client";

import { useEffect, useState } from "react";

/**
 * The side table of contents on a research note: one link per h2, the
 * section being read marked. Server-rendered as plain anchor links, so it
 * works with no JavaScript; the client only moves the marker.
 */
export function ArticleToc({
  items,
}: {
  items: { id: string; text: string }[];
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    // The active section is the last heading above a line a third of the way
    // down the viewport: the one whose text is being read, not the next one.
    const update = () => {
      const line = window.innerHeight * 0.33;
      let current: string | null = null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h.id;
        else break;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  return (
    <nav aria-label="On this page" className="paper-toc">
      <p className="paper-toc-title">Contents</p>
      <ol>
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              aria-current={active === it.id ? "location" : undefined}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
