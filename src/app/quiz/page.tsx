import StepTypeList from "@/components/StepTypeList";
import { PageHeader } from "@/components/ui";

export default function Quizzes() {
  return (
    <div>
      <PageHeader
        icon="quiz"
        title="Quiz och utmaningar"
      />
      <StepTypeList type="quiz" />
    </div>
  );
}
