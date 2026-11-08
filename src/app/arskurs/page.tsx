"use client";

import Link from "next/link";
import { GRADES, chaptersFor } from "@/lib/curriculum";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/ui";

const GRADE_TEXT: Record<number, string> = {
  4: "Vi bygger en stadig grund: tal, mönster, former och enkla diagram.",
  5: "Vi går vidare med bråk, decimaltal, area och sannolikhet.",
  6: "Vi förbereder för högstadiet med ekvationer, procent och proportionalitet.",
};

export default function GradePicker() {
  const { currentStudent } = useStore();
  return (
    <div>
      <PageHeader icon="🎓" title="Välj årskurs" intro="Välj den årskurs du går i, så visar vi rätt kapitel. Du kan alltid titta på andra årskurser om du vill repetera eller utmana dig." />
      <div className="grid gap-4 sm:grid-cols-3">
        {GRADES.map((g) => (
          <Link
            key={g}
            href={`/arskurs/${g}`}
            className={`card block text-center transition-shadow hover:shadow-md ${currentStudent?.grade === g ? "ring-2 ring-gold" : ""}`}
          >
            <span className="font-serif text-6xl font-bold text-navy">{g}</span>
            <p className="mt-1 font-semibold text-wine">Årskurs {g}</p>
            <p className="mt-2 text-sm text-muted">{GRADE_TEXT[g]}</p>
            <p className="mt-3 text-xs text-muted">{chaptersFor(g).length} kapitel</p>
            {currentStudent?.grade === g && <span className="chip mt-3 bg-gold-light text-[#6b5410]">Din årskurs</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
