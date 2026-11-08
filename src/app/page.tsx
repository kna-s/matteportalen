"use client";

import Link from "next/link";
import { AREAS, STEP_ICONS, STEP_LABELS, chaptersFor, getChapter } from "@/lib/curriculum";
import { continuePoint, stepHref } from "@/lib/flow";
import { emptyProgress, useStore } from "@/lib/store";
import { TIERS, TIER_ORDER } from "@/lib/tiers";
import { ProgressBar, ReadAloud, StudentPicker } from "@/components/ui";

const INTRO =
  "Matteportalen hjälper elever i årskurs 4 till 6 att förstå matematik i sin egen takt. Titta på en kort video, gör en övning, testa dig själv med en quiz och få veta vad du ska öva mer på.";

export default function Home() {
  const { state, ready } = useStore();
  if (!ready) return null;
  return state.session ? <Dashboard /> : <Landing />;
}

function Landing() {
  return (
    <div className="space-y-14">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <span className="chip bg-gold-light text-[#6b5410]">Matte för åk 4–6</span>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Matte som känns <span className="text-wine">lugn</span> och går att förstå.
          </h1>
          <p className="mt-4 text-lg text-muted">
            {INTRO} <ReadAloud text={INTRO} />
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/logga-in" className="btn-accent">
              Skapa gratiskonto
            </Link>
            <Link href="/arskurs" className="btn-ghost">
              Se kursplanen
            </Link>
          </div>
        </div>
        <div className="card bg-navy p-8 text-white">
          <p className="font-serif text-2xl text-gold">Så funkar det</p>
          <ol className="mt-4 space-y-3">
            {(["video", "ovning", "quiz", "screening"] as const).map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-lg">{STEP_ICONS[t]}</span>
                <span>
                  <b>
                    {i + 1}. {STEP_LABELS[t]}
                  </b>
                  <span className="block text-sm text-white/70">
                    {
                      {
                        video: "En kort lektion där en av våra lärare förklarar.",
                        ovning: "Uppgifter att göra efter kapitlet.",
                        quiz: "Självrättande frågor som visar hur det gick.",
                        screening: "Vad du är stark på och vad du ska öva mer på.",
                      }[t]
                    }
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-white/70">Klicka bara på ”Nästa”, så leder sidan dig vidare.</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Allt i Skolverkets kursplan</h2>
        <p className="mt-1 text-muted">Innehållet följer det centrala innehållet för matematik i årskurs 4–6.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <div key={a.id} className="card border-l-4" style={{ borderLeftColor: a.color }}>
              <div className="text-2xl">{a.emoji}</div>
              <h3 className="mt-1 font-bold">{a.title}</h3>
              <p className="mt-1 text-sm text-muted">{a.topics.slice(0, 3).join(" · ")}…</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Välj den nivå som passar er</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIER_ORDER.map((t) => (
            <div key={t} className={`card ${t === "premium" ? "border-gold ring-2 ring-gold/40" : ""}`}>
              <h3 className="text-xl font-bold">{TIERS[t].name}</h3>
              <p className="font-semibold text-wine">{TIERS[t].price}</p>
              <p className="mt-1 text-sm text-muted">{TIERS[t].tagline}</p>
            </div>
          ))}
        </div>
        <Link href="/abonnemang" className="btn-ghost mt-4">
          Jämför abonnemang
        </Link>
      </section>
    </div>
  );
}

function Dashboard() {
  const { state, currentStudent, tier } = useStore();
  const role = state.session!.role;
  const student = currentStudent;

  if (!student)
    return (
      <div className="card">
        <p>Inga elevkonton ännu.</p>
        <Link href="/foraldraportal" className="btn-primary mt-3">
          Lägg till barn
        </Link>
      </div>
    );

  const p = state.progress[student.id] ?? emptyProgress();
  const chapters = chaptersFor(student.grade);
  const totalSteps = chapters.reduce((s, c) => s + c.steps.length, 0);
  const done = chapters.reduce((s, c) => s + c.steps.filter((x) => p.completed[x.id]).length, 0);
  const cont = continuePoint(student.grade, tier, p);
  const aktuellt = (state.aktuellt[student.grade] ?? []).map(getChapter).filter(Boolean);

  return (
    <div className="space-y-6">
      <StudentPicker />
      <div>
        <h1 className="page-title">{role === "elev" ? `Hej ${student.name}! 👋` : `${student.name}s översikt`}</h1>
        <p className="text-muted">Årskurs {student.grade} · {TIERS[tier].name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card bg-navy text-white md:col-span-2">
          <p className="text-sm uppercase tracking-wide text-gold">Fortsätt där du var</p>
          {cont ? (
            <>
              <h2 className="mt-1 text-2xl font-bold text-white">
                {STEP_ICONS[cont.step.type]} {cont.step.title}
              </h2>
              <p className="text-white/70">{cont.chapter.title}</p>
              <Link href={stepHref(cont.step.id)} className="btn mt-4 bg-gold text-navy hover:bg-gold-light">
                Starta →
              </Link>
            </>
          ) : (
            <p className="mt-2">Du har gjort allt som ingår i ditt abonnemang. Snyggt jobbat! 🎉</p>
          )}
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-navy">Din framgång i åk {student.grade}</p>
          <p className="mt-2 font-serif text-4xl font-bold text-navy">{Math.round((done / totalSteps) * 100)} %</p>
          <ProgressBar value={done / totalSteps} />
          <p className="mt-2 text-sm text-muted">
            {done} av {totalSteps} steg klara
          </p>
        </div>
      </div>

      <section className="card border-wine/40">
        <h2 className="text-xl font-bold">📌 Aktuellt just nu</h2>
        <p className="text-sm text-muted">Det här har våra lärare valt ut som extra viktigt den här perioden.</p>
        {aktuellt.length ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {aktuellt.map((c) => (
              <li key={c!.id}>
                <Link href={stepHref(c!.steps[0].id)} className="flex items-center justify-between rounded-xl border border-line p-3 hover:bg-gold-light">
                  <span>
                    <b className="text-navy">{c!.title}</b>
                    <span className="block text-xs text-muted">{AREAS.find((a) => a.id === c!.areaId)?.title}</span>
                  </span>
                  <span>→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Inget är markerat som aktuellt just nu.</p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold">Områden</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => {
            const chs = chaptersFor(student.grade, a.id);
            const t = chs.reduce((s, c) => s + c.steps.length, 0);
            const d = chs.reduce((s, c) => s + c.steps.filter((x) => p.completed[x.id]).length, 0);
            return (
              <Link key={a.id} href={`/arskurs/${student.grade}#${a.id}`} className="card block transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{a.emoji}</span>
                  <b className="text-navy">{a.title}</b>
                </div>
                <div className="mt-3">
                  <ProgressBar value={d / t} color={a.color} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
