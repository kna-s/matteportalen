"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import Mascot from "@/components/Mascot";
import KidScreening from "@/components/KidScreening";
import { getChapter } from "@/lib/curriculum";
import { stepHref } from "@/lib/flow";
import { gradeOverview, shortComment, trainingPlan } from "@/lib/screening";
import { emptyProgress, latestQuizPerChapter, useStore } from "@/lib/store";
import { quizFeedbackLevel } from "@/lib/tiers";
import { LevelChip, LockedNotice, PageHeader, ProgressBar, RequireLogin, StudentPicker } from "@/components/ui";

export default function ScreeningPage() {
  return (
    <div>
      <PageHeader
        icon="screening"
        title="Screening"
      />
      <RequireLogin>
        <StudentPicker />
        <ScreeningContent />
      </RequireLogin>
    </div>
  );
}

function ScreeningContent() {
  const { state, tier, currentStudent } = useStore();
  const level = quizFeedbackLevel(tier);
  if (!currentStudent) return null;
  const p = state.progress[currentStudent.id] ?? emptyProgress();

  if (level === "none") return <LockedNotice need="premium" what="Full screening" />;

  if (level === "kort") {
    const latest = [...latestQuizPerChapter(p).values()];
    return (
      <div className="space-y-4">
        <div className="card bg-gold-light/40">
          <p>
            Med <b>Plus</b> får du en kort kommentar efter varje quiz. Med <b>Premium</b> får du full screening per kapitel, område och årskurs plus en egen
            träningsplan.
          </p>
          {state.session?.role !== "elev" && (
            <Link href="/abonnemang" className="btn-accent mt-3">
              Uppgradera till Premium
            </Link>
          )}
        </div>
        <h2 className="text-xl font-bold">Kommentarer från dina quiz</h2>
        {latest.length === 0 && <p className="text-muted">Du har inte gjort några quiz ännu.</p>}
        <ul className="grid gap-3 md:grid-cols-2">
          {latest.map((r) => (
            <li key={r.chapterId} className="card">
              <b className="text-navy">{getChapter(r.chapterId)?.title}</b>
              <p className="text-sm text-muted">
                {r.score} av {r.total} rätt
              </p>
              <p className="mt-1 flex gap-2"><Icon name="prat" size={20} className="shrink-0" /> {shortComment(r)}</p>
            </li>
          ))}
        </ul>
      </div>
    );
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
