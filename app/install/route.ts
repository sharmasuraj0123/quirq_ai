import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * The installer behind `curl -fsSL quirq.ai/install | sh`.
 *
 * The landing page tells people to pipe this to a shell, so it has to be
 * real: it embeds the actual CLI sources (read at build time, same technique
 * as the whitepaper PDF route) rather than pointing at a package that does
 * not exist yet. One request, no tarball, no registry.
 *
 * Deliberate restraint, because piping to a shell is a lot of trust to ask:
 * it writes only under ~/.quirq, it never edits a shell rc file, and it
 * prints the PATH line for the reader to add themselves.
 */
export const dynamic = "force-static";

const MODULES = ["engine.mjs", "ledger.mjs", "snapshot.mjs", "cli.mjs"];

/** A quoted heredoc, so nothing inside the JS is expanded by the shell. */
function heredoc(target: string, body: string) {
  return `cat > "${target}" <<'QUIRQ_MODULE_EOF'\n${body}\nQUIRQ_MODULE_EOF`;
}

export async function GET() {
  const sources = await Promise.all(
    MODULES.map(async (name) => ({
      name,
      body: await readFile(path.join(process.cwd(), "lib/quirq", name), "utf8"),
    })),
  );

  const script = `#!/bin/sh
# quirq installer — the output meter for agentic work.
# Installs a dependency-free CLI into ~/.quirq. Nothing else is touched.
set -eu

PREFIX="\${QUIRQ_HOME:-$HOME/.quirq}"
LIB="$PREFIX/lib"
BIN="$PREFIX/bin"

if ! command -v node >/dev/null 2>&1; then
  echo "quirq: node is required (18 or newer). install node, then re-run." >&2
  exit 1
fi

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "quirq: node 18 or newer is required (found $(node -v))." >&2
  exit 1
fi

mkdir -p "$LIB" "$BIN"

${sources.map((s) => heredoc(`$LIB/${s.name}`, s.body)).join("\n\n")}

cat > "$BIN/quirq" <<'QUIRQ_BIN_EOF'
#!/bin/sh
exec node "$(dirname "$0")/../lib/cli.mjs" "$@"
QUIRQ_BIN_EOF
chmod +x "$BIN/quirq"

echo ""
echo "  quirq installed to $PREFIX"
echo ""
echo "  add it to your PATH:"
echo "    export PATH=\\"$BIN:\\$PATH\\""
echo ""
echo "  then meter something:"
echo "    quirq demo"
echo ""
`;

  return new Response(script, {
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Cache-Control": "public, max-age=300, must-revalidate",
    },
  });
}
