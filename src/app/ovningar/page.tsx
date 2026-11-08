import StepTypeList from "@/components/StepTypeList";
import { PageHeader } from "@/components/ui";

export default function Exercises() {
  return (
    <div>
      <PageHeader
        icon="ovning"
        title="Matematikövningar" intro="Inget rätt eller fel här, bara testa."
      />
      <StepTypeList type="ovning" />
    </div>
  );
}
