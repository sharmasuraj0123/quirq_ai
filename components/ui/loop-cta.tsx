import { ActionLink } from "@/components/ui/primitives";
import { InstallCommand } from "@/components/ui/install-command";
import { OpenIn } from "@/components/ui/open-in";

/**
 * The home page opens and closes on one action: install the environment, then
 * hand the closed-loop setup to whichever agent the visitor already uses.
 */
export function LoopCta() {
  return (
    <div className="flex flex-col items-center">
      <InstallCommand />

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <OpenIn />
        <ActionLink href="/whitepaper" tone="ghost">
          Read the whitepaper
        </ActionLink>
      </div>
    </div>
  );
}
