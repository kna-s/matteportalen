"use client";

import Link from "next/link";
import { getArea, getChapter } from "@/lib/curriculum";
import { stepHref } from "@/lib/flow";
import { STRONG_THRESHOLD, WEAK_THRESHOLD } from "@/lib/screening";
import { StudentProgress, latestQuizPerChapter } from "@/lib/store";
import Icon, { IconName } from "./icons/Icon";
import { MascotSays } from "./Mascot";

interface Item {
  chapterId: string;
  title: string;
  areaIcon: IconName;
  color: string;
  ratio: number;
  videoId: string;
  quizId: string;
}

const PILES = [
  { id: "kan", title: "Det här kan du", icon: "stjarna" as IconName, bg: "bg-good/10", ring: "ring-good/20" },
  { id: "nastan", title: "Nästan där", icon: "klar" as IconName, bg: "bg-gold-light/60", ring: "ring-gold/30" },
  { id: "ova", title: "Öva lite mer", icon: "mal" as IconName, bg: "bg-wine/10", ring: "ring-wine/20" },
] as const;

/** Barnets screening: Sigge berättar, och kapitlen läggs i tre högar. */
export default function KidScreening({ p, grade }: { p: StudentProgress; grade: number }) {
  const items: Item[] = [...latestQuizPerChapter(p).values()]
    .map((r) => {
      const ch = getChapter(r.chapterId);
      if (!ch || ch.grade !== grade) return null;
      const area = getArea(ch.areaId);
      return {
        chapterId: ch.id,
        title: ch.title,
        areaIcon: area.icon,
        color: area.color,
        ratio: r.score / r.total,
        videoId: ch.steps.find((s) => s.type === "video")!.id,
        quizId: ch.steps.find((s) => s.type === "quiz")!.id,
      };
    })
    .filter((x): x is Item => !!x);

  const pile = {
    kan: items.filter((i) => i.ratio >= STRONG_THRESHOLD),
    nastan: items.filter((i) => i.ratio >= WEAK_THRESHOLD && i.ratio < STRONG_THRESHOLD),
    ova: items.filter((i) => i.ratio < WEAK_THRESHOLD),
  };

  const best = pile.kan[0]?.title.toLowerCase();
  const work = pile.ova[0]?.title.toLowerCase();
  const message =
    best && work
      ? `Du är riktigt bra på ${best}! ${work[0].toUpperCase() + work.slice(1)} kan vi öva lite mer på tillsammans.`
      : best
        ? `Wow, du är riktigt bra på ${best}! Fortsätt så.`
        : work
          ? `Bra kämpat! ${work[0].toUpperCase() + work.slice(1)} kan vi öva lite mer på, ett steg i taget.`
          : "Du är på god väg! Gör fler quiz så kan jag berätta mer.";

  return (
    <div className="space-y-6">
      <MascotSays mood={pile.kan.length ? "hurra" : "glad"} size={72}>
        {message}
      </MascotSays>

      <div className="grid gap-4 lg:grid-cols-3">
        {PILES.map((pl) => (
          <section key={pl.id} className={`rounded-3xl p-5 ring-1 ${pl.bg} ${pl.ring}`}>
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Icon name={pl.icon} size={28} /> {pl.title}
              <span className="ml-auto grid h-8 min-w-8 place-items-center rounded-full bg-paper px-2 text-sm text-navy">{pile[pl.id].length}</span>
            </h2>
            {pile[pl.id].length === 0 ? (
              <p className="mt-3 text-sm text-muted">{pl.id === "ova" ? "Inget här just nu. Snyggt!" : "Inget här än."}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {pile[pl.id].map((i) => (
                  <li key={i.chapterId} className="rounded-2xl bg-paper p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${i.color}1f` }}>
                        <Icon name={i.areaIcon} size={24} />
                      </span>
                      <b className="leading-tight text-navy">{i.title}</b>
                    </div>
                    {pl.id === "nastan" && (
                      <Link href={stepHref(i.quizId)} className="btn-ghost mt-2 w-full !py-1.5 text-sm">
                        Gör quizen igen
                      </Link>
                    )}
                    {pl.id === "ova" && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Link href={stepHref(i.videoId)} className="btn-ghost !py-1.5 text-sm">
                          Se videon
                        </Link>
                        <Link href={stepHref(i.quizId)} className="btn-accent !py-1.5 text-sm">
                          Öva
                        </Link>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
