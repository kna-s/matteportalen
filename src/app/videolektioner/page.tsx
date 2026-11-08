import StepTypeList from "@/components/StepTypeList";
import { PageHeader } from "@/components/ui";

export default function Videos() {
  return (
    <div>
      <PageHeader
        icon="video"
        title="Videolektioner"
      />
      <StepTypeList type="video" />
    </div>
  );
}
