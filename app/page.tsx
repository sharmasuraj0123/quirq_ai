import { StagePage } from "@/components/stage-page";
import { Hero } from "@/components/beats/hero";
import { BusinessImpact } from "@/components/beats/business-impact";
import { Delivery } from "@/components/beats/delivery";
import { QuirqCollection } from "@/components/beats/quirq-collection";
import { Ecosystem } from "@/components/beats/ecosystem";
import { Onboarding } from "@/components/beats/onboarding";
import { Invite } from "@/components/beats/invite";

export default function Page() {
  return (
    <StagePage>
      <Hero />
      {/* Credibility shelf, straight after the fold. Deliberately not a beat. */}
      <Ecosystem />
      <BusinessImpact />
      <Delivery />
      {/* Also not a beat: the track has exactly five keyframes and the five
          beats above and below already spend them. Onboarding occupies the
          glide between beat 2 and beat 3 without adding a sixth pose. */}
      <Onboarding />
      <QuirqCollection />
      <Invite />
    </StagePage>
  );
}
