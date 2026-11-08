import { AREAS, Area, Grade, chaptersFor, getChapter } from "./curriculum";
import { QuizResult, StudentProgress, latestQuizPerChapter } from "./store";

export const WEAK_THRESHOLD = 0.6;
export const STRONG_THRESHOLD = 0.85;

export type Level = "stark" | "okej" | "ova" | "ingen-data";

export function levelOf(ratio: number | null): Level {
  if (ratio === null) return "ingen-data";
  if (ratio >= STRONG_THRESHOLD) return "stark";
  if (ratio >= WEAK_THRESHOLD) return "okej";
  return "ova";
}

export const LEVEL_TEXT: Record<Level, string> = {
  stark: "Stark",
  okej: "På god väg",
  ova: "Behöver öva",
  "ingen-data": "Inte testat än",
};

/** Kort kommentar efter en quiz (Plus). */
export function shortComment(r: QuizResult) {
  const ratio = r.score / r.total;
  if (ratio >= STRONG_THRESHOLD) return "Snyggt jobbat! Du verkar ha full koll på det här kapitlet.";
  if (ratio >= WEAK_THRESHOLD) return "Bra jobbat! Titta gärna på videon en gång till för att bli ännu säkrare.";
  return "Det här var lite klurigt. Se videon igen och gör övningen en gång till, sedan kan du testa quizen igen.";
}

/** Full screening av en quiz (Premium): kommentar per fokusområde. */
export function fullScreening(r: QuizResult) {
  return Object.entries(r.byFocus).map(([focus, v]) => {
    const ratio = v.correct / v.total;
    const level = levelOf(ratio);
    const comment =
      level === "stark"
        ? `Du är säker på ${focus.toLowerCase()}.`
        : level === "okej"
          ? `${focus} sitter nästan. Lite mer träning så är du där.`
          : `${focus} behöver du öva mer på. Det finns extra övningar i din träningsplan.`;
    return { focus, ...v, ratio, level, comment };
  });
}

export interface AreaSummary {
  areaId: string;
  title: string;
  emoji: string;
  icon: Area["icon"];
  ratio: number | null;
  level: Level;
  chapters: { id: string; title: string; ratio: number | null; level: Level }[];
}

/** Översikt per område och kapitel för en årskurs (Premium). */
export function gradeOverview(p: StudentProgress, grade: Grade): { areas: AreaSummary[]; overall: number | null } {
  const latest = latestQuizPerChapter(p);
  let sum = 0;
  let n = 0;
  const areas = AREAS.map((a) => {
    const chs = chaptersFor(grade, a.id).map((c) => {
      const r = latest.get(c.id);
      const ratio = r ? r.score / r.total : null;
      return { id: c.id, title: c.title, ratio, level: levelOf(ratio) };
    });
    const tested = chs.filter((c) => c.ratio !== null);
    const ratio = tested.length ? tested.reduce((s, c) => s + c.ratio!, 0) / tested.length : null;
    if (ratio !== null) {
      sum += ratio;
      n++;
    }
    return { areaId: a.id, title: a.title, emoji: a.emoji, icon: a.icon, ratio, level: levelOf(ratio), chapters: chs };
  });
  return { areas, overall: n ? sum / n : null };
}

/** Enkel regelbaserad träningsplan: kapitel under 60 % ger repetition. */
export function trainingPlan(p: StudentProgress, grade: Grade) {
  const latest = latestQuizPerChapter(p);
  const items: { chapterId: string; title: string; reason: string; action: string }[] = [];
  for (const [chapterId, r] of latest) {
    const ch = getChapter(chapterId);
    if (!ch || ch.grade !== grade) continue;
    const ratio = r.score / r.total;
    if (ratio < WEAK_THRESHOLD) {
      const weakFocus = Object.entries(r.byFocus)
        .filter(([, v]) => v.correct / v.total < WEAK_THRESHOLD)
        .map(([f]) => f.toLowerCase());
      items.push({
        chapterId,
        title: ch.title,
        reason: `${Math.round(ratio * 100)} % rätt på senaste quizen`,
        action: weakFocus.length
          ? `Se videon igen och gör extra övningar med fokus på ${weakFocus.length > 1 ? `${weakFocus.slice(0, -1).join(", ")} och ${weakFocus.at(-1)}` : weakFocus[0]}.`
          : "Se videon igen och gör övningen en gång till.",
      });
    }
  }
  return items;
}
