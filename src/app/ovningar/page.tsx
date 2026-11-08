import StepTypeList from "@/components/StepTypeList";
import { PageHeader } from "@/components/ui";

export default function Exercises() {
  return (
    <div>
      <PageHeader
        icon="ovning"
        title="Matematikövningar"
        intro="Övningar att göra efter varje kapitel. Här finns inget rätt eller fel, det viktiga är att du provar, ritar och skriver hur du tänker."
      />
      <StepTypeList type="ovning" />
    </div>
  );
}
