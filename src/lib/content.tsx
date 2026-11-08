"use client";

// Innehåll som admins har lagt upp i Supabase. Varje kapitel kan ha flera
// versioner av video, övning och quiz: den nyaste visas först och äldre finns
// kvar som historik. Utan databas visas platshållarna i curriculum.ts.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Grade, QuizQuestion, Step, ToolId, findStep, getChapter, placeholderQuestions } from "./curriculum";
import { supabase, supabaseConfigured } from "./supabase";

export interface ContentItem {
  id: string;
  chapter_id: string;
  type: "video" | "ovning" | "quiz";
  title: string | null;
  video_url: string | null;
  description: string | null;
  tasks: string[] | null;
  questions: Omit<QuizQuestion, "id">[] | null;
  tools: ToolId[] | null;
  published_month: string;
  created_at?: string;
  updated_at?: string;
}

/** Bakåtkompatibelt namn. */
export type StepContentRow = ContentItem;

interface ContentCtx {
  /** Alla versioner per steg-id (`${chapterId}-${type}`), nyaste först. */
  items: Record<string, ContentItem[]>;
  /** Nyaste versionen per steg-id. */
  rows: Record<string, ContentItem>;
  all: ContentItem[];
  loaded: boolean;
  error: string | null;
  /** true om den nya tabellen (002_versioner.sql) saknas. */
  legacy: boolean;
  reload: () => Promise<void>;
}

const Ctx = createContext<ContentCtx>({ items: {}, rows: {}, all: [], loaded: true, error: null, legacy: false, reload: async () => {} });

const newestFirst = (a: ContentItem, b: ContentItem) =>
  b.published_month.localeCompare(a.published_month) || (b.created_at ?? "").localeCompare(a.created_at ?? "");

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [all, setAll] = useState<ContentItem[]>([]);
  const [loaded, setLoaded] = useState(!supabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [legacy, setLegacy] = useState(false);

  const reload = useCallback(async () => {
    if (!supabase) return;
    const res = await supabase.from("content_items").select("*");
    if (!res.error) {
      setAll(res.data as ContentItem[]);
      setLegacy(false);
      setError(null);
    } else {
      // Den nya tabellen finns inte än: läs den gamla så att inget försvinner.
      const old = await supabase.from("step_content").select("*");
      if (old.error) setError(old.error.message);
      else {
        setLegacy(true);
        setError(null);
        setAll(
          (old.data as (ContentItem & { step_id: string })[]).map((r) => ({
            ...r,
            id: r.step_id,
            chapter_id: r.step_id.replace(/-(video|ovning|quiz)$/, ""),
            published_month: r.published_month ?? new Date().toISOString().slice(0, 7),
          })),
        );
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(() => {
    const items: Record<string, ContentItem[]> = {};
    for (const it of all) (items[`${it.chapter_id}-${it.type}`] ??= []).push(it);
    Object.values(items).forEach((l) => l.sort(newestFirst));
    const rows = Object.fromEntries(Object.entries(items).map(([k, l]) => [k, l[0]]));
    return { items, rows, all: [...all].sort(newestFirst), loaded, error, legacy, reload };
  }, [all, loaded, error, legacy, reload]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent() {
  return useContext(Ctx);
}

export type MergedStep = Step & { videoUrl?: string; description?: string; custom: boolean; versionId: string };

/** Lägger en version från databasen ovanpå platshållaren för ett steg. */
export function mergeStep(step: Step, row?: ContentItem): MergedStep {
  if (!row) return { ...step, custom: false, versionId: "platshallare" };
  return {
    ...step,
    title: row.title || step.title,
    tasks: row.tasks?.length ? row.tasks : step.tasks,
    questions: row.questions?.length ? row.questions.map((q, i) => ({ ...q, id: `${step.id}-${row.id}-q${i + 1}`, focus: q.focus || "Metod" })) : step.questions,
    tools: row.tools ?? step.tools,
    publishedMonth: row.published_month || step.publishedMonth,
    videoUrl: row.video_url || undefined,
    description: row.description || undefined,
    custom: true,
    versionId: row.id,
  };
}

function previousMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Demo: en äldre platshållarversion så att historiken syns utan databas. */
function placeholderHistory(step: Step): MergedStep[] {
  if (step.type === "ovning" || step.type === "screening") return [];
  const ch = getChapter(step.id.replace(/-(video|ovning|quiz|screening)$/, ""));
  if (!ch) return [];
  return [
    {
      ...step,
      title: `${step.title} (tidigare version)`,
      publishedMonth: previousMonth(step.publishedMonth),
      questions: step.type === "quiz" ? placeholderQuestions(`${ch.id}-tidigare`, ch.grade as Grade, ch.title, 6) : step.questions,
      custom: false,
      versionId: "platshallare-tidigare",
    },
  ];
}

/** Alla versioner av ett steg, nyaste först. */
export function useVersions(step: Step): MergedStep[] {
  const { items } = useContent();
  const list = items[step.id];
  if (list?.length) return list.map((it) => mergeStep(step, it));
  return [mergeStep(step), ...placeholderHistory(step)];
}

export function useStepContent(step: Step) {
  const { rows } = useContent();
  return mergeStep(step, rows[step.id]);
}

/** Plockar ut video-id ur alla vanliga YouTube-länkar. */
export function youtubeId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(url.trim()) ? url.trim() : null;
}

export function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
}

export { findStep };
