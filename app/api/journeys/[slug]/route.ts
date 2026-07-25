import { promises as fs } from "fs";
import path from "path";
import { researchJourneyBySlug } from "@/lib/research-journey";

const DIR = path.join(process.cwd(), ".quirq", "journeys");

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,64}$/.test(slug)) {
    return new Response("Bad slug.", { status: 400 });
  }
  // Derived journeys win over the folder: they are generated from the note on
  // every request, so they cannot go stale against it, and a leftover file of
  // the same name can never shadow the note it was derived from.
  const derived = researchJourneyBySlug(slug);
  if (derived) return Response.json(derived);

  try {
    const raw = await fs.readFile(path.join(DIR, `${slug}.json`), "utf8");
    return new Response(raw, {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response("No such journey in .quirq.", { status: 404 });
  }
}
