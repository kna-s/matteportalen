import StepTypeList from "@/components/StepTypeList";
import { PageHeader } from "@/components/ui";

export default function Quizzes() {
  return (
    <div>
      <PageHeader
        icon="🏆"
        title="Quiz och utmaningar"
        intro="Självrättande quiz som visar direkt hur det gick. Försök slå ditt eget rekord! Nya quiz kommer varje månad."
      />
      <StepTypeList type="quiz" />
    </div>
  );
}
