import type { Metadata } from "next";
import { StagePage } from "@/components/stage-page";
import { SiteFooter } from "@/components/ui/footer";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "A working quirq ledger: 34 settled units from one real CLI run, every metric recomputed in your browser from the raw records, and the hash chain re-verified link by link.",
};

/**
 * The first stage page whose beats are driven by state rather than by copy.
 * The five sections live inside <Dashboard/> because one ledger selection, one
 * filter and one verification feed all of them; splitting them into siblings
 * would mean lifting that state into this server component, which cannot hold
 * it.
 */
export default function DashboardPage() {
  return (
    <StagePage>
      <Dashboard />

      {/* The form is at its largest under the last beat, so the footer needs
          a base to sit on rather than floating over the glass. */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64 bg-linear-to-t from-black via-black/85 to-transparent"
        />
        <SiteFooter />
      </div>
    </StagePage>
  );
}
