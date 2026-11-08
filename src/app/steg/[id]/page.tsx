"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BABBEL, Chapter, STEP_ICON, STEP_LABELS, Step, findStep, getArea } from "@/lib/curriculum";
import { nextAccessible, stepHref } from "@/lib/flow";
import { fullScreening, levelOf, shortComment } from "@/lib/screening";
import { QuizResult, emptyProgress, useStore } from "@/lib/store";
import { TIERS, canAccess, quizFeedbackLevel, requiredTier } from "@/lib/tiers";
import { LevelChip, LockedNotice, ProgressBar, ReadAloud, RequireLogin } from "@/components/ui";
import Toolbox from "@/components/tools/Toolbox";
import { mergeStep, useContent, youtubeId } from "@/lib/content";
import Mascot, { MascotSays } from "@/components/Mascot";
import DrawPad from "@/components/DrawPad";

export default function StepPage() {
  return (
    <RequireLogin>
      <StepView />
    </RequireLogin>
  );
}

const SIGGE_INTRO: Record<Step["type"], string> = {
  video: "Titta i lugn och ro. Du kan pausa och spola tillbaka så många gånger du vill.",
  ovning: "Här finns inget rätt eller fel. Testa, rita och skriv hur du tänker!",
  quiz: "En fråga i taget. Ta den tid du behöver, du klarar det!",
  screening: "Här ser du vad du redan kan och vad du kan öva lite mer på.",
};

