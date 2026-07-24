import Stage from "@/components/stage/stage";
import ScrollRuntime from "@/components/scroll-runtime";
import { Nav } from "@/components/ui/nav";
import { Hero } from "@/components/beats/hero";
import { Consumption } from "@/components/beats/consumption";
import { Delivery } from "@/components/beats/delivery";
import { Ledger } from "@/components/beats/ledger";
import { Ecosystem } from "@/components/beats/ecosystem";
import { Invite } from "@/components/beats/invite";

export default function Page() {
  return (
    <>
      <ScrollRuntime />

      {/* One continuous shot: the glass form lives behind every beat and is
          re-staged by scroll rather than swapped out between sections. */}
      <Stage />
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />

      <Nav />

      <main className="relative z-10">
        <Hero />
        {/* Credibility shelf, straight after the fold. Deliberately not a beat. */}
        <Ecosystem />
        <Consumption />
        <Delivery />
        <Ledger />
        <Invite />
      </main>
    </>
  );
}
