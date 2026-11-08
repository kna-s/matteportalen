import StepTypeList from "@/components/StepTypeList";
import { LIBRARY_TABS, PageHeader, SectionTabs } from "@/components/ui";

export default function Videos() {
  return (
    <div>
      <PageHeader icon="kursplan" title="Bibliotek" />
      <SectionTabs tabs={LIBRARY_TABS} />
      <StepTypeList type="video" />
    </div>
  );
}
