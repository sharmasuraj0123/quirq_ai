/**
 * Placeholder installer behind `curl -fsSL quirq.ai/install | sh`.
 *
 * It deliberately performs no installation yet. Keeping the response as a
 * valid, side-effect-free POSIX shell script lets the public command work now
 * while leaving one obvious constant to replace with the real installer.
 */
export const dynamic = "force-static";

const INSTALL_SCRIPT = String.raw`#!/bin/sh
# quirq placeholder installer
set -eu

cat <<'QUIRQ_BANNER'
   ____   _   _   ___   ____    ____
  / __ \ | | | | |_ _| |  _ \  / __ \
 | |  | || | | |  | |  | |_) || |  | |
 | |__| || |_| |  | |  |  _ < | |__| |
  \___\_\ \___/  |___| |_| \_\ \___\_\
QUIRQ_BANNER

printf '\n'
printf '%s\n' 'quirq installer placeholder'
printf '%s\n' 'The install endpoint is live. No files were changed.'
printf '%s\n' 'The real installer will replace this placeholder soon.'
`;

export function GET() {
  return new Response(INSTALL_SCRIPT, {
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Content-Disposition": 'inline; filename="quirq-install.sh"',
      "Cache-Control": "public, max-age=300, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
