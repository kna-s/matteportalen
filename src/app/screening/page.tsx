"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import Mascot from "@/components/Mascot";
import KidScreening from "@/components/KidScreening";
import { getChapter } from "@/lib/curriculum";
import { stepHref } from "@/lib/flow";
import { gradeOverview, trainingPlan } from "@/lib/screening";
import { emptyProgress, useStore } from "@/lib/store";
import { tierAtLeast } from "@/lib/tiers";
import { LevelChip, PROGRESS_TABS, PageHeader, ProgressBar, RequireLogin, SectionTabs, StudentPicker } from "@/components/ui";

export default function ScreeningPage() {
  const { state, tier } = useStore();
  const isStudent = state.session?.role === "elev";
  return (
    <div>
      <PageHeader icon={isStudent ? "resultat" : "screening"} title={isStudent ? "Mina framsteg" : "Screening"} />
      {isStudent && tierAtLeast(tier, "premium") && <SectionTabs tabs={PROGRESS_TABS} />}
      <RequireLogin>
        <StudentPicker />
        <ScreeningContent />
      </RequireLogin>
    </div>
  );
}

function ScreeningContent() {
  const { state, tier, currentStudent } = useStore();
  const premium = tierAtLeast(tier, "premium");
  if (!currentStudent) return null;
  const p = state.progress[currentStudent.id] ?? emptyProgress();

  if (!premium) {
    // Barn ska inte mötas av lås eller säljtexter, de får bara en vänlig hänvisning till sina resultat.
    if (state.session?.role === "elev")
      return (
        <div className="rounded-3xl bg-paper p-8 text-center ring-1 ring-line">
          <div className="flex justify-center">
            <Mascot mood="glad" size={110} />
          </div>
          <h2 className="mt-2 text-2xl font-bold">Kolla in dina framsteg</h2>
          <p className="mx-auto mt-1 max-w-md text-muted">Där ser du hur det har gått i dina quiz och hur långt du har kommit.</p>
          <Link href="/resultat" className="btn-accent mt-5">
            Till mina framsteg
          </Link>
        </div>
      );
    return <ScreeningTeaser name={currentStudent.name} />;
  }

  if (p.quizResults.length === 0)
    return (
      <div className="rounded-3xl bg-paper p-8 text-center ring-1 ring-line">
        <div className="flex justify-center">
          <Mascot mood="glad" size={110} />
        </div>
        <h2 className="mt-2 text-2xl font-bold">Ingen screening än</h2>
        <p className="mx-auto mt-1 max-w-md text-muted">Screeningen bygger på quizen. Efter första quizen ser du här vad som går bra och vad som kan övas mer på.</p>
        <Link href="/quiz" className="btn-accent mt-5">
          Till quizen
        </Link>
      </div>
    );

  if (state.session?.role === "elev") return <KidScreening p={p} grade={currentStudent.grade} />;

  const { areas, overall } = gradeOverview(p, currentStudent.grade);
  const plan = trainingPlan(p, currentStudent.grade);
  const strong = areas.filter((a) => a.level === "stark");
  const weak = areas.filter((a) => a.level === "ova");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card bg-navy text-white">
          <p className="text-sm uppercase tracking-wide text-gold">Hela årskurs {currentStudent.grade}</p>
          <p className="mt-1 font-serif text-5xl font-bold">{overall === null ? "–" : `${Math.round(overall * 100)} %`}</p>
          <p className="text-sm text-white/70">genomsnitt på testade områden</p>
        </div>
        <div className="card">
          <p className="flex items-center gap-2 font-semibold text-good"><Icon name="stjarna" size={20} /> Starkast inom</p>
          <p className="mt-1">{strong.length ? strong.map((a) => a.title).join(", ") : "Gör fler quiz för att se dina styrkor."}</p>
        </div>
        <div className="card">
          <p className="flex items-center gap-2 font-semibold text-bad"><Icon name="mal" size={20} /> Kika extra på</p>
          <p className="mt-1">{weak.length ? weak.map((a) => a.title).join(", ") : "Inget område ligger under 60 % just nu. Bra jobbat!"}</p>
        </div>
      </div>

      <section className="card">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Icon name="ovning" size={26} /> Din träningsplan</h2>
        <p className="text-sm text-muted">Kapitel där du fått under 60 % på senaste quizen. Gör dem igen så uppdateras planen.</p>
        {plan.length === 0 ? (
          <p className="mt-3 text-good">Inget att repetera just nu. Fortsätt framåt i kursplanen!</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {plan.map((x) => (
              <li key={x.chapterId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
                <span>
                  <b className="text-navy">{x.title}</b> <span className="text-sm text-muted">({x.reason})</span>
                  <span className="block text-sm">{x.action}</span>
                </span>
                <Link href={stepHref(getChapter(x.chapterId)!.steps[0].id)} className="btn-ghost !py-1.5 text-sm">
                  Repetera →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">Per område och kapitel</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {areas.map((a) => (
            <div key={a.areaId} className="card">
              <div className="flex items-center justify-between gap-2">
                <b className="text-navy">
                  <Icon name={a.icon} size={24} className="mr-1.5 inline-block align-[-5px]" />
                  {a.title}
                </b>
                <LevelChip level={a.level} />
              </div>
              <ul className="mt-3 space-y-2">
                {a.chapters.map((c) => (
                  <li key={c.id} className="grid grid-cols-[1fr_6rem_auto] items-center gap-2 text-sm">
                    <span className="truncate" title={c.title}>
                      {c.title}
                    </span>
                    {c.ratio === null ? <span className="text-xs text-muted">–</span> : <ProgressBar value={c.ratio} />}
                    <span className="w-10 text-right text-xs text-muted">{c.ratio === null ? "" : `${Math.round(c.ratio * 100)} %`}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const TEASER_AREAS = [
  { title: "Taluppfattning", value: 0.92, level: "stark" },
  { title: "Geometri", value: 0.74, level: "okej" },
  { title: "Algebra", value: 0.48, level: "ova" },
  { title: "Sannolikhet och statistik", value: 0.81, level: "okej" },
] as const;

/** Suddig förhandsvisning för föräldrar utan Premium. Exempeldata, inte barnets riktiga resultat. */
function ScreeningTeaser({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl ring-1 ring-line">
      <div aria-hidden className="pointer-events-none select-none space-y-4 bg-cream/40 p-5 blur-[5px] sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card bg-navy text-white">
            <p className="text-sm uppercase tracking-wide text-gold">Hela årskursen</p>
            <p className="mt-1 font-serif text-5xl font-bold">78 %</p>
          </div>
          <div className="card">
            <p className="font-semibold text-good">Starkast inom</p>
            <p className="mt-1">Taluppfattning</p>
          </div>
          <div className="card">
            <p className="font-semibold text-bad">Kika extra på</p>
            <p className="mt-1">Algebra</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {TEASER_AREAS.map((a) => (
            <div key={a.title} className="card">
              <div className="flex items-center justify-between gap-2">
                <b className="text-navy">{a.title}</b>
                <LevelChip level={a.level} />
              </div>
              <div className="mt-3 space-y-2">
                {[a.value, a.value - 0.1, a.value + 0.05].map((v, i) => (
                  <ProgressBar key={i} value={Math.max(0.1, Math.min(1, v))} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 grid place-items-center bg-paper/40 p-4">
        <div className="max-w-md rounded-3xl bg-paper p-6 text-center shadow-xl ring-1 ring-line">
          <Icon name="screening" size={48} className="mx-auto" />
          <h2 className="mt-2 text-2xl font-bold">Se exakt vad {name} behöver öva på</h2>
          <p className="mt-2 text-muted">
            Screeningen visar styrkor och svagheter per kapitel, område och årskurs, och ger en egen träningsplan efter varje quiz.
          </p>
          <Link href="/abonnemang" className="btn-accent mt-4">
            Ingår i Premium →
          </Link>
          <p className="mt-2 text-xs text-muted">Bilden bakom är ett exempel.</p>
        </div>
      </div>
    </div>
  );
}
