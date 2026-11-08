"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BABBEL, Chapter, STEP_ICON, STEP_LABELS, Step, findStep, getArea } from "@/lib/curriculum";
import { nextAccessible, stepHref } from "@/lib/flow";
import { fullScreening, levelOf, shortComment } from "@/lib/screening";
import { QuizResult, emptyProgress, useStore } from "@/lib/store";
import { TIERS, canAccess, quizFeedbackLevel, requiredTier } from "@/lib/tiers";
import { LockedNotice, ReadAloud, RequireLogin } from "@/components/ui";
import Toolbox from "@/components/tools/Toolbox";
import { MergedStep, monthLabel, useVersions, youtubeId } from "@/lib/content";
import Mascot, { MascotSays, Mood } from "@/components/Mascot";
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

const INTRO_MOOD: Record<Step["type"], Mood> = { video: "pekar", ovning: "nickar", quiz: "tanker", screening: "laser" };

/** Varierade svar från Sigge så att det inte blir tjatigt. */
const RIGHT = [
  { title: "Rätt!", line: "Snyggt räknat!" },
  { title: "Precis!", line: "Där satt den." },
  { title: "Ja, rätt!", line: "Du är på gång nu!" },
  { title: "Helt rätt!", line: "Det där kan du." },
  { title: "Bra!", line: "Smart tänkt!" },
  { title: "Rätt svar!", line: "Fortsätt så!" },
];
const WRONG = [
  { title: "Nästan!", line: "Rätt svar är {svar}. Nu vet du till nästa gång." },
  { title: "Inte riktigt", line: "Det var {svar}. Bra att du testade!" },
  { title: "Oj, nära!", line: "Svaret är {svar}. Alla gör fel ibland, så lär vi oss." },
  { title: "Hmm, inte den", line: "Rätt var {svar}. Kika gärna på videon igen sen." },
  { title: "Nästan där!", line: "Det blir {svar}. Du kommer att fixa den nästa gång." },
  { title: "Bra försök!", line: "Rätt svar är {svar}. Ta det lugnt, vi tar nästa." },
];
const RIGHT_MOODS: Mood[] = ["hurra", "dansar", "forvanad"];
const WRONG_MOODS: Mood[] = ["tanker", "nickar"];
const pick = <T,>(list: T[], avoid?: T) => {
  const options = list.filter((x) => x !== avoid);
  return options[Math.floor(Math.random() * options.length)];
};

function StepView() {
  const { id } = useParams<{ id: string }>();
  const found = findStep(id);
  if (!found) return <p>Steget finns inte.</p>;
  return <StepInner key={id} chapter={found.chapter} baseStep={found.step} />;
}

