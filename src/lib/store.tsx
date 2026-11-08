"use client";

// Demo-lagring i webbläsaren (localStorage). Byts mot riktig inloggning och
// databas (Supabase) i fas 2. Gränssnittet nedan är tänkt att stå kvar.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CHAPTERS, Grade, findStep } from "./curriculum";
import { Tier } from "./tiers";

export type Role = "elev" | "foralder" | "admin";

export const PALETTES = [
  { id: "akademisk", name: "Akademisk", desc: "Marinblå, vinröd och guld" },
  { id: "skog", name: "Skog & persika", desc: "Djupgrön, korall och solgul" },
  { id: "korall", name: "Bläck & korall", desc: "Indigo, korall och gul" },
  { id: "hav", name: "Hav & apelsin", desc: "Petrol, orange och gul" },
  { id: "plommon", name: "Plommon & hallon", desc: "Plommon, hallon och senap" },
] as const;
export type Palette = (typeof PALETTES)[number]["id"];

export const MASCOTS = [
  { id: "sigge", name: "Sigge", kind: "sköldpadda", desc: "Lugn och klok. Vi tar det i vår egen takt." },
  { id: "bit", name: "Bit", kind: "robot", desc: "Nyfiken liten robot som älskar siffror." },
  { id: "frida", name: "Frida", kind: "räv", desc: "Klurig räv som gillar att lösa problem." },
  { id: "pi", name: "Pi", kind: "matte-figur", desc: "Rund figur med ett π, knuten till loggan." },
] as const;
export type MascotId = (typeof MASCOTS)[number]["id"];

export interface Student {
  id: string;
  name: string;
  username: string;
  grade: Grade;
}

export interface QuizResult {
  stepId: string;
  chapterId: string;
  score: number;
  total: number;
  byFocus: Record<string, { correct: number; total: number }>;
  date: string;
}

export interface StudentProgress {
  completed: Record<string, string>; // stepId -> ISO-datum
  quizResults: QuizResult[];
  notes: Record<string, string>; // stepId -> elevens anteckning i övning
  /** Hjälpmedel eleven har använt (för märken). */
  toolsUsed?: string[];
}

export interface AppState {
  session: { role: Role; studentId?: string } | null;
  parent: { name: string; email: string; tier: Tier; weeklyReport: boolean; onboarded?: boolean };
  students: Student[];
  progress: Record<string, StudentProgress>;
  /** Kapitel som föräldern markerat som "Aktuellt", per barn (studentId). */
  aktuellt: Record<string, string[]>;
  textSize: "normal" | "stor";
  /** Färgpalett som testas (se globals.css). */
  palette: Palette;
  mascot: MascotId;
  /** Märken som eleven redan har sett notisen för: studentId -> badgeId -> datum. */
  seenBadges: Record<string, Record<string, string>>;
  /** Demo: märke som visas som notis direkt (för att testa). */
  demoBadge?: string | null;
  /** Maskotens kläder per elev. */
  outfits: Record<string, { hatt?: string | null; halsduk?: string | null; glasogon?: string | null }>;
  /** Skattkistor som eleven har öppnat (områdes-id) per elev. */
  openedChests: Record<string, string[]>;
  /** Demo: lås upp alla kistor och föremål. */
  demoUnlockAll?: boolean;
}

const KEY = "matteportalen-demo-v3";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function seedProgress(grade: Grade, howMany: number, skill: number): StudentProgress {
  const chapters = CHAPTERS.filter((c) => c.grade === grade).slice(0, howMany);
  const p: StudentProgress = { completed: {}, quizResults: [], notes: {} };
  chapters.forEach((c, i) => {
    const when = daysAgo((howMany - i) * 3);
    c.steps.forEach((s) => (p.completed[s.id] = when));
    const quiz = c.steps.find((s) => s.type === "quiz")!;
    const total = quiz.questions!.length;
    const wobble = ((i * 37) % 5) - 2;
    const score = Math.max(1, Math.min(total, Math.round(total * skill) + wobble));
    const byFocus: QuizResult["byFocus"] = {};
    quiz.questions!.forEach((q, qi) => {
      byFocus[q.focus] ??= { correct: 0, total: 0 };
      byFocus[q.focus].total++;
      if (qi < score) byFocus[q.focus].correct++;
    });
    p.quizResults.push({ stepId: quiz.id, chapterId: c.id, score, total, byFocus, date: when });
  });
  return p;
}

