"use client";

import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useState } from "react";
import { AREAS, Area, Chapter, GRADES, Grade, LATEST_MONTH, STEP_ICON, Step, StepType, chaptersFor } from "@/lib/curriculum";
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
}

function VideoCard({ area, chapter, step, open, done }: CardProps) {
  const isNew = step.publishedMonth === LATEST_MONTH;
  const yt = youtubeId(step.videoUrl);
  return (
    <Link href={stepHref(step.id)} className="group flex flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-line transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative grid aspect-video place-items-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${area.color}33, ${area.color}88)` }}>
        {yt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`https://i.ytimg.com/vi/${yt}/mqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <Icon name={area.icon} size={120} className="absolute -bottom-8 -left-6 opacity-20 transition-transform group-hover:scale-105" />
        )}
        <span className={`relative grid h-14 w-14 place-items-center rounded-full shadow-md transition-transform group-hover:scale-110 ${open ? "bg-paper text-2xl text-navy" : "bg-paper/80"}`}>
          {open ? <span className="ml-1">▶</span> : <Icon name="las" size={28} />}
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-xs font-semibold text-white">5 min</span>
        {isNew && <span className="absolute left-2 top-2 rounded-md bg-wine px-2 py-0.5 text-xs font-bold text-white">Ny</span>}
        {done && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-good px-2 py-0.5 text-xs font-bold text-white">
            ✓ Sedd
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <b className="leading-tight text-navy">{step.custom && step.title ? step.title.replace(/^Videolektion: /, "") : chapter.title}</b>
        <span className="mt-1 text-xs text-muted">{area.title}</span>
        {!open && <span className="mt-auto pt-2 text-xs font-semibold text-wine">Ingår i {TIERS[requiredTier(step, chapter.id)].name}</span>}
      </div>
    </Link>
  );
}

function TaskCard({ type, area, chapter, step, open, done, quiz }: CardProps) {
  const isNew = step.publishedMonth === LATEST_MONTH;
  return (
    <Link
      href={stepHref(step.id)}
      className={`group flex items-center gap-4 rounded-2xl bg-paper p-4 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md ${open ? "ring-line" : "ring-dashed ring-line opacity-80"}`}
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: `${area.color}1f` }}>
        <Icon name={open ? STEP_ICON[type] : "las"} size={32} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <b className="leading-tight text-navy">{chapter.title}</b>
          {isNew && <span className="chip shrink-0 bg-wine text-white">Ny</span>}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{area.title}</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          {done && <span className="rounded-md bg-good/15 px-1.5 py-0.5 font-semibold text-good">✓ Klar</span>}
          {quiz && (
            <span className="rounded-md bg-cream px-1.5 py-0.5 font-semibold text-navy">
              Senast {quiz.score}/{quiz.total}
            </span>
          )}
          {!open && <span className="font-semibold text-wine">Ingår i {TIERS[requiredTier(step, chapter.id)].name}</span>}
        </span>
      </span>
      <span className="text-xl text-muted transition-transform group-hover:translate-x-0.5" aria-hidden>
        →
      </span>
    </Link>
  );
}

/** Lista över alla steg av en viss typ (alla videor, alla övningar, alla quiz). */
export default function StepTypeList({ type }: { type: StepType }) {
  const { state, tier, currentStudent } = useStore();
  const [grade, setGrade] = useState<Grade>(currentStudent?.grade ?? 4);
  const [areaId, setAreaId] = useState<string>("alla");
  const p = (currentStudent && state.progress[currentStudent.id]) || emptyProgress();
  const latest = latestQuizPerChapter(p);
  const { rows } = useContent();

  const areas = AREAS.filter((a) => areaId === "alla" || a.id === areaId);
  const props = (a: Area, c: Chapter): CardProps => {
    const s = mergeStep(c.steps.find((x) => x.type === type)!, rows[`${c.id}-${type}`]);
    return { type, area: a, chapter: c, step: s, open: canAccess(tier, s, c.id), done: !!p.completed[s.id], quiz: type === "quiz" ? latest.get(c.id) : undefined };
  };
  const Card = type === "video" ? VideoCard : TaskCard;
  const grid = type === "video" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-3 md:grid-cols-2";
  const fresh = AREAS.flatMap((a) => chaptersFor(grade, a.id).map((c) => props(a, c))).filter((x) => x.step.publishedMonth === LATEST_MONTH);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl bg-paper p-1 ring-1 ring-line">
          {GRADES.map((g) => (
            <button key={g} onClick={() => setGrade(g)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${grade === g ? "bg-navy text-white" : "text-navy hover:bg-cream"}`}>
              Åk {g}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setAreaId("alla")} className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${areaId === "alla" ? "bg-navy text-white ring-navy" : "bg-paper text-navy ring-line hover:bg-cream"}`}>
            Alla
          </button>
          {AREAS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAreaId(a.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${areaId === a.id ? "icon-invert bg-navy text-white ring-navy" : "bg-paper text-navy ring-line hover:bg-cream"}`}
            >
              <Icon name={a.icon} size={18} />
              <span className="hidden sm:inline">{a.title.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {areaId === "alla" && fresh.length > 0 && (
        <section className="mb-10 rounded-3xl bg-gold-light/50 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
            <Icon name="firande" size={28} /> Nytt denna månad
          </h2>
          <div className={grid}>
            {fresh.slice(0, type === "video" ? 3 : 4).map((x) => (
              <Card key={x.step.id} {...x} />
            ))}
          </div>
        </section>
      )}

      <div className="space-y-10">
        {areas.map((a) => (
          <section key={a.id}>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${a.color}1f` }}>
                <Icon name={a.icon} size={26} />
              </span>
              {a.title}
            </h2>
            <div className={grid}>
              {chaptersFor(grade, a.id).map((c) => (
                <Card key={c.id} {...props(a, c)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
