"use client";

import ResultsView from "@/components/ResultsView";
import { emptyProgress, useStore } from "@/lib/store";
import { PageHeader, RequireLogin, StudentPicker } from "@/components/ui";

export default function ResultsPage() {
  return (
    <div>
      <PageHeader icon="📊" title="Mina resultat" intro="Här ser du hur långt du har kommit, hur dina quiz har gått och vad du har gjort senast." />
      <RequireLogin>
        <StudentPicker />
        <Content />
      </RequireLogin>
    </div>
  );
}

function Content() {
  const { state, currentStudent } = useStore();
  if (!currentStudent) return <p className="text-muted">Inga elever ännu.</p>;
  return <ResultsView student={currentStudent} p={state.progress[currentStudent.id] ?? emptyProgress()} />;
}
