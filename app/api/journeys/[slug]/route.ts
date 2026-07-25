import { promises as fs } from "fs";
import path from "path";

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
  try {
    const raw = await fs.readFile(path.join(DIR, `${slug}.json`), "utf8");
    return new Response(raw, {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response("No such journey in .quirq.", { status: 404 });
  }
}
