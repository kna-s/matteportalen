"use client";

import Link from "next/link";
import { Chapter, STEP_ICONS, STEP_LABELS, Step } from "@/lib/curriculum";
import { stepHref } from "@/lib/flow";
import { emptyProgress, useStore } from "@/lib/store";
import { TIERS, canAccess, requiredTier } from "@/lib/tiers";

export function StepPill({ chapter, step }: { chapter: Chapter; step: Step }) {
  const { state, currentStudent, tier } = useStore();
  const p = (currentStudent && state.progress[currentStudent.id]) || emptyProgress();
  const open = canAccess(tier, step, chapter.id);
  const done = !!p.completed[step.id];
  return (
    <Link
      href={stepHref(step.id)}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm transition-colors ${
        done ? "border-good/40 bg-good/10 text-good" : open ? "border-line bg-paper text-navy hover:bg-gold-light" : "border-dashed border-line bg-cream text-muted"
      }`}
      title={open ? STEP_LABELS[step.type] : `Ingår i ${TIERS[requiredTier(step, chapter.id)].name}`}
    >
      <span aria-hidden>{open ? STEP_ICONS[step.type] : "🔒"}</span>
      {STEP_LABELS[step.type]}
      {done && <span aria-label="klar">✓</span>}
    </Link>
  );
}

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <h4 className="font-semibold text-navy">{chapter.title}</h4>
      <div className="mt-2 flex flex-wrap gap-2">
        {chapter.steps.map((s) => (
          <StepPill key={s.id} chapter={chapter} step={s} />
        ))}
      </div>
    </div>
  );
}
