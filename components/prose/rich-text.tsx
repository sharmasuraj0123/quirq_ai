import katex from "katex";

/**
 * Prose text with LaTeX in it, rendered on the server.
 *
 * Delimiters, in the order they are tried:
 *   $$ … $$  and  \[ … \]   display math, on its own centred line
 *   \( … \)                 inline math
 *   $ … $                   inline math, pandoc's rule: the opening $ is not
 *                           followed by a space or a digit, and the closing $
 *                           is not preceded by a space nor followed by a
 *                           digit. That keeps "$34.04 instead of $69.57" as
 *                           money, which the notes are full of.
 *   \$                      a literal dollar sign
 *
 * KaTeX runs here, at render time, so a reader downloads HTML and one CSS
 * file, never the typesetter. A formula KaTeX cannot parse renders as its
 * source in red rather than taking the page down with it.
 *
 * Server-safe and hook-free, like the rest of components/prose.
 */

type Piece =
  | { kind: "text"; text: string }
  | { kind: "math"; tex: string; display: boolean };

const PATTERN =
  /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\\\$|\$(?![\s\d$])((?:\\.|[^$\\])+?)(?<!\s)\$(?!\d)/g;

export function splitMath(text: string): Piece[] {
  const pieces: Piece[] = [];
  let at = 0;
  let pending = "";
  for (const match of text.matchAll(PATTERN)) {
    pending += text.slice(at, match.index);
    at = match.index! + match[0].length;
    if (match[0] === "\\$") {
      pending += "$";
      continue;
    }
    if (pending) pieces.push({ kind: "text", text: pending });
    pending = "";
    const display = match[1] ?? match[2];
    pieces.push(
      display !== undefined
        ? { kind: "math", tex: display.trim(), display: true }
        : { kind: "math", tex: (match[3] ?? match[4]).trim(), display: false },
    );
  }
  pending += text.slice(at);
  if (pending) pieces.push({ kind: "text", text: pending });
  return pieces;
}

/** True when a string carries any math, so plain text skips the work. */
export const hasMath = (text: string) =>
  text.includes("$") || text.includes("\\(") || text.includes("\\[");

export function texToHtml(tex: string, display: boolean) {
  return katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    output: "htmlAndMathml",
    strict: "ignore",
  });
}

/** One formula. Display math is a block: it gets its own scrollable line. */
export function Formula({
  tex,
  display = false,
}: {
  tex: string;
  display?: boolean;
}) {
  const html = texToHtml(tex, display);
  return display ? (
    <span
      className="math-display"
      tabIndex={0}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

/** A run of prose with its math typeset. */
export function RichText({ text }: { text: string }) {
  if (!hasMath(text)) return <>{text}</>;
  return (
    <>
      {splitMath(text).map((piece, i) =>
        piece.kind === "text" ? (
          piece.text
        ) : (
          <Formula key={i} tex={piece.tex} display={piece.display} />
        ),
      )}
    </>
  );
}
