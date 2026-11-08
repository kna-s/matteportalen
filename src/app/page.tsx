"use client";

import Link from "next/link";
import { AREAS, STEP_ICONS, STEP_LABELS, chaptersFor, getArea, getChapter } from "@/lib/curriculum";
import { continuePoint, stepHref } from "@/lib/flow";
import { trainingPlan } from "@/lib/screening";
import { emptyProgress, useStore } from "@/lib/store";
import { TIERS, canAccess, tierAtLeast } from "@/lib/tiers";
import Landing from "@/components/Landing";
import AdminPanel from "@/components/AdminPanel";
import { MascotSays } from "@/components/Mascot";
import { BadgeMedal } from "@/components/Badges";
import { BADGES } from "@/lib/badges";

export default function Home() {
  const { state, ready } = useStore();
  if (!ready) return null;
  if (!state.session) return <Landing />;
  if (state.session.role === "admin") return <AdminPanel />;
  return state.session.role === "elev" ? <StudentHome /> : <ParentHome />;
}

/* ------------------------------------------------------------------ */
/* Elevens startsida: bara det som leder framåt                        */
/* ------------------------------------------------------------------ */

function StudentHome() {
  const { state, currentStudent, tier } = useStore();
  if (!currentStudent) return null;
  const p = state.progress[currentStudent.id] ?? emptyProgress();
  const cont = continuePoint(currentStudent.grade, tier, p);
  const aktuellt = (state.aktuellt[currentStudent.id] ?? []).map(getChapter).filter((c) => !!c);
  const chapterDone = (id: string) => getChapter(id)!.steps.filter((s) => canAccess(tier, s, id)).every((s) => p.completed[s.id]);
  const ctx = { p, grade: currentStudent.grade, tier };
  const earned = BADGES.filter((b) => b.earned(ctx));
  const locked = BADGES.filter((b) => !b.earned(ctx))
    .map((b) => ({ badge: b, isEarned: false, prog: b.progress?.(ctx) ?? 0 }))
    .sort((a, b) => b.prog - a.prog);
  const seen = state.seenBadges[currentStudent.id] ?? {};
  const recent = earned
    .map((b) => ({ badge: b, isEarned: true, prog: 1, at: seen[b.id] ?? "" }))
    .sort((a, b) => b.at.localeCompare(a.at));
  const showcase = [...recent.slice(0, 4), ...locked].slice(0, 6);
  const next = locked[0];

  // Stigen visar området där eleven är just nu.
  const areaId = cont?.chapter.areaId ?? AREAS[0].id;
  const area = getArea(areaId);
  const areaChapters = chaptersFor(currentStudent.grade, areaId);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Hej {currentStudent.name}!</h1>
        <div className="mt-3">
          <MascotSays mood="glad">
            {cont ? `Kul att se dig! Idag fortsätter vi med ${cont.chapter.title.toLowerCase()}. Ett steg i taget.` : "Wow, du har gjort allt! Nytt material kommer snart."}
          </MascotSays>
        </div>
      </div>

      {/* Stort nästa-steg-kort */}
      <div className="overflow-hidden rounded-3xl bg-navy text-white shadow-lg">
        {cont ? (
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">Ditt nästa steg</p>
            <p className="mt-2 text-sm text-white/70">
              {area.emoji} {area.title} · {cont.chapter.title}
            </p>
            <h2 className="mt-1 text-2xl font-bold !text-white sm:text-3xl">
              {STEP_ICONS[cont.step.type]} {STEP_LABELS[cont.step.type]}
            </h2>
            <Link href={stepHref(cont.step.id)} className="btn mt-6 w-full bg-gold !py-4 text-xl text-navy hover:bg-gold-light sm:w-auto sm:!px-10">
              Fortsätt →
            </Link>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-4xl">🎉</p>
            <p className="mt-2 text-xl font-bold">Du har gjort allt som finns just nu!</p>
            <p className="text-white/70">Snyggt jobbat. Nytt material kommer varje månad.</p>
          </div>
        )}
      </div>

      {aktuellt.length > 0 && (
        <section className="rounded-2xl bg-wine/5 p-5 ring-1 ring-wine/15">
          <h2 className="text-lg font-bold">📌 Aktuellt just nu</h2>
          <p className="text-sm text-muted">Det här vill din förälder att du kikar på.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {aktuellt.map((c) => (
              <Link key={c.id} href={stepHref(c.steps[0].id)} className="rounded-xl bg-paper px-4 py-2 font-medium text-navy shadow-sm hover:bg-gold-light">
                {c.title} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stigen */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold">
            {area.emoji} {area.title}
          </h2>
          <Link href={`/arskurs/${currentStudent.grade}`} className="shrink-0 whitespace-nowrap text-sm text-muted hover:text-navy">
            Hela årskursen →
          </Link>
        </div>
        <ol className="relative space-y-3 pl-2">
          <span className="absolute bottom-6 left-[1.85rem] top-6 w-1 rounded bg-line" aria-hidden />
          {areaChapters.map((c, i) => {
            const done = chapterDone(c.id);
            const current = cont?.chapter.id === c.id;
            return (
              <li key={c.id} className="relative">
                <Link
                  href={stepHref(c.steps[0].id)}
                  className={`flex items-center gap-4 rounded-2xl p-3 transition-colors ${current ? "bg-gold-light/60" : "hover:bg-paper"}`}
                >
                  <span
                    className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-bold ${
                      done ? "bg-good text-white" : current ? "bg-gold text-navy ring-4 ring-gold/30" : "border-2 border-line bg-paper text-muted"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={`block font-semibold ${done || current ? "text-navy" : "text-muted"}`}>{c.title}</span>
                    {current && <span className="text-sm text-wine">Du är här</span>}
                    {done && <span className="text-sm text-good">Klart!</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>


      {/* Märken */}
      <section className="rounded-3xl bg-paper p-5 ring-1 ring-line">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold">🏅 Dina märken</h2>
          <Link href="/marken" className="shrink-0 text-sm font-semibold text-wine hover:underline">
            Se alla {earned.length} / {BADGES.length} →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {showcase.map(({ badge, isEarned, prog }) => (
            <Link key={badge.id} href="/marken" className="group flex flex-col items-center rounded-2xl p-2 text-center hover:bg-cream" title={isEarned ? badge.description : badge.hint}>
              <div className="transition-transform group-hover:scale-105">
                <BadgeMedal badge={badge} earned={isEarned} size={56} progress={prog} />
              </div>
              <span className={`text-[0.72rem] font-semibold leading-tight ${isEarned ? "text-navy" : "text-muted"}`}>{badge.name}</span>
            </Link>
          ))}
        </div>
        {next && (
          <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-sm">
            🎯 <b>Nästa märke:</b> {next.badge.name}. {next.badge.hint}
          </p>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Förälderns startsida: översikt över barnen                          */
/* ------------------------------------------------------------------ */

function ParentHome() {
  const { state, tier, update } = useStore();
  const weekAgo = Date.now() - 7 * 864e5;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Hej {state.parent.name.split(" ")[0]}!</h1>
        <p className="mt-1 text-muted">
          Så här har veckan gått för dina barn. Abonnemang: <b>{TIERS[tier].name}</b>
        </p>
      </div>

      {state.students.length === 0 && (
        <div className="card text-center">
          <p>Du har inte lagt till några barn ännu.</p>
          <Link href="/foraldraportal" className="btn-primary mt-3">
            Lägg till barn
          </Link>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {state.students.map((st) => {
          const p = state.progress[st.id] ?? emptyProgress();
          const chs = chaptersFor(st.grade);
          const total = chs.reduce((s, c) => s + c.steps.length, 0);
          const done = chs.reduce((s, c) => s + c.steps.filter((x) => p.completed[x.id]).length, 0);
          const week = Object.values(p.completed).filter((d) => new Date(d).getTime() > weekAgo).length;
          const plan = trainingPlan(p, st.grade);
          const badgeCount = BADGES.filter((b) => b.earned({ p, grade: st.grade, tier })).length;
          const select = () => update((s) => ({ ...s, session: { ...s.session!, studentId: st.id } }));
          return (
            <div key={st.id} className="card space-y-4 !p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-navy text-lg font-bold text-gold">{st.name[0]}</span>
                <div>
                  <h2 className="text-xl font-bold">{st.name}</h2>
                  <p className="text-sm text-muted">Årskurs {st.grade}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-cream p-3">
                  <p className="font-serif text-2xl font-bold text-navy">{week}</p>
                  <p className="text-xs text-muted">steg denna vecka</p>
                </div>
                <div className="rounded-xl bg-cream p-3">
                  <p className="font-serif text-2xl font-bold text-navy">{Math.round((done / total) * 100)} %</p>
                  <p className="text-xs text-muted">av årskursen</p>
                </div>
              </div>
              {tierAtLeast(tier, "premium") ? (
                plan.length > 0 ? (
                  <p className="text-sm">
                    🎯 Behöver öva på: <b>{plan.slice(0, 3).map((x) => x.title).join(", ")}</b>
                  </p>
                ) : (
                  <p className="text-sm text-good">💪 Inget som behöver repeteras just nu.</p>
                )
              ) : (
                <p className="text-sm text-muted">🔒 Se vad {st.name} behöver öva på med Premium.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Link href="/resultat" onClick={select} className="btn-ghost !py-1.5 text-sm">
                  Resultat
                </Link>
                <Link href="/screening" onClick={select} className="btn-ghost !py-1.5 text-sm">
                  Screening
                </Link>
                <Link href="/marken" onClick={select} className="btn-ghost !py-1.5 text-sm">
                  🏅 {badgeCount} märken
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
