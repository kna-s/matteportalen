"use client";

import ResultsView from "@/components/ResultsView";
import StudentResults from "@/components/StudentResults";
import { emptyProgress, useStore } from "@/lib/store";
import { PROGRESS_TABS, PageHeader, RequireLogin, SectionTabs, StudentPicker } from "@/components/ui";
import { tierAtLeast } from "@/lib/tiers";

export default function ResultsPage() {
  const { state, tier } = useStore();
  const premium = tierAtLeast(tier, "premium");
  const isStudent = state.session?.role === "elev";
  return (
    <div>
      <PageHeader
        icon="resultat"
        title={isStudent ? "Mina framsteg" : "Resultat"}
        intro={isStudent ? undefined : "Hur långt barnet har kommit och hur quizen har gått."}
      />
      {/* Elever utan Premium har ingen Screening-flik, så flikraden behövs inte. */}
      {isStudent && premium && <SectionTabs tabs={PROGRESS_TABS} />}
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
