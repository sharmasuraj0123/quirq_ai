import { promises as fs } from "fs";

/**
 * Shared guards for the .quirq write routes. Both writers are development
 * only; these keep even the dev server honest.
 */

/** True when the request carries an Origin that is not this server: a page
 *  the developer did not open should never write into the working tree. */
export function crossOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.headers.get("host");
  } catch {
    return true;
  }
}

/** Write via a temp file and rename, so a concurrent read never sees a
 *  half-written journey. */
export async function writeAtomic(file: string, data: string) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}
