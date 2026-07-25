import { StagePage } from "@/components/stage-page";
import { Hero } from "@/components/beats/hero";
import { Consumption } from "@/components/beats/consumption";
import { Delivery } from "@/components/beats/delivery";
import { Ledger } from "@/components/beats/ledger";
import { Ecosystem } from "@/components/beats/ecosystem";
import { Invite } from "@/components/beats/invite";

export default function Page() {
  return (
    <StagePage>
      <Hero />
      {/* Credibility shelf, straight after the fold. Deliberately not a beat. */}
      <Ecosystem />
      <Consumption />
      <Delivery />
      <Ledger />
      <Invite />
    </StagePage>
  );
}