function StepView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, tier, currentStudent, completeStep } = useStore();
  const { rows } = useContent();
  const found = findStep(id);
  if (!found) return <p>Steget finns inte.</p>;
  const { chapter } = found;
  const step = mergeStep(found.step, rows[found.step.id]);
  const area = getArea(chapter.areaId);
  const open = canAccess(tier, step, chapter.id);
  const isStudent = state.session?.role === "elev";
  const studentId = currentStudent?.id;
  const { next, skipped } = nextAccessible(chapter.grade, tier, step.id);
  const stepIndex = chapter.steps.findIndex((s) => s.id === step.id);

  const goNext = () => {
    if (open && isStudent && studentId && step.type !== "quiz") completeStep(studentId, step.id);
    router.push(next ? stepHref(next.step.id) : `/arskurs/${chapter.grade}`);
  };

  return (
    <div className="space-y-5">
      <nav className="text-sm text-muted">
        <Link href={`/arskurs/${chapter.grade}`} className="hover:text-navy">
          Åk {chapter.grade}
        </Link>{" "}
        ›{" "}
        <Link href={`/arskurs/${chapter.grade}#${area.id}`} className="hover:text-navy">
          {area.title}
        </Link>{" "}
        › <span className="text-ink">{chapter.title}</span>
      </nav>

      <Stepper chapter={chapter} current={step} />

      {!isStudent && (
        <p className="rounded-xl bg-gold-light/60 px-4 py-2 text-sm text-gold-ink">
          Du förhandsvisar som {state.session?.role === "admin" ? "admin" : "förälder"}. Framsteg sparas bara när eleven själv gör stegen.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0 space-y-5">
          <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
            <Icon name={STEP_ICON[step.type]} size={40} className="shrink-0" />
            {step.title}
          </h1>
          {open && <MascotSays mood={step.type === "quiz" ? "tanker" : "glad"} size={56}>{SIGGE_INTRO[step.type]}</MascotSays>}
          {!open ? (
            <LockedNotice need={requiredTier(step, chapter.id)} what={STEP_LABELS[step.type]} />
          ) : step.type === "video" ? (
            <VideoStep chapter={chapter} videoUrl={step.videoUrl} description={step.description} />
          ) : step.type === "ovning" ? (
            <ExerciseStep step={step} />
          ) : step.type === "quiz" ? (
            <QuizStep key={`${step.id}-${step.questions?.length}-${step.custom}`} chapter={chapter} step={step} />
          ) : (
            <ScreeningStep chapter={chapter} />
          )}
        </div>
        {open && step.tools.length > 0 && (
          <aside className="lg:w-80">
            <div className="lg:sticky lg:top-20">
              <Toolbox tools={step.tools} />
            </div>
          </aside>
        )}
      </div>

      {/* Fast Nästa-rad längst ner */}
      <div className="sticky bottom-[4.5rem] z-20 -mx-4 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur lg:bottom-0 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 text-sm text-muted">
            <span className="font-semibold text-navy">
              Steg {stepIndex + 1} av {chapter.steps.length}
            </span>
            <span className="hidden sm:inline"> · {chapter.title}</span>
            {skipped.length > 0 && (
              <span className="block text-xs">
                Hoppar över {skipped.map((s) => STEP_LABELS[s.step.type].toLowerCase()).join(", ")} (ingår i {TIERS[requiredTier(skipped[0].step, skipped[0].chapter.id)].name})
              </span>
            )}
          </div>
          <button onClick={goNext} className="btn-primary text-lg">
            {next ? `Nästa: ${STEP_LABELS[next.step.type]} →` : "Tillbaka till kursplanen"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stepper({ chapter, current }: { chapter: Chapter; current: Step }) {
  const { state, tier, currentStudent } = useStore();
  const p = (currentStudent && state.progress[currentStudent.id]) || emptyProgress();
  return (
    <ol className="flex flex-wrap gap-2">
      {chapter.steps.map((s, i) => {
        const open = canAccess(tier, s, chapter.id);
        const active = s.id === current.id;
        const done = !!p.completed[s.id];
        return (
          <li key={s.id}>
            <Link
              href={stepHref(s.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                active ? "border-navy bg-navy text-white" : done ? "border-good/40 bg-good/10 text-good" : open ? "border-line bg-paper text-navy" : "border-dashed border-line text-muted"
              }`}
            >
              <span className="font-bold">{i + 1}</span>
              <Icon name={open ? STEP_ICON[s.type] : "las"} size={18} className={active ? "icon-invert" : ""} /> {STEP_LABELS[s.type]}
              {done && !active && " ✓"}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function VideoStep({ chapter, videoUrl, description }: { chapter: Chapter; videoUrl?: string; description?: string }) {
  const area = getArea(chapter.areaId);
  const yt = youtubeId(videoUrl);
  const about = description || BABBEL;
  return (
    <div className="space-y-4">
      {yt ? (
        <div className="mx-auto aspect-video max-w-3xl overflow-hidden rounded-2xl bg-ink shadow-md">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`}
            title={`Videolektion: ${chapter.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
      <div className="relative mx-auto grid aspect-video max-w-3xl place-items-center overflow-hidden rounded-2xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${area.color}, var(--color-navy))` }}>
        <Icon name={area.icon} size={160} className="icon-invert absolute -right-6 -top-6 opacity-15" />
        <div className="relative text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/20 text-4xl backdrop-blur">▶</div>
          <p className="mt-3 font-serif text-xl">Videolektion kommer snart</p>
          <p className="text-sm text-white/75">Här läggs lärarens video om ”{chapter.title}” in.</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/40 to-transparent px-4 pb-3 pt-8 text-xs">
          <span>0:00</span>
          <span className="h-1.5 flex-1 rounded-full bg-white/30">
            <span className="block h-full w-0 rounded-full bg-gold" />
          </span>
          <span>ca 5:00</span>
        </div>
      </div>
      )}
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-bold">Om lektionen</h2>
          <p className="mt-1 text-sm text-muted">
            {about} <ReadAloud text={about} />
          </p>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold">Det här lär du dig</h2>
          <ul className="mt-2 space-y-1.5 text-sm">
            {["Vad delmomentet handlar om", "Ett enkelt sätt att räkna", "Hur du kan använda det i vardagen"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Icon name="klar" size={18} /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ExerciseStep({ step }: { step: Step }) {
  const { state, update, currentStudent } = useStore();
  const sid = currentStudent?.id;
  const notes = (sid && state.progress[sid]?.notes) || {};
  const note = notes[step.id] || "";
  const drawing = notes[`${step.id}:ritning`];
  const done = sid && state.progress[sid]?.completed[step.id];
  const isStudent = state.session?.role === "elev";
  const setNote = (key: string, value: string) =>
    sid &&
    update((s) => {
      const p = s.progress[sid] ?? emptyProgress();
      return { ...s, progress: { ...s.progress, [sid]: { ...p, notes: { ...p.notes, [key]: value } } } };
    });
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-bold">Uppgifter</h2>
        <ol className="mt-3 space-y-3">
          {step.tasks!.map((t, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-cream p-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</span>
              <span>
                {t} <ReadAloud text={t} />
              </span>
            </li>
          ))}
        </ol>
      </div>
      <div className="card">
        <h2 className="mb-2 text-lg font-bold">Rita här</h2>
        <DrawPad key={step.id} value={drawing} disabled={!isStudent} onChange={(v) => setNote(`${step.id}:ritning`, v)} />
      </div>
      <label className="card block">
        <span className="text-lg font-bold text-navy">Skriv hur du tänkte</span>
        <textarea className="input mt-2 min-h-28" placeholder="Jag tänkte att…" value={note} disabled={!isStudent} onChange={(e) => setNote(step.id, e.target.value)} />
      </label>
      {done && (
        <p className="flex items-center gap-2 text-good">
          <Icon name="klar" size={20} /> Du har gjort den här övningen. Bra kämpat!
        </p>
      )}
    </div>
  );
}

/** Quiz med en fråga i taget och direkt, mjuk återkoppling. */
function QuizStep({ chapter, step }: { chapter: Chapter; step: Step }) {
  const { state, tier, currentStudent, saveQuiz } = useStore();
  const qs = step.questions!;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => qs.map(() => null));
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const feedback = quizFeedbackLevel(tier);
  const isStudent = state.session?.role === "elev";
  const q = qs[idx];
  const chosen = answers[idx];
  const isRight = chosen === q.correctIndex;

  const finish = () => {
    const byFocus: QuizResult["byFocus"] = {};
    let score = 0;
    qs.forEach((qq, i) => {
      byFocus[qq.focus] ??= { correct: 0, total: 0 };
      byFocus[qq.focus].total++;
      if (answers[i] === qq.correctIndex) {
        score++;
        byFocus[qq.focus].correct++;
      }
    });
    const r = { stepId: step.id, chapterId: chapter.id, score, total: qs.length, byFocus, date: new Date().toISOString() };
    setResult(r);
    if (isStudent && currentStudent) saveQuiz(currentStudent.id, r);
  };

  const restart = () => {
    setResult(null);
    setAnswers(qs.map(() => null));
    setIdx(0);
    setChecked(false);
  };

  if (result) {
    const ratio = result.score / result.total;
    return (
      <div className="pop-in mx-auto max-w-xl overflow-hidden rounded-3xl bg-paper text-center shadow-md ring-1 ring-line">
        <div className="bg-navy px-6 pb-6 pt-6 text-white">
          <div className="flex justify-center">
            <Mascot size={96} mood={ratio >= 0.6 ? "hurra" : "glad"} />
          </div>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-gold">{ratio >= 0.85 ? "Superbra!" : ratio >= 0.6 ? "Bra jobbat!" : "Bra kämpat!"}</p>
          <p className="font-serif text-4xl font-bold">
            {result.score} av {result.total} rätt
          </p>
        </div>
        <div className="p-6">
          <div className="flex justify-center gap-1.5">
            {qs.map((qq, i) => (
              <span key={qq.id} className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${answers[i] === qq.correctIndex ? "bg-good text-white" : "bg-gold-light text-gold-ink"}`}>
                {answers[i] === qq.correctIndex ? "✓" : i + 1}
              </span>
            ))}
          </div>
          {feedback === "kort" && (
            <p className="mt-4 flex items-start justify-center gap-2 text-left">
              <Icon name="prat" size={22} className="shrink-0" /> {shortComment(result)}
            </p>
          )}
          {feedback === "full" && (
            <p className="mt-4 flex items-start justify-center gap-2 text-left">
              <Icon name="prat" size={22} className="shrink-0" /> Gå vidare till din screening för att se vad du är stark på och vad du kan öva mer på.
            </p>
          )}
          <button className="btn-ghost mt-5" onClick={restart}>
            Gör om quizen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* framsteg */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          {qs.map((qq, i) => (
            <span
              key={qq.id}
              className={`h-2.5 flex-1 rounded-full transition-colors ${
                i < idx ? (answers[i] === qq.correctIndex ? "bg-good" : "bg-gold") : i === idx ? "bg-navy" : "bg-line"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-muted">
          {idx + 1} / {qs.length}
        </span>
      </div>

      <div key={q.id} className="pop-in rounded-3xl bg-paper p-6 shadow-sm ring-1 ring-line sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-wine">Fråga {idx + 1}</p>
        <p className="mt-1 font-serif text-3xl font-bold text-navy">
          {q.prompt} <ReadAloud text={q.prompt} />
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {q.options.map((o, oi) => {
            const sel = chosen === oi;
            const correct = oi === q.correctIndex;
            const style = checked
              ? correct
                ? "border-good bg-good/10 text-good"
                : sel
                  ? "border-gold bg-gold-light text-gold-ink"
                  : "border-line opacity-60"
              : sel
                ? "border-navy bg-navy text-white"
                : "border-line bg-paper hover:border-navy hover:bg-cream";
            return (
              <button
                key={oi}
                disabled={checked}
                onClick={() => setAnswers((a) => a.map((x, xi) => (xi === idx ? oi : x)))}
                className={`rounded-2xl border-2 px-4 py-5 text-2xl font-bold transition-all ${style}`}
                aria-pressed={sel}
              >
                {o}
              </button>
            );
          })}
        </div>

        {checked && (
          <div className={`pop-in mt-5 flex items-center gap-3 rounded-2xl p-4 ${isRight ? "bg-good/10" : "bg-gold-light/70"}`}>
            <Mascot size={56} mood={isRight ? "hurra" : "tanker"} />
            <div>
              <p className={`text-lg font-bold ${isRight ? "text-good" : "text-gold-ink"}`}>{isRight ? "Rätt!" : "Nästan!"}</p>
              <p className="text-sm">{isRight ? ["Snyggt räknat!", "Precis så!", "Du är på gång!"][idx % 3] : `Rätt svar är ${q.options[q.correctIndex]}. Det gör inget, nu vet du!`}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!checked ? (
            <button className="btn-accent !px-8 !py-3 text-lg" disabled={chosen === null} onClick={() => setChecked(true)}>
              Kolla svaret
            </button>
          ) : idx < qs.length - 1 ? (
            <button
              className="btn-primary !px-8 !py-3 text-lg"
              onClick={() => {
                setIdx((i) => i + 1);
                setChecked(false);
              }}
              autoFocus
            >
              Nästa fråga →
            </button>
          ) : (
            <button className="btn-primary !px-8 !py-3 text-lg" onClick={finish} autoFocus>
              Se resultatet →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ScreeningStep({ chapter }: { chapter: Chapter }) {
  const { state, currentStudent } = useStore();
  const p = (currentStudent && state.progress[currentStudent.id]) || emptyProgress();
  const latest = [...p.quizResults].reverse().find((r) => r.chapterId === chapter.id);
  const quiz = chapter.steps.find((s) => s.type === "quiz")!;

  if (!latest)
    return (
      <div className="card text-center">
        <p>Gör quizen först, så kan vi visa din screening.</p>
        <Link href={stepHref(quiz.id)} className="btn-primary mt-3">
          Till quizen
        </Link>
      </div>
    );

  const ratio = latest.score / latest.total;
  const parts = fullScreening(latest);
  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Hur det gick i ”{chapter.title}”</h2>
          <LevelChip level={levelOf(ratio)} />
        </div>
        <p className="mt-1 text-muted">
          {latest.score} av {latest.total} rätt. {shortComment(latest)}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {parts.map((x) => (
          <div key={x.focus} className="card">
            <div className="flex items-center justify-between">
              <b className="text-navy">{x.focus}</b>
              <LevelChip level={x.level} />
            </div>
            <div className="my-2">
              <ProgressBar value={x.ratio} />
            </div>
            <p className="text-sm text-muted">{x.comment}</p>
          </div>
        ))}
      </div>
      <Link href="/screening" className="btn-ghost">
        Se hela din screening för åk {chapter.grade} →
      </Link>
    </div>
  );
}
