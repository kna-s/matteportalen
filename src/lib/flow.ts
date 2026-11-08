import { Grade, linearSteps } from "./curriculum";
import { StudentProgress } from "./store";
import { Tier, canAccess } from "./tiers";

/** Nästa steg som eleven har tillgång till efter stepId (låsta steg hoppas över). */
export function nextAccessible(grade: Grade, tier: Tier, afterStepId?: string) {
  const all = linearSteps(grade);
  const start = afterStepId ? all.findIndex((x) => x.step.id === afterStepId) + 1 : 0;
  const skipped: typeof all = [];
  for (let i = start; i < all.length; i++) {
    if (canAccess(tier, all[i].step, all[i].chapter.id)) return { next: all[i], skipped };
    skipped.push(all[i]);
  }
  return { next: undefined, skipped };
}

/** Första steget som eleven inte gjort ännu och har tillgång till. */
export function continuePoint(grade: Grade, tier: Tier, p: StudentProgress) {
  return linearSteps(grade).find((x) => !p.completed[x.step.id] && canAccess(tier, x.step, x.chapter.id));
}

export function stepHref(stepId: string) {
  return `/steg/${stepId}`;
}
