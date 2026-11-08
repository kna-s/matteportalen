"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useState } from "react";
import { AREAS, Area, Chapter, GRADES, Grade, LATEST_MONTH, STEP_ICON, Step, StepType, chaptersFor, getArea, getChapter } from "@/lib/curriculum";
import { stepHref } from "@/lib/flow";
import { QuizResult, emptyProgress, latestQuizPerChapter, useStore } from "@/lib/store";
import { TIERS, canAccess, requiredTier } from "@/lib/tiers";
import { mergeStep, useContent, youtubeId } from "@/lib/content";

interface CardProps {
  type: StepType;
  area: Area;
  chapter: Chapter;
  step: Step & { videoUrl?: string; custom?: boolean };
  open: boolean;
  done: boolean;
  quiz?: QuizResult;
  reason?: string;
}

function Thumb({ area, step, open, className = "" }: { area: Area; step: CardProps["step"]; open: boolean; className?: string }) {
  const yt = youtubeId(step.videoUrl);
  return (
    <div className={`relative grid place-items-center overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${area.color}33, ${area.color}88)` }}>
      {yt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://i.ytimg.com/vi/${yt}/mqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Icon name={area.icon} size={110} className="absolute -bottom-8 -left-6 opacity-20" />
      )}
      <span className="relative grid h-11 w-11 place-items-center rounded-full bg-paper/95 text-lg text-navy shadow transition-transform group-hover:scale-110">
        {open ? <span className="ml-0.5">▶</span> : <Icon name="las" size={22} />}
      </span>
    </div>
  );
}