export function defaultState(): AppState {
  return {
    session: null,
    parent: { name: "Anna Andersson", email: "anna@exempel.se", tier: "premium", weeklyReport: true },
    students: [
      { id: "leo", name: "Leo", username: "leo.a", grade: 4 },
      { id: "maja", name: "Maja", username: "maja.a", grade: 6 },
    ],
    progress: {
      leo: seedProgress(4, 6, 0.6),
      maja: seedProgress(6, 10, 0.8),
    },
    aktuellt: {
      leo: CHAPTERS.filter((c) => c.grade === 4 && c.areaId === "geometri").slice(2, 3).map((c) => c.id),
      maja: CHAPTERS.filter((c) => c.grade === 6 && c.areaId === "algebra").slice(2, 3).map((c) => c.id),
    },
    textSize: "normal",
    palette: "hav",
    mascot: "sigge",
    seenBadges: {},
    demoBadge: null,
    outfits: {},
    openedChests: {},
    demoUnlockAll: false,
  };
}

interface Ctx {
  state: AppState;
  ready: boolean;
  update: (fn: (s: AppState) => AppState) => void;
  reset: () => void;
  currentStudent: Student | undefined;
  /** Den elev som visas: inloggad elev, eller förälderns valda barn. */
  tier: Tier;
  login: (role: Role, studentId?: string) => void;
  logout: () => void;
  completeStep: (studentId: string, stepId: string) => void;
  markToolUsed: (studentId: string, tool: string) => void;
  /** Demo: skapa ett nytt, tomt föräldrakonto (startar guiden "Kom igång"). */
  startNewAccount: (name: string, email: string) => void;
  addStudent: (name: string, grade: Grade) => Student;
  saveQuiz: (studentId: string, r: QuizResult) => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...defaultState(), ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
    document.documentElement.dataset.textsize = state.textSize;
    document.documentElement.dataset.palette = state.palette;
  }, [state, ready]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const value = useMemo<Ctx>(() => {
    const sid = state.session?.studentId;
    return {
      state,
      ready,
      update,
      reset: () => {
        const d = defaultState();
        const sid = d.students.some((x) => x.id === state.session?.studentId) ? state.session?.studentId : d.students[0].id;
        setState({ ...d, session: state.session ? { ...state.session, studentId: sid } : null, palette: state.palette, mascot: state.mascot });
      },
      currentStudent: state.students.find((s) => s.id === sid),
      tier: state.parent.tier,
      login: (role, studentId) =>
        setState((s) => ({ ...s, session: { role, studentId: studentId ?? s.students[0]?.id } })),
      logout: () => setState((s) => ({ ...s, session: null })),
      startNewAccount: (name, email) =>
        setState((s) => ({
          ...s,
          session: { role: "foralder" },
          parent: { name: name || "Ny förälder", email: email || "", tier: "gratis", weeklyReport: true, onboarded: false },
          students: [],
          progress: {},
          aktuellt: {},
          seenBadges: {},
        })),
      addStudent: (name, grade) => {
        const clean = name.trim();
        const base = clean.toLowerCase().replace(/[åä]/g, "a").replace(/ö/g, "o").replace(/[^a-z0-9]/g, "") || "elev";
        const student: Student = { id: `${base}-${Date.now().toString(36)}`, name: clean, grade, username: `${base}${Math.floor(10 + Math.random() * 89)}` };
        setState((s) => ({
          ...s,
          students: [...s.students, student],
          progress: { ...s.progress, [student.id]: emptyProgress() },
          session: s.session && !s.session.studentId ? { ...s.session, studentId: student.id } : s.session,
        }));
        return student;
      },
      markToolUsed: (studentId, tool) =>
        setState((s) => {
          const p = s.progress[studentId] ?? emptyProgress();
          if (p.toolsUsed?.includes(tool)) return s;
          return { ...s, progress: { ...s.progress, [studentId]: { ...p, toolsUsed: [...(p.toolsUsed ?? []), tool] } } };
        }),
      completeStep: (studentId, stepId) =>
        setState((s) => {
          const p = s.progress[studentId] ?? { completed: {}, quizResults: [], notes: {} };
          return { ...s, progress: { ...s.progress, [studentId]: { ...p, completed: { ...p.completed, [stepId]: new Date().toISOString() } } } };
        }),
      saveQuiz: (studentId, r) =>
        setState((s) => {
          const p = s.progress[studentId] ?? { completed: {}, quizResults: [], notes: {} };
          return {
            ...s,
            progress: {
              ...s.progress,
              [studentId]: {
                ...p,
                quizResults: [...p.quizResults, r],
                completed: { ...p.completed, [r.stepId]: r.date },
              },
            },
          };
        }),
    };
  }, [state, ready, update]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore måste användas inom StoreProvider");
  return ctx;
}

export function emptyProgress(): StudentProgress {
  return { completed: {}, quizResults: [], notes: {} };
}

export function latestQuizPerChapter(p: StudentProgress) {
  const map = new Map<string, QuizResult>();
  for (const r of p.quizResults) map.set(r.chapterId, r);
  return map;
}

export { findStep };
