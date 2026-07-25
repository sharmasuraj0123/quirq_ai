import { StagePage } from "@/components/stage-page";
import { Hero } from "@/components/beats/hero";
import { Consumption } from "@/components/beats/consumption";
import { Delivery } from "@/components/beats/delivery";
import { Ledger } from "@/components/beats/ledger";
import { Ecosystem } from "@/components/beats/ecosystem";
import { Calculator } from "@/components/beats/calculator";
import { Invite } from "@/components/beats/invite";

export default function Page() {
  return (
    <StagePage>
      <Hero />
      {/* Credibility shelf, straight after the fold. Deliberately not a beat. */}
      <Ecosystem />
      <Consumption />
      <Delivery />
      {/* Also not a beat: the track has exactly five keyframes and the five
          beats above and below already spend them. The calculator occupies
          scroll between beat 2 and beat 3 while the glass keeps gliding. */}
      <Calculator />
      <Ledger />
      <Invite />
    </StagePage>
  );
}
