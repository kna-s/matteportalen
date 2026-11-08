"use client";

import Link from "next/link";
import { BADGES } from "@/lib/badges";
import { chaptersFor, getArea } from "@/lib/curriculum";
import { daysSinceActive } from "@/lib/encourage";
import { continuePoint } from "@/lib/flow";
import { trainingPlan } from "@/lib/screening";
import { Student, StudentProgress, emptyProgress, useStore } from "@/lib/store";
import { TIERS, tierAtLeast } from "@/lib/tiers";
import { DEFAULT_OUTFIT } from "@/lib/treasure";
import Icon from "./icons/Icon";
import Mascot from "./Mascot";

const DAY = ["M", "T", "O", "T", "F", "L", "S"];

function weekDays(p: StudentProgress) {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return DAY.map((_, i) => {
    const from = monday.getTime() + i * 864e5;
    return Object.values(p.completed).filter((d) => {
      const t = new Date(d).getTime();
      return t >= from && t < from + 864e5;
    }).length;
  });
}

function Ring({ value, label, sub }: { value: number; label: string; sub: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0">
        <svg viewBox="0 0 52 52" className="h-14 w-14 -rotate-90" aria-hidden>
          <circle cx={26} cy={26} r={r} fill="none" stroke="var(--color-line)" strokeWidth={6} />
          {value > 0 && <circle cx={26} cy={26} r={r} fill="none" stroke="var(--color-navy)" strokeWidth={6} strokeLinecap="round" strokeDasharray={`${c * value} ${c}`} />}
        </svg>
        <span className="absolute inset-0 grid place-items-center text-xs font-bold text-navy">{Math.round(value * 100)}%</span>
      </div>
      <div>
        <p className="font-semibold leading-tight text-navy">{label}</p>
        <p className="text-xs text-muted">{sub}</p>
      </div>
    </div>
  );
}