/** Lista med versioner (nyaste först) som eleven kan växla mellan. */
function VersionPicker({ versions, active, onPick, label }: { versions: MergedStep[]; active: number; onPick: (i: number) => void; label: string }) {
  if (versions.length < 2) return null;
  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-paper p-4 ring-1 ring-line">
      <p className="text-sm font-bold text-navy">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {versions.map((v, i) => (
          <button
            key={v.versionId}
            onClick={() => onPick(i)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium ring-1 ${i === active ? "bg-navy text-white ring-navy" : "bg-cream text-navy ring-line hover:bg-gold-light"}`}
          >
            {i === 0 ? "Nyaste" : `Från ${monthLabel(v.publishedMonth)}`}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepInner({ chapter, baseStep }: { chapter: Chapter; baseStep: Step }) {
  const router = useRouter();
  const { state, tier, currentStudent, completeStep } = useStore();
  const versions = useVersions(baseStep);
  const [vIdx, setVIdx] = useState(0);
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("v");
    const i = versions.findIndex((x) => x.versionId === v);
    if (i > 0) setVIdx(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versions.length]);
  const step = versions[vIdx] ?? versions[0];
  const area = getArea(chapter.areaId);
  const open = canAccess(tier, step, chapter.id);
  const isStudent = state.session?.role === "elev";
  const studentId = currentStudent?.id;
  const { next, skipped } = nextAccessible(chapter.grade, tier, step.id);
  const stepIndex = chapter.steps.findIndex((s) => s.id === step.id);

  const ex = step.type === "ovning" ? exerciseProgress(step, (studentId && state.progress[studentId]?.notes) || {}) : null;
  const blocked = !!ex && open && isStudent && ex.done < ex.total;
  const goNext = () => {
    if (blocked) return;
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
          {open && step.type !== "screening" && <MascotSays mood={INTRO_MOOD[step.type]} size={56}>{SIGGE_INTRO[step.type]}</MascotSays>}
          {!open ? (
            <LockedNotice need={requiredTier(step, chapter.id)} what={STEP_LABELS[step.type]} />
          ) : step.type === "video" ? (
            <>
              <VideoStep key={step.versionId} chapter={chapter} videoUrl={step.videoUrl} description={step.description} />
              <VersionPicker versions={versions} active={vIdx} onPick={setVIdx} label="Tidigare videor om samma sak" />
            </>
          ) : step.type === "ovning" ? (
            <ExerciseStep key={step.versionId} step={step} />
          ) : step.type === "quiz" ? (
            <>
              <QuizStep
                key={`${step.versionId}-${step.questions?.length}`}
                chapter={chapter}
                step={step}
                others={versions.map((v, i) => ({ i, label: i === 0 ? "Nyaste quizen" : `Quiz från ${monthLabel(v.publishedMonth)}` })).filter((x) => x.i !== vIdx)}
                onPickOther={(i) => {
                  setVIdx(i);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
              <VersionPicker versions={versions} active={vIdx} onPick={setVIdx} label="Tidigare quiz om samma sak" />
            </>
          ) : (
            <ScreeningStep chapter={chapter} onNext={goNext} nextTitle={next?.chapter.id !== chapter.id ? next?.chapter.title : undefined} />
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
          {blocked && <span className="text-sm font-semibold text-wine">Svara på alla uppgifter först ({ex!.done}/{ex!.total})</span>}
          <button onClick={goNext} disabled={blocked} className="btn-primary text-lg">
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

const isDrawTask = (t: string) => /\brit(a|ar|ning|ningen|ningar)\b/i.test(t);
const drawKey = (stepId: string, i: number) => `${stepId}:ritning:${i}`;

/** Hur många uppgifter i en övning som eleven har svarat på (text eller teckning). */
function exerciseProgress(step: Step, notes: Record<string, string>) {
  const tasks = step.tasks ?? [];
  const answered = tasks.map((_, i) => !!notes[`${step.id}:svar:${i}`]?.trim() || !!notes[drawKey(step.id, i)]);
  return { answered, done: answered.filter(Boolean).length, total: tasks.length };
}

function ExerciseStep({ step }: { step: Step }) {
  const { state, update, currentStudent } = useStore();
  const sid = currentStudent?.id;
  const notes = (sid && state.progress[sid]?.notes) || {};
  const isStudent = state.session?.role === "elev";
  const { answered, done, total } = exerciseProgress(step, notes);
  const [drawOpen, setDrawOpen] = useState<number[]>(() => (step.tasks ?? []).map((t, i) => (isDrawTask(t) || notes[drawKey(step.id, i)] ? i : -1)).filter((i) => i >= 0));
  const setNote = (key: string, value: string) =>
    sid &&
    update((s) => {
      const p = s.progress[sid] ?? emptyProgress();
      return { ...s, progress: { ...s.progress, [sid]: { ...p, notes: { ...p.notes, [key]: value } } } };
    });
  return (
    <div className="space-y-4">
      {!isStudent && (
        <p className="rounded-2xl bg-cream px-4 py-3 text-sm text-muted">
          Svarsfält och rityta är låsta i förhandsvisningen. Logga in som elev för att svara och rita.
        </p>
      )}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          {answered.map((a, i) => (
            <span key={i} className={`h-2.5 flex-1 rounded-full transition-colors ${a ? "bg-good" : "bg-line"}`} />
          ))}
        </div>
        <span className="text-sm font-semibold text-muted">
          {done} / {total} klara
        </span>
      </div>
      {step.tasks!.map((t, i) => {
        const open = drawOpen.includes(i);
        return (
          <div key={i} className={`card transition-shadow ${answered[i] ? "ring-2 ring-good/40" : ""}`}>
            <div className="flex gap-3">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-white ${answered[i] ? "bg-good" : "bg-navy"}`}>
                {answered[i] ? "✓" : i + 1}
              </span>
              <p className="flex-1 pt-1 font-semibold">
                {t} <ReadAloud text={t} />
              </p>
              <button
                type="button"
                onClick={() => setDrawOpen((d) => (open ? d.filter((x) => x !== i) : [...d, i]))}
                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold ${open ? "icon-invert bg-navy text-white" : "bg-cream text-navy hover:bg-gold-light"}`}
                aria-pressed={open}
              >
                <Icon name="ovning" size={18} /> Rita
              </button>
            </div>
            {open && (
              <div className="mt-3">
                <DrawPad key={`${step.id}-${i}`} value={notes[drawKey(step.id, i)]} disabled={!isStudent} onChange={(v) => setNote(drawKey(step.id, i), v)} />
              </div>
            )}
            <textarea
              className="input mt-3 min-h-20"
              placeholder={open ? "Rita ovan eller skriv här…" : "Skriv ditt svar eller hur du tänkte…"}
              value={notes[`${step.id}:svar:${i}`] ?? ""}
              disabled={!isStudent}
              onChange={(e) => setNote(`${step.id}:svar:${i}`, e.target.value)}
              aria-label={`Svar på uppgift ${i + 1}`}
            />
          </div>
        );
      })}
      {done === total && total > 0 && (
        <p className="pop-in flex items-center gap-2 font-semibold text-good">
          <Icon name="klar" size={22} /> Alla uppgifter klara! Klicka på Nästa.
        </p>
      )}
    </div>
  );
}

/** Quiz med en fråga i taget och direkt, mjuk återkoppling. */
function QuizStep({
  chapter,
  step,
  others = [],
  onPickOther,
}: {
  chapter: Chapter;
  step: Step;
  others?: { i: number; label: string }[];
  onPickOther?: (i: number) => void;
}) {
  const { state, tier, currentStudent, saveQuiz } = useStore();
  const qs = step.questions!;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => qs.map(() => null));
  const [checked, setChecked] = useState(false);
  const [reply, setReply] = useState<{ title: string; line: string; mood: Mood } | null>(null);
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
            <Mascot size={96} mood={ratio >= 0.85 ? "dansar" : ratio >= 0.6 ? "hurra" : "nickar"} />
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
          {ratio < 0.6 && (
            <div className="mt-5 rounded-2xl bg-gold-light/60 p-4 text-left">
              <div className="flex items-start gap-3">
                <Mascot mood="glad" size={52} />
                <div className="flex-1">
                  <p className="font-semibold text-navy">Vill du öva lite till på samma sak?</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href={stepHref(chapter.steps.find((s) => s.type === "video")!.id)} className="btn-ghost !px-3 !py-1.5 text-sm">
                      Se videon igen
                    </Link>
                    {others.map((o) => (
                      <button key={o.i} onClick={() => onPickOther?.(o.i)} className="btn-accent !px-3 !py-1.5 text-sm">
                        Testa {o.label.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
            <Mascot size={56} mood={reply?.mood ?? (isRight ? "hurra" : "tanker")} />
            <div>
              <p className={`text-lg font-bold ${isRight ? "text-good" : "text-gold-ink"}`}>{reply?.title}</p>
              <p className="text-sm">{reply?.line}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!checked ? (
            <button className="btn-accent !px-8 !py-3 text-lg" disabled={chosen === null} onClick={() => {
                const right = chosen === q.correctIndex;
                const msg = pick(right ? RIGHT : WRONG, reply ? (right ? RIGHT : WRONG).find((m) => m.title === reply.title) : undefined);
                setReply({ ...msg, line: msg.line.replace("{svar}", q.options[q.correctIndex]), mood: pick(right ? RIGHT_MOODS : WRONG_MOODS) });
                setChecked(true);
              }}>
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

const FOCUS_TEXT: Record<string, { title: string; icon: "ovning" | "kalkylator" | "problemlosning" }> = {
  Begrepp: { title: "Förstå begreppen", icon: "ovning" },
  Metod: { title: "Räkna på rätt sätt", icon: "kalkylator" },
  Tillämpning: { title: "Använda det i vardagen", icon: "problemlosning" },
};

/** Screening för ett kapitel: Sigge berättar hur det gick och vad vi gör nu. */
function ScreeningStep({ chapter, onNext, nextTitle }: { chapter: Chapter; onNext: () => void; nextTitle?: string }) {
  const { state, tier, currentStudent } = useStore();
  const p = (currentStudent && state.progress[currentStudent.id]) || emptyProgress();
  const latest = [...p.quizResults].reverse().find((r) => r.chapterId === chapter.id);
  const quiz = chapter.steps.find((s) => s.type === "quiz")!;
  const video = chapter.steps.find((s) => s.type === "video")!;
  const area = getArea(chapter.areaId);

  if (!latest)
    return (
      <div className="rounded-3xl bg-paper p-8 text-center ring-1 ring-line">
        <div className="flex justify-center">
          <Mascot mood="pekar" size={100} />
        </div>
        <p className="mt-2 text-lg font-semibold">Gör quizen först, så kan jag berätta hur det gick!</p>
        <Link href={stepHref(quiz.id)} className="btn-accent mt-4">
          Till quizen →
        </Link>
      </div>
    );

  const ratio = latest.score / latest.total;
  const level = levelOf(ratio);
  const parts = fullScreening(latest);
  const head =
    level === "stark"
      ? { title: "Du kan det här!", text: "Riktigt snyggt jobbat. Du har koll på det här kapitlet.", mood: "dansar" as Mood }
      : level === "okej"
        ? { title: "Nästan där!", text: "Det mesta sitter redan. Lite till så har du full koll.", mood: "nickar" as Mood }
        : { title: "Vi övar lite till", text: "Det här var klurigt, och det är helt okej. Vi tar det steg för steg.", mood: "laser" as Mood };
  const otherSteps = chapter.steps.filter((s) => s.type !== "screening" && canAccess(tier, s, chapter.id));
  const screeningStep = chapter.steps.find((s) => s.type === "screening")!;
  const keyFound = !!p.completed[screeningStep.id];
  const keyNext = !keyFound && otherSteps.every((s) => p.completed[s.id]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Resultat */}
      <div className="pop-in overflow-hidden rounded-3xl bg-navy text-white shadow-md">
        <div className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <Mascot mood={head.mood} size={110} />
          <div className="flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">{head.title}</p>
            <p className="mt-1 font-serif text-3xl font-bold">
              {latest.score} av {latest.total} rätt
            </p>
            <div className="mt-2 flex justify-center gap-1.5 sm:justify-start">
              {Array.from({ length: latest.total }, (_, k) => (
                <span key={k} className={`h-3 w-7 rounded-full ${k < latest.score ? "bg-gold" : "bg-white/20"}`} />
              ))}
            </div>
            <p className="mt-3 text-white/80">{head.text}</p>
          </div>
        </div>
      </div>

      {/* Så gick det, del för del */}
      <div className="grid gap-3 sm:grid-cols-3">
        {parts.map((x) => {
          const f = FOCUS_TEXT[x.focus] ?? { title: x.focus, icon: "ovning" as const };
          const look =
            x.level === "stark"
              ? { badge: "stjarna" as const, label: "Sitter!", cls: "bg-good/10 ring-good/20", text: "text-good" }
              : x.level === "okej"
                ? { badge: "klar" as const, label: "Nästan", cls: "bg-gold-light/60 ring-gold/30", text: "text-gold-ink" }
                : { badge: "mal" as const, label: "Öva mer", cls: "bg-wine/10 ring-wine/20", text: "text-wine" };
          return (
            <div key={x.focus} className={`rounded-3xl p-4 ring-1 ${look.cls}`}>
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-paper shadow-sm">
                  <Icon name={f.icon} size={26} />
                </span>
                <span className={`flex items-center gap-1 text-sm font-bold ${look.text}`}>
                  <Icon name={look.badge} size={18} /> {look.label}
                </span>
              </div>
              <p className="mt-3 font-bold leading-tight text-navy">{f.title}</p>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: x.total }, (_, k) => (
                  <span key={k} className={`h-2 flex-1 rounded-full ${k < x.correct ? "bg-good" : "bg-paper"}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vad gör vi nu? */}
      <div className="rounded-3xl bg-paper p-5 ring-1 ring-line">
        <h2 className="text-lg font-bold">Vad gör vi nu?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {level === "ova" && (
            <Link href={stepHref(video.id)} className="btn-accent">
              <Icon name="video" size={20} className="icon-invert" /> Se videon igen
            </Link>
          )}
          {level === "okej" && (
            <Link href={stepHref(quiz.id)} className="btn-ghost">
              <Icon name="quiz" size={20} /> Gör om quizen
            </Link>
          )}
          <button onClick={onNext} className={level === "ova" ? "btn-ghost" : "btn-accent"}>
            {nextTitle ? (level === "ova" ? `Fortsätt ändå till ${nextTitle}` : `Fortsätt till ${nextTitle}`) : "Fortsätt"} →
          </button>
        </div>
        {keyFound && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-good/10 px-4 py-3 text-sm font-semibold text-good">
            <Icon name="nyckel" size={24} /> Du har redan hittat nyckeln i det här kapitlet.
          </p>
        )}
        {keyNext && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-gold-light/60 px-4 py-3 text-sm font-semibold text-navy">
            <Icon name="nyckel" size={24} /> När du fortsätter hittar du en nyckel till ön {area.title}!
          </p>
        )}
      </div>
    </div>
  );
}
