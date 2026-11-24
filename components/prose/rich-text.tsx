import type React from "react";
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
  /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\\\$|\$(?![\s$])((?:\\.|[^$\\])+?)(?<!\s)\$(?!\d)/g;

/**
 * Pandoc also refuses a digit after the opening $, which would lose "$1\times$".
 * Instead a candidate that opens on a digit counts as math when it reads as
 * TeX (a command, script, operator or bracket) or holds no words; a run of
 * words between two dollar signs is money.
 */
const looksLikeTex = (tex: string) =>
  /[\\^_=+/|()]/.test(tex) || !/[a-z]{2,}/i.test(tex);

export function splitMath(text: string): Piece[] {
  const pieces: Piece[] = [];
  let at = 0;
  let pending = "";
  const re = new RegExp(PATTERN.source, "g");
  for (let match = re.exec(text); match; match = re.exec(text)) {
    pending += text.slice(at, match.index);
    at = match.index + match[0].length;
    if (
      match[4] !== undefined &&
      /^\d/.test(match[4]) &&
      !looksLikeTex(match[4])
    ) {
      // "$5 … $" that is not TeX: leave the first $ as text and rescan after it.
      pending += "$";
      at = match.index + 1;
      re.lastIndex = at;
      continue;
    }
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

/**
 * Inline markup, after math is set aside: **bold**, *italic* (the paper
 * sources' rule: not touching a word character or another asterisk) and
 * `code`. Math pieces ride through as opaque placeholders, so a bold run may
 * contain a formula.
 */
const MARKUP =
  /\*\*(.+?)\*\*|(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])|`([^`]+)`/;

function renderMarkup(
  text: string,
  math: Extract<Piece, { kind: "math" }>[],
  key: string,
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let rest = text;
  let n = 0;
  const plain = (t: string) => {
    // \u0000<index>\u0000 is a math placeholder.
    t.split(/\u0000(\d+)\u0000/).forEach((part, i) => {
      if (i % 2 === 0) {
        // A table cell may carry a line break as <br>, as the paper's do.
        part.split(/<br\s*\/?>/).forEach((line, j) => {
          if (j > 0) out.push(<br key={`${key}b${i}-${j}`} />);
          if (line) out.push(line);
        });
      } else {
        const m = math[Number(part)];
        out.push(
          <Formula key={`${key}m${part}`} tex={m.tex} display={m.display} />,
        );
      }
    });
  };
  for (;;) {
    const m = rest.match(MARKUP);
    if (!m || m.index === undefined) {
      plain(rest);
      return out;
    }
    plain(rest.slice(0, m.index));
    const k = `${key}-${n++}`;
    if (m[1] !== undefined)
      out.push(<strong key={k}>{renderMarkup(m[1], math, k)}</strong>);
    else if (m[2] !== undefined)
      out.push(<em key={k}>{renderMarkup(m[2], math, k)}</em>);
    else out.push(<code key={k}>{m[3]}</code>);
    rest = rest.slice(m.index + m[0].length);
  }
}

const hasMarkup = (text: string) =>
  text.includes("*") || text.includes("`") || text.includes("<br");

/** A run of prose with its math typeset and its inline markup applied. */
export function RichText({ text }: { text: string }) {
  if (!hasMath(text) && !hasMarkup(text)) return <>{text}</>;
  const pieces = hasMath(text)
    ? splitMath(text)
    : [{ kind: "text" as const, text }];
  const math: Extract<Piece, { kind: "math" }>[] = [];
  const joined = pieces
    .map((piece) => {
      if (piece.kind === "text") return piece.text.replace(/\u0000/g, "");
      math.push(piece);
      return `\u0000${math.length - 1}\u0000`;
    })
    .join("");
  return <>{renderMarkup(joined, math, "r")}</>;
}

/** Heading text for places that cannot typeset: math reduced to plain text. */
export function plainText(text: string) {
  return text
    .replace(/\$([^$]+)\$/g, (_, tex: string) =>
      tex
        .replace(/\\Phi/g, "Φ")
        .replace(/\\(text|mathrm|operatorname)\{([^}]*)\}/g, "$2")
        .replace(/[_^]\{([^}]*)\}/g, "$1")
        .replace(/[_^{}\\]/g, "")
        .replace(/\(a,s\)/g, "(a,s)"),
    )
    .replace(/\*\*|`/g, "");
}