/** Kompakt kort i en rad som man bläddrar i sidled. */
function SmallCard(c: CardProps) {
  const isNew = c.step.publishedMonth === LATEST_MONTH;
  return (
    <Link
      href={stepHref(c.step.id)}
      className={`group flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-line transition-all hover:-translate-y-0.5 hover:shadow-md ${c.open ? "" : "opacity-75"}`}
    >
      {c.type === "video" ? (
        <Thumb area={c.area} step={c.step} open={c.open} className="aspect-video" />
      ) : (
        <div className="flex h-16 items-center gap-3 px-4" style={{ background: `${c.area.color}14` }}>
          <Icon name={c.open ? STEP_ICON[c.type] : "las"} size={28} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-3">
        <b className="text-sm leading-tight text-navy">{c.chapter.title}</b>
        <span className="mt-auto flex flex-wrap gap-1.5 pt-2 text-xs">
          {c.done && <span className="rounded-md bg-good/15 px-1.5 py-0.5 font-semibold text-good">✓ Klar</span>}
          {c.quiz && <span className="rounded-md bg-cream px-1.5 py-0.5 font-semibold text-navy">{c.quiz.score}/{c.quiz.total}</span>}
          {isNew && !c.done && <span className="rounded-md bg-wine px-1.5 py-0.5 font-bold text-white">Ny</span>}
          {!c.open && <span className="font-semibold text-wine">{TIERS[requiredTier(c.step, c.chapter.id)].name}</span>}
        </span>
      </div>
    </Link>
  );
}

/** Förslag: en rad med ikon, titel och anledning. */
function SuggestionRow(c: CardProps) {
  return (
    <Link href={stepHref(c.step.id)} className="group flex items-center gap-3 rounded-2xl bg-paper p-3 ring-1 ring-line transition-all hover:-translate-y-0.5 hover:shadow-md">
      {c.type === "video" ? (
        <Thumb area={c.area} step={c.step} open={c.open} className="aspect-video w-24 shrink-0 rounded-xl" />
      ) : (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: `${c.area.color}1f` }}>
          <Icon name={STEP_ICON[c.type]} size={28} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <b className="block leading-tight text-navy">{c.chapter.title}</b>
        <span className="text-xs text-muted">{c.reason}</span>
      </span>
      <span className="text-muted transition-transform group-hover:translate-x-0.5" aria-hidden>
        →
      </span>
    </Link>
  );
}

/** Sidan för alla videor, övningar eller quiz – lugn och med få val åt gången. */
export default function StepTypeList({ type }: { type: StepType }) {
  const { state, tier, currentStudent } = useStore();
  const [grade, setGrade] = useState<Grade>(currentStudent?.grade ?? 4);
  const p = (currentStudent && state.progress[currentStudent.id]) || emptyProgress();
  const latest = latestQuizPerChapter(p);
  const { rows } = useContent();

  const make = (c: Chapter, reason?: string): CardProps => {
    const area = getArea(c.areaId);
    const s = mergeStep(c.steps.find((x) => x.type === type)!, rows[`${c.id}-${type}`]);
    return { type, area, chapter: c, step: s, open: canAccess(tier, s, c.id), done: !!p.completed[s.id], quiz: type === "quiz" ? latest.get(c.id) : undefined, reason };
  };

  const all = chaptersFor(grade).map((c) => make(c));
  const cont = all.find((x) => x.open && !x.done);

  // Förslag: aktuellt från föräldern, sådant som behöver övas och nytt material.
  const seen = new Set<string>(cont ? [cont.chapter.id] : []);
  const suggestions: CardProps[] = [];
  const add = (c: Chapter | undefined, reason: string) => {
    if (!c || c.grade !== grade || seen.has(c.id) || suggestions.length >= 3) return;
    const card = make(c, reason);
    if (!card.open) return;
    seen.add(c.id);
    suggestions.push(card);
  };
  if (currentStudent) (state.aktuellt[currentStudent.id] ?? []).forEach((id) => add(getChapter(id), "Aktuellt just nu"));
  if (type !== "ovning")
    [...latest.values()].filter((r) => r.score / r.total < 0.6).forEach((r) => add(getChapter(r.chapterId), type === "video" ? "Bra att titta på igen" : "Testa igen och slå ditt resultat"));
  all.filter((x) => x.step.publishedMonth === LATEST_MONTH && !x.done).forEach((x) => add(x.chapter, "Nytt denna månad"));

  const [openArea, setOpenArea] = useState<string | null>(cont?.area.id ?? null);
  const word = { video: "videon", ovning: "övningen", quiz: "quizen", screening: "" }[type];

  return (
    <div className="space-y-8">
      {/* Årskurs som liten väljare */}
      <div className="-mt-2 flex justify-end">
        <label className="flex items-center gap-2 text-sm text-muted">
          Årskurs
          <select className="rounded-lg border border-line bg-paper px-2 py-1 font-semibold text-navy" value={grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)}>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Fortsätt */}
      {cont ? (
        <Link href={stepHref(cont.step.id)} className="group grid overflow-hidden rounded-3xl bg-navy text-white shadow-lg transition-shadow hover:shadow-xl sm:grid-cols-[minmax(0,320px)_1fr]">
          {type === "video" ? (
            <Thumb area={cont.area} step={cont.step} open className="aspect-video sm:aspect-auto sm:min-h-44" />
          ) : (
            <div className="grid min-h-32 place-items-center" style={{ background: `${cont.area.color}55` }}>
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-paper shadow">
                <Icon name={STEP_ICON[type]} size={48} />
              </span>
            </div>
          )}
          <div className="flex flex-col justify-center p-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-gold">Fortsätt här</p>
            <h2 className="mt-1 text-2xl font-bold !text-white">{cont.chapter.title}</h2>
            <p className="text-sm text-white/70">{cont.area.title}</p>
            <span className="btn mt-4 self-start bg-gold text-navy group-hover:bg-gold-light">Starta {word} →</span>
          </div>
        </Link>
      ) : (
        <div className="rounded-3xl bg-good/10 p-6 text-center">
          <p className="text-lg font-bold text-good">Du har gjort allt här i årskurs {grade}! 🎉</p>
        </div>
      )}

      {/* Förslag */}
      {suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Förslag till dig</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {suggestions.map((x) => (
              <SuggestionRow key={x.chapter.id} {...x} />
            ))}
          </div>
        </section>
      )}

      {/* Alla områden, ett i taget */}
      <section>
        <h2 className="mb-3 text-lg font-bold">{{ video: "Alla videor", ovning: "Alla övningar", quiz: "Alla quiz", screening: "" }[type]}</h2>
        <div className="divide-y divide-line overflow-hidden rounded-3xl bg-paper ring-1 ring-line">
          {AREAS.map((a) => {
            const items = all.filter((x) => x.area.id === a.id);
            const doneCount = items.filter((x) => x.done).length;
            const isOpen = openArea === a.id;
            return (
              <div key={a.id}>
                <button onClick={() => setOpenArea(isOpen ? null : a.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-cream" aria-expanded={isOpen}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${a.color}1f` }}>
                    <Icon name={a.icon} size={26} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy">{a.title}</span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
                        <span className="block h-full rounded-full" style={{ width: `${(doneCount / items.length) * 100}%`, background: a.color }} />
                      </span>
                      <span className="text-xs text-muted">
                        {doneCount} av {items.length}
                      </span>
                    </span>
                  </span>
                  <span className={`text-xl text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden>
                    ⌄
                  </span>
                </button>
                {isOpen && (
                  <div className="flex snap-x gap-3 overflow-x-auto bg-cream/60 px-4 py-4">
                    {items.map((x) => (
                      <SmallCard key={x.chapter.id} {...x} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
