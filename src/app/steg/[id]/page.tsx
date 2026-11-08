"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BABBEL, Chapter, STEP_ICONS, STEP_LABELS, Step, findStep, getArea } from "@/lib/curriculum";
import { nextAccessible, stepHref } from "@/lib/flow";
import { fullScreening, levelOf, shortComment } from "@/lib/screening";
import { QuizResult, emptyProgress, useStore } from "@/lib/store";
import { TIERS, canAccess, quizFeedbackLevel, requiredTier } from "@/lib/tiers";
import { LevelChip, LockedNotice, ProgressBar, ReadAloud, RequireLogin } from "@/components/ui";
import Toolbox from "@/components/tools/Toolbox";

export default function StepPage() {
  return (
    <RequireLogin>
      <StepView />
    </RequireLogin>
  );
}

function StepView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { state, tier, currentStudent, completeStep } = useStore();
  const found = findStep(id);
  if (!found) return <p>Steget finns inte.</p>;
  const { chapter, step } = found;
  const area = getArea(chapter.areaId);
  const open = canAccess(tier, step, chapter.id);
  const isStudent = state.session?.role === "elev";
  const studentId = currentStudent?.id;
  const { next, skipped } = nextAccessible(chapter.grade, tier, step.id);

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
        <p className="rounded-xl bg-gold-light/60 px-4 py-2 text-sm text-[#6b5410]">
          Du förhandsvisar som {state.session?.role === "admin" ? "admin" : "förälder"}. Framsteg sparas bara när eleven själv gör stegen.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <h1 className="text-3xl font-bold">
            {STEP_ICONS[step.type]} {step.title}
          </h1>
          {!open ? (
            <LockedNotice need={requiredTier(step, chapter.id)} what={STEP_LABELS[step.type]} />
          ) : step.type === "video" ? (
            <VideoStep chapter={chapter} />
          ) : step.type === "ovning" ? (
            <ExerciseStep step={step} />
          ) : step.type === "quiz" ? (
            <QuizStep key={step.id} chapter={chapter} step={step} />
          ) : (
            <ScreeningStep chapter={chapter} />
          )}
        </div>
        {open && step.tools.length > 0 && (
          <aside className="lg:w-80">
            <Toolbox tools={step.tools} />
          </aside>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <div className="text-sm text-muted">
          {skipped.length > 0 && (
            <span>
              Hoppar över {skipped.map((s) => STEP_LABELS[s.step.type].toLowerCase()).join(", ")} (ingår i{" "}
              {TIERS[requiredTier(skipped[0].step, skipped[0].chapter.id)].name}).
            </span>
          )}
        </div>
        <button onClick={goNext} className="btn-primary text-lg">
          {next ? `Nästa: ${STEP_LABELS[next.step.type]} →` : "Tillbaka till kursplanen"}
        </button>
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
              {open ? STEP_ICONS[s.type] : "🔒"} {STEP_LABELS[s.type]}
              {done && !active && " ✓"}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function VideoStep({ chapter }: { chapter: Chapter }) {
  return (
    <div className="space-y-4">
      <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-light text-white">
        <div className="text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/15 text-4xl">▶</div>
          <p className="mt-3 font-serif text-xl">Videolektion kommer snart</p>
          <p className="text-sm text-white/70">Här läggs lärarens video om ”{chapter.title}” in.</p>
        </div>
        <span className="absolute bottom-3 right-3 rounded bg-black/40 px-2 py-0.5 text-xs">ca 5 min</span>
      </div>
      <div className="card">
        <h2 className="text-lg font-bold">Om lektionen</h2>
        <p className="mt-1 text-muted">
          {BABBEL} <ReadAloud text={BABBEL} />
        </p>
      </div>
    </div>
  );
}

function ExerciseStep({ step }: { step: Step }) {
  const { state, update, currentStudent } = useStore();
  const sid = currentStudent?.id;
  const note = (sid && state.progress[sid]?.notes[step.id]) || "";
  const done = sid && state.progress[sid]?.completed[step.id];
  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-muted">Gör uppgifterna nedan. Det finns inget rätt eller fel här, det viktiga är att du provar och visar hur du tänker.</p>
        <ol className="mt-4 space-y-3">
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
      <label className="card block">
        <span className="font-semibold text-navy">Mina anteckningar</span>
        <textarea
          className="input mt-2 min-h-28"
          placeholder="Skriv hur du tänkte här…"
          value={note}
          disabled={state.session?.role !== "elev"}
          onChange={(e) =>
            sid &&
            update((s) => {
              const p = s.progress[sid] ?? emptyProgress();
              return { ...s, progress: { ...s.progress, [sid]: { ...p, notes: { ...p.notes, [step.id]: e.target.value } } } };
            })
          }
        />
      </label>
      {done && <p className="text-good">✓ Du har gjort den här övningen. Bra kämpat!</p>}
    </div>
  );
}

function QuizStep({ chapter, step }: { chapter: Chapter; step: Step }) {
  const { state, tier, currentStudent, saveQuiz } = useStore();
  const qs = step.questions!;
  const [answers, setAnswers] = useState<(number | null)[]>(() => qs.map(() => null));
  const [result, setResult] = useState<QuizResult | null>(null);
  const feedback = quizFeedbackLevel(tier);
  const isStudent = state.session?.role === "elev";

  const submit = () => {
    const byFocus: QuizResult["byFocus"] = {};
    let score = 0;
    qs.forEach((q, i) => {
      byFocus[q.focus] ??= { correct: 0, total: 0 };
      byFocus[q.focus].total++;
      if (answers[i] === q.correctIndex) {
        score++;
        byFocus[q.focus].correct++;
      }
    });
    const r = { stepId: step.id, chapterId: chapter.id, score, total: qs.length, byFocus, date: new Date().toISOString() };
    setResult(r);
    if (isStudent && currentStudent) saveQuiz(currentStudent.id, r);
  };

  return (
    <div className="space-y-4">
      {qs.map((q, i) => (
        <fieldset key={q.id} className="card">
          <legend className="sr-only">Fråga {i + 1}</legend>
          <p className="font-semibold">
            {i + 1}. {q.prompt} <ReadAloud text={q.prompt} />
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {q.options.map((o, oi) => {
              const chosen = answers[i] === oi;
              const show = !!result;
              const correct = oi === q.correctIndex;
              return (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 ${
                    show && correct ? "border-good bg-good/10" : show && chosen ? "border-warn bg-warn/10" : chosen ? "border-navy bg-navy/5" : "border-line hover:bg-cream"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={chosen}
                    disabled={show}
                    onChange={() => setAnswers((a) => a.map((x, xi) => (xi === i ? oi : x)))}
                    className="accent-navy"
                  />
                  {o}
                  {show && correct && <span className="ml-auto text-good">✓</span>}
                  {show && chosen && !correct && <span className="ml-auto text-sm text-warn">Inte riktigt</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {!result ? (
        <button className="btn-accent" disabled={answers.some((a) => a === null)} onClick={submit}>
          Rätta quizen
        </button>
      ) : (
        <div className="card border-navy">
          <p className="text-4xl" aria-hidden>
            {result.score / result.total >= 0.85 ? "🎉" : result.score / result.total >= 0.6 ? "🌟" : "💪"}
          </p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-wine">
            {result.score / result.total >= 0.85 ? "Superbra!" : result.score / result.total >= 0.6 ? "Bra jobbat!" : "Bra kämpat!"}
          </p>
          <p className="font-serif text-4xl font-bold text-navy">
            {result.score} av {result.total} rätt
          </p>
          <div className="mt-2">
            <ProgressBar value={result.score / result.total} color="var(--color-wine)" />
          </div>
          {feedback === "kort" && <p className="mt-3">💬 {shortComment(result)}</p>}
          {feedback === "full" && <p className="mt-3">💬 Gå vidare till din screening för att se vad du är stark på och vad du kan öva mer på.</p>}
          <button className="btn-ghost mt-4" onClick={() => (setResult(null), setAnswers(qs.map(() => null)))}>
            Gör om quizen
          </button>
        </div>
      )}
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