function ChildCard({ st }: { st: Student }) {
  const { state, tier, update } = useStore();
  const p = state.progress[st.id] ?? emptyProgress();
  const chs = chaptersFor(st.grade);
  const total = chs.reduce((s, c) => s + c.steps.length, 0);
  const done = chs.reduce((s, c) => s + c.steps.filter((x) => p.completed[x.id]).length, 0);
  const days = weekDays(p);
  const week = days.reduce((a, b) => a + b, 0);
  const max = Math.max(3, ...days);
  const plan = trainingPlan(p, st.grade);
  const badges = BADGES.filter((b) => b.earned({ p, grade: st.grade, tier })).length;
  const idle = daysSinceActive(p);
  const cont = continuePoint(st.grade, tier, p);
  const avg = p.quizResults.length ? p.quizResults.reduce((s, r) => s + r.score / r.total, 0) / p.quizResults.length : null;
  const select = () => update((s) => ({ ...s, session: { ...s.session!, studentId: st.id } }));
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <article className="overflow-hidden rounded-3xl bg-paper shadow-sm ring-1 ring-line">
      {/* Huvud med barnets egen Sigge */}
      <div className="ocean flex items-center gap-4 px-5 pt-4">
        <Mascot mood={week > 0 ? "dansar" : "glad"} size={84} outfit={state.outfits?.[st.id] ?? DEFAULT_OUTFIT} className="-mb-2" />
        <div className="min-w-0 flex-1 pb-3">
          <h2 className="text-2xl font-bold">{st.name}</h2>
          <p className="text-sm text-navy/70">Årskurs {st.grade}</p>
        </div>
        <span className="mb-3 flex items-center gap-1.5 rounded-full bg-paper px-3 py-1 text-sm font-semibold text-navy shadow-sm">
          <Icon name="marken" size={18} /> {badges}
        </span>
      </div>

      <div className="space-y-5 p-5">
        {idle !== null && idle >= 3 && (
          <p className="flex gap-2 rounded-2xl bg-gold-light/60 px-4 py-3 text-sm">
            <Icon name="aktuellt" size={20} className="shrink-0" />
            <span>
              <b>{st.name}</b> har inte varit inne på {idle} dagar. Välj något som är aktuellt i skolan, så blir det lättare att komma igång.
            </span>
          </p>
        )}

        {/* Veckan */}
        <div>
          <div className="flex items-baseline justify-between">
            <p className="font-semibold text-navy">Den här veckan</p>
            <p className="text-sm text-muted">
              <b className="text-navy">{week}</b> steg
            </p>
          </div>
          <div className="mt-2 grid h-16 grid-cols-7 items-end gap-1.5">
            {days.map((n, i) => (
              <div key={i} className="flex h-full flex-col items-center justify-end gap-1">
                <div className={`w-full rounded-md ${n ? (i === todayIdx ? "bg-wine" : "bg-gold") : "bg-line"}`} style={{ height: n ? `${Math.max(14, (n / max) * 100)}%` : 4 }} />
                <span className={`text-[0.65rem] ${i === todayIdx ? "font-bold text-wine" : "text-muted"}`}>{DAY[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Ring value={done / total} label="Av årskursen" sub={`${done} av ${total} steg`} />
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cream">
              <Icon name="quiz" size={28} />
            </span>
            <div>
              <p className="font-semibold leading-tight text-navy">{avg === null ? "–" : `${Math.round(avg * 100)} %`}</p>
              <p className="text-xs text-muted">snitt på quiz</p>
            </div>
          </div>
        </div>

        {cont && (
          <div className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
            <Icon name={getArea(cont.chapter.areaId).icon} size={26} />
            <p className="text-sm">
              Jobbar med <b className="text-navy">{cont.chapter.title}</b>
            </p>
          </div>
        )}

        {tierAtLeast(tier, "premium") ? (
          plan.length > 0 ? (
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-wine">
                <Icon name="mal" size={18} /> Behöver öva på
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {plan.slice(0, 3).map((x) => (
                  <span key={x.chapterId} className="rounded-full bg-wine/10 px-3 py-1 text-sm font-medium text-navy">
                    {x.title}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm font-semibold text-good">
              <Icon name="klar" size={18} /> Inget som behöver repeteras just nu
            </p>
          )
        ) : (
          <Link href="/abonnemang" className="flex items-center gap-2 text-sm text-muted hover:text-navy">
            <Icon name="las" size={18} /> Se vad {st.name} behöver öva på med Premium →
          </Link>
        )}

        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <Link href="/resultat" onClick={select} className="btn-primary !px-4 !py-2 text-sm">
            Se resultat
          </Link>
          <Link href="/foraldraportal" onClick={select} className="btn-ghost !px-4 !py-2 text-sm">
            <Icon name="aktuellt" size={18} /> Välj aktuellt
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ParentHome() {
  const { state, tier } = useStore();
  const weekAgo = Date.now() - 7 * 864e5;
  const all = state.students.map((s) => state.progress[s.id] ?? emptyProgress());
  const weekSteps = all.reduce((sum, p) => sum + Object.values(p.completed).filter((d) => new Date(d).getTime() > weekAgo).length, 0);
  const weekQuiz = all.reduce((sum, p) => sum + p.quizResults.filter((r) => new Date(r.date).getTime() > weekAgo).length, 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white sm:p-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold !text-white sm:text-4xl">Hej {state.parent.name.split(" ")[0]}!</h1>
          {state.students.length > 0 ? (
            <p className="mt-2 max-w-xl text-white/80">
              Senaste veckan har dina barn gjort <b className="text-gold">{weekSteps} steg</b> och <b className="text-gold">{weekQuiz} quiz</b>.
            </p>
          ) : (
            <p className="mt-2 text-white/80">Välkommen till Mega Akademin.</p>
          )}
          <Link href="/abonnemang" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20">
            <Icon name="abonnemang" size={18} className="icon-invert" /> {TIERS[tier].name}
          </Link>
        </div>
        <span className="pointer-events-none absolute -right-4 -top-4 font-serif text-[9rem] font-bold leading-none text-white/5" aria-hidden>
          π
        </span>
      </div>

      {state.students.length === 0 && (
        <div className="rounded-3xl bg-paper p-8 text-center ring-1 ring-line">
          <div className="flex justify-center">
            <Mascot mood="glad" size={110} />
          </div>
          <h2 className="mt-2 text-2xl font-bold">Lägg till ditt första barn</h2>
          <p className="mx-auto mt-1 max-w-md text-muted">Sedan ser du här hur veckan har gått och vad barnet behöver öva på.</p>
          <Link href="/kom-igang" className="btn-accent mt-5">
            <Icon name="plus" size={20} className="icon-invert" /> Kom igång
          </Link>
        </div>
      )}
      {state.students.length > 0 && state.parent.onboarded === false && (
        <Link href="/kom-igang" className="flex items-center gap-3 rounded-2xl bg-gold-light/60 p-4 hover:bg-gold-light">
          <Icon name="aktuellt" size={24} />
          <span className="flex-1 text-sm">
            <b>Slutför guiden Kom igång</b> för att välja nivå och få barnens inloggningsuppgifter.
          </span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {state.students.map((st) => (
          <ChildCard key={st.id} st={st} />
        ))}
      </div>
    </div>
  );
}
