import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * The typeset paper, served at /whitepaper/pdf.
 *
 * The file sits next to this route rather than in public/ so the URL is the
 * canonical one everywhere (nav, footer, both calls to action) and the bare
 * asset path is not a second address for the same document. Read from disk
 * at request time and cached: a route handler is the only way to serve a
 * static file from outside public/.
 */
export const dynamic = "force-static";

export async function GET() {
  const pdf = await readFile(
    path.join(process.cwd(), "app/whitepaper/pdf/quirq-whitepaper.pdf"),
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // inline: opens in the browser's viewer, with the real filename kept
      // for whoever hits download.
      "Content-Disposition": 'inline; filename="quirq-whitepaper.pdf"',
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
