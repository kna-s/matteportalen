"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useState } from "react";
import { AREAS, GRADES, Grade, STEP_ICON, StepType, chaptersFor } from "@/lib/curriculum";
import { stepHref } from "@/lib/flow";
import { emptyProgress, latestQuizPerChapter, useStore } from "@/lib/store";
import { TIERS, canAccess, requiredTier } from "@/lib/tiers";
import { TierChip } from "./ui";

/** Lista över alla steg av en viss typ (alla videor, alla övningar, alla quiz). */
export default function StepTypeList({ type }: { type: StepType }) {
  const { state, tier, currentStudent } = useStore();
  const [grade, setGrade] = useState<Grade>(currentStudent?.grade ?? 4);
  const [areaId, setAreaId] = useState<string>("alla");
  const p = (currentStudent && state.progress[currentStudent.id]) || emptyProgress();
  const latest = latestQuizPerChapter(p);

  const areas = AREAS.filter((a) => areaId === "alla" || a.id === areaId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {GRADES.map((g) => (
          <button key={g} onClick={() => setGrade(g)} className={grade === g ? "btn-primary !py-1.5" : "btn-ghost !py-1.5"}>
            Åk {g}
          </button>
        ))}
        <select className="input !w-auto !py-1.5" value={areaId} onChange={(e) => setAreaId(e.target.value)} aria-label="Område">
          <option value="alla">Alla områden</option>
          {AREAS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-8">
        {areas.map((a) => (
          <section key={a.id}>
            <h2 className="mb-3 text-xl font-bold">
              <Icon name={a.icon} size={28} className="mr-2 inline-block align-[-6px]" />
              {a.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chaptersFor(grade, a.id).map((c) => {
                const s = c.steps.find((x) => x.type === type)!;
                const open = canAccess(tier, s, c.id);
                const done = !!p.completed[s.id];
                const r = latest.get(c.id);
                return (
                  <Link
                    key={s.id}
                    href={stepHref(s.id)}
                    className={`group flex flex-col overflow-hidden rounded-2xl border bg-paper transition-shadow hover:shadow-md ${open ? "border-line" : "border-dashed border-line opacity-80"}`}
                  >
                    {type === "video" && (
                      <div className="grid aspect-video place-items-center text-4xl text-white" style={{ background: `linear-gradient(135deg, ${a.color}, var(--color-navy))` }}>
                        {open ? "▶" : <Icon name="las" size={36} className="icon-invert" />}
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <b className="text-navy">
                          {type !== "video" && <Icon name={open ? STEP_ICON[type] : "las"} size={20} className="mr-1.5 inline-block align-[-4px]" />}
                          {c.title}
                        </b>
                        {!open && <TierChip tier={requiredTier(s, c.id)} />}
                      </div>
                      <p className="mt-1 text-xs text-muted">Uppdaterad {s.publishedMonth}</p>
                      <div className="mt-auto pt-2 text-sm">
                        {done && <span className="text-good">✓ Klar</span>}
                        {type === "quiz" && r && (
                          <span className="ml-2 text-muted">
                            Senast: {r.score}/{r.total}
                          </span>
                        )}
                        {!open && <span className="text-muted">Ingår i {TIERS[requiredTier(s, c.id)].name}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
