"use client";

import ResultsView from "@/components/ResultsView";
import StudentResults from "@/components/StudentResults";
import { emptyProgress, useStore } from "@/lib/store";
import { PROGRESS_TABS, PageHeader, RequireLogin, SectionTabs, StudentPicker } from "@/components/ui";

export default function ResultsPage() {
  const { state } = useStore();
  const isStudent = state.session?.role === "elev";
  return (
    <div>
      <PageHeader
        icon="resultat"
        title={isStudent ? "Mina framsteg" : "Resultat"}
        intro={isStudent ? undefined : "Hur långt barnet har kommit och hur quizen har gått."}
      />
      {isStudent && <SectionTabs tabs={PROGRESS_TABS} />}
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
  const p = state.progress[currentStudent.id] ?? emptyProgress();
  return state.session?.role === "elev" ? <StudentResults student={currentStudent} p={p} /> : <ResultsView student={currentStudent} p={p} />;
}
