"use client";

// Innehåll som admins har lagt upp i Supabase. Läggs ovanpå platshållarna i
// curriculum.ts: finns en rad i databasen för ett steg används den, annars
// visas platshållaren. Utan Supabase-nycklar fungerar sajten som förut.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { QuizQuestion, Step, ToolId } from "./curriculum";
import { supabase, supabaseConfigured } from "./supabase";

export interface StepContentRow {
  step_id: string;
  type: "video" | "ovning" | "quiz";
  title: string | null;
  video_url: string | null;
  description: string | null;
  tasks: string[] | null;
  questions: Omit<QuizQuestion, "id">[] | null;
  tools: ToolId[] | null;
  published_month: string | null;
  updated_at?: string;
}

interface ContentCtx {
  rows: Record<string, StepContentRow>;
  loaded: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const Ctx = createContext<ContentCtx>({ rows: {}, loaded: true, error: null, reload: async () => {} });

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [rows, setRows] = useState<Record<string, StepContentRow>>({});
  const [loaded, setLoaded] = useState(!supabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("step_content").select("*");
    if (error) setError(error.message);
    else {
      setError(null);
      setRows(Object.fromEntries((data as StepContentRow[]).map((r) => [r.step_id, r])));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(() => ({ rows, loaded, error, reload }), [rows, loaded, error, reload]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent() {
  return useContext(Ctx);
}

/** Lägger databasens innehåll ovanpå platshållaren för ett steg. */
export function mergeStep(step: Step, row?: StepContentRow): Step & { videoUrl?: string; description?: string; custom: boolean } {
  if (!row) return { ...step, custom: false };
  return {
    ...step,
    title: row.title || step.title,
    tasks: row.tasks?.length ? row.tasks : step.tasks,
    questions: row.questions?.length ? row.questions.map((q, i) => ({ ...q, id: `${step.id}-q${i + 1}`, focus: q.focus || "Metod" })) : step.questions,
    tools: row.tools ?? step.tools,
    publishedMonth: row.published_month || step.publishedMonth,
    videoUrl: row.video_url || undefined,
    description: row.description || undefined,
    custom: true,
  };
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
