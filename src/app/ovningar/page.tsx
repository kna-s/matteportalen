import StepTypeList from "@/components/StepTypeList";
import { LIBRARY_TABS, PageHeader, SectionTabs } from "@/components/ui";

export default function Exercises() {
  return (
    <div>
      <PageHeader icon="kursplan" title="Bibliotek" />
      <SectionTabs tabs={LIBRARY_TABS} />
      <StepTypeList type="ovning" />
    </div>
  );
}
