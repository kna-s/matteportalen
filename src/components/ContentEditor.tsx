"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Icon from "./icons/Icon";
import { AREAS, GRADES, Grade, STEP_ICON, STEP_LABELS, TOOL_LABELS, ToolId, chaptersFor } from "@/lib/curriculum";
import { StepContentRow, useContent, youtubeId } from "@/lib/content";
import { stepHref } from "@/lib/flow";
import { supabase, supabaseConfigured } from "@/lib/supabase";

type EditType = "video" | "ovning" | "quiz";
interface QuestionDraft {
  prompt: string;
  options: string[];
  correctIndex: number;
  focus: string;
}

const FOCUS = ["Begrepp", "Metod", "Tillämpning"];
const emptyQuestion = (): QuestionDraft => ({ prompt: "", options: ["", "", "", ""], correctIndex: 0, focus: "Metod" });

/** Inloggning för admins (Supabase Auth) och koll om användaren är admin. */
export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    const check = async (s: Session | null) => {
      setSession(s);
      if (!s) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }
      const { data } = await supabase!.from("admins").select("user_id").eq("user_id", s.user.id).maybeSingle();
      setIsAdmin(!!data);
      setChecking(false);
    };
    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => check(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, isAdmin, checking };
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mx-auto max-w-sm space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) setError(error.message === "Invalid login credentials" ? "Fel e-post eller lösenord." : error.message);
        setBusy(false);
      }}
    >
      <h3 className="text-center text-lg font-bold">Logga in som admin</h3>
      <p className="text-center text-sm text-muted">För att spara innehåll behöver du logga in med ett adminkonto från Supabase.</p>
      <input className="input" type="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="input" type="password" placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-bad">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? "Loggar in…" : "Logga in"}
      </button>
    </form>
  );
}

export default function ContentEditor() {
  const { session, isAdmin, checking } = useAdminSession();
  const { rows, reload } = useContent();

  const [type, setType] = useState<EditType>("video");
  const [grade, setGrade] = useState<Grade>(4);
  const [areaId, setAreaId] = useState(AREAS[0].id);
  const chapters = chaptersFor(grade, areaId);
  const [chapterId, setChapterId] = useState(chapters[0].id);
  const stepId = `${chapterId}-${type}`;
  const chapter = chapters.find((c) => c.id === chapterId) ?? chapters[0];
  const baseStep = chapter.steps.find((s) => s.type === type)!;
  const existing: StepContentRow | undefined = rows[stepId];

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [tools, setTools] = useState<ToolId[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Byt kapitel när årskurs/område ändras.
  useEffect(() => {
    if (!chapters.some((c) => c.id === chapterId)) setChapterId(chapters[0].id);
  }, [chapters, chapterId]);

  // Fyll formuläret med sparat innehåll (eller tomt) när steget byts.
  useEffect(() => {
    setStatus(null);
    setTitle(existing?.title ?? "");
    setVideoUrl(existing?.video_url ?? "");
    setDescription(existing?.description ?? "");
    setTasks((existing?.tasks ?? []).join("\n"));
    setQuestions(existing?.questions?.length ? existing.questions.map((q) => ({ prompt: q.prompt, options: [...q.options], correctIndex: q.correctIndex, focus: q.focus || "Metod" })) : [emptyQuestion()]);
    setTools(existing?.tools ?? baseStep.tools);
    setMonth(existing?.published_month ?? new Date().toISOString().slice(0, 7));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, existing?.updated_at]);

  const yt = youtubeId(videoUrl);
  const canSave = supabaseConfigured && isAdmin;

  const validate = (): string | null => {
    if (type === "video" && !yt) return "Klistra in en giltig YouTube-länk.";
    if (type === "ovning" && !tasks.trim()) return "Skriv minst en uppgift.";
    if (type === "quiz") {
      if (questions.length === 0) return "Lägg till minst en fråga.";
      for (const [i, q] of questions.entries()) {
        if (!q.prompt.trim()) return `Fråga ${i + 1} saknar text.`;
        if (q.options.some((o) => !o.trim())) return `Fråga ${i + 1} har tomma svarsalternativ.`;
      }
    }
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) return setStatus({ kind: "error", text: err });
    setSaving(true);
    const row = {
      step_id: stepId,
      type,
      title: title.trim() || null,
      video_url: type === "video" ? videoUrl.trim() : null,
      description: description.trim() || null,
      tasks: type === "ovning" ? tasks.split("\n").map((t) => t.trim()).filter(Boolean) : null,
      questions: type === "quiz" ? questions.map((q) => ({ ...q, prompt: q.prompt.trim(), options: q.options.map((o) => o.trim()) })) : null,
      tools: type === "video" ? [] : tools,
      published_month: month,
      updated_by: session?.user.id,
    };
    const { error } = await supabase!.from("step_content").upsert(row);
    setSaving(false);
    if (error) return setStatus({ kind: "error", text: `Kunde inte spara: ${error.message}` });
    await reload();
    setStatus({ kind: "ok", text: "Sparat! Innehållet syns nu för alla besökare." });
  };

  const remove = async () => {
    if (!confirm("Ta bort det sparade innehållet och visa platshållaren igen?")) return;
    const { error } = await supabase!.from("step_content").delete().eq("step_id", stepId);
    if (error) return setStatus({ kind: "error", text: error.message });
    await reload();
    setStatus({ kind: "ok", text: "Borttaget. Platshållaren visas igen." });
  };

  return (
    <div className="space-y-5">
      {/* Status för databas och inloggning */}
      {!supabaseConfigured ? (
        <div className="rounded-2xl bg-gold-light/60 p-4 text-sm">
          <b>Databasen är inte kopplad.</b> Lägg in <code>NEXT_PUBLIC_SUPABASE_URL</code> och <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> i <code>.env.local</code> (och på Vercel)
          för att kunna spara. Formuläret går att testa men sparar inget.
        </div>
      ) : checking ? (
        <div className="card animate-pulse text-muted">Kollar inloggning…</div>
      ) : !session ? (
        <div className="card">
          <AdminLogin />
        </div>
      ) : !isAdmin ? (
        <div className="rounded-2xl bg-bad/10 p-4 text-sm">
          Du är inloggad som <b>{session.user.email}</b> men kontot är inte admin än. Kör <code>supabase/gor-mig-till-admin.sql</code> i Supabase med din e-post.{" "}
          <button className="font-semibold underline" onClick={() => supabase!.auth.signOut()}>
            Logga ut
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-good/10 p-3 text-sm">
          <span className="flex items-center gap-2">
            <Icon name="klar" size={20} /> Inloggad som admin: <b>{session.user.email}</b>
          </span>
          <button className="font-semibold text-navy underline" onClick={() => supabase!.auth.signOut()}>
            Logga ut
          </button>
        </div>
      )}

      <div className="card space-y-5">
        <h2 className="text-lg font-bold">Lägg upp eller ändra innehåll</h2>

        <div>
          <p className="mb-2 text-sm font-semibold text-navy">Typ</p>
          <div className="flex flex-wrap gap-2">
            {(["video", "ovning", "quiz"] as EditType[]).map((t) => (
              <button type="button" key={t} onClick={() => setType(t)} className={type === t ? "btn-primary icon-invert !py-1.5 text-sm" : "btn-ghost !py-1.5 text-sm"}>
                <Icon name={STEP_ICON[t]} size={18} /> {STEP_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="font-semibold text-navy">Årskurs</span>
            <select className="input mt-1" value={grade} onChange={(e) => setGrade(Number(e.target.value) as Grade)}>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Åk {g}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold text-navy">Område</span>
            <select className="input mt-1" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold text-navy">Kapitel</span>
            <select className="input mt-1" value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                  {rows[`${c.id}-${type}`] ? " ✓" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="text-sm">
          {existing ? (
            <span className="chip bg-good/15 text-good">Har eget innehåll</span>
          ) : (
            <span className="chip bg-warn/15 text-warn">Visar platshållare</span>
          )}{" "}
          <Link href={stepHref(stepId)} className="ml-2 text-navy underline" target="_blank">
            Visa steget på sajten ↗
          </Link>
        </p>

        <label className="block text-sm">
          <span className="font-semibold text-navy">Titel (valfritt)</span>
          <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={baseStep.title} />
        </label>

        {type === "video" && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="font-semibold text-navy">Länk till olistad YouTube-video</span>
              <input className="input mt-1" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtu.be/…" />
              <span className={`mt-1 block text-xs ${videoUrl && !yt ? "text-bad" : "text-muted"}`}>
                {videoUrl && !yt ? "Det där ser inte ut som en YouTube-länk." : "Fungerar med youtube.com/watch?v=…, youtu.be/… och shorts."}
              </span>
              <span className="mt-3 block font-semibold text-navy">Om lektionen</span>
              <textarea className="input mt-1 min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kort text som visas under videon." />
            </label>
            <div className="overflow-hidden rounded-xl bg-cream ring-1 ring-line">
              {yt ? (
                <iframe className="aspect-video w-full" src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`} title="Förhandsvisning" allowFullScreen />
              ) : (
                <div className="grid aspect-video place-items-center text-sm text-muted">Förhandsvisning visas här</div>
              )}
            </div>
          </div>
        )}

        {type === "ovning" && (
          <label className="block text-sm">
            <span className="font-semibold text-navy">Uppgifter (en per rad)</span>
            <textarea
              className="input mt-1 min-h-32"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={(baseStep.tasks ?? []).join("\n")}
            />
          </label>
        )}

        {type === "quiz" && (
          <div className="space-y-3">
            {questions.map((q, qi) => (
              <div key={qi} className="rounded-2xl bg-cream p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-navy">Fråga {qi + 1}</p>
                  <div className="flex items-center gap-2">
                    <select
                      className="input !w-auto !py-1 text-xs"
                      value={q.focus}
                      onChange={(e) => setQuestions((qs) => qs.map((x, i) => (i === qi ? { ...x, focus: e.target.value } : x)))}
                      aria-label="Fokus för screeningen"
                    >
                      {FOCUS.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                    {questions.length > 1 && (
                      <button className="text-sm text-bad" onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))}>
                        Ta bort
                      </button>
                    )}
                  </div>
                </div>
                <input
                  className="input mt-2"
                  value={q.prompt}
                  onChange={(e) => setQuestions((qs) => qs.map((x, i) => (i === qi ? { ...x, prompt: e.target.value } : x)))}
                  placeholder="T.ex. Vad är 25 % av 40?"
                />
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {q.options.map((o, oi) => (
                    <label key={oi} className={`flex items-center gap-2 rounded-xl px-2 py-1 ${q.correctIndex === oi ? "bg-good/15" : ""}`}>
                      <input
                        type="radio"
                        name={`ratt-${qi}`}
                        checked={q.correctIndex === oi}
                        onChange={() => setQuestions((qs) => qs.map((x, i) => (i === qi ? { ...x, correctIndex: oi } : x)))}
                        className="accent-good"
                        aria-label={`Svar ${oi + 1} är rätt`}
                      />
                      <input
                        className="input"
                        value={o}
                        onChange={(e) =>
                          setQuestions((qs) => qs.map((x, i) => (i === qi ? { ...x, options: x.options.map((y, yi) => (yi === oi ? e.target.value : y)) } : x)))
                        }
                        placeholder={`Svar ${String.fromCharCode(65 + oi)}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn-ghost text-sm" onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}>
              <Icon name="plus" size={18} /> Lägg till fråga
            </button>
            <p className="text-xs text-muted">Markera rätt svar med rundeln. Fokus används av screeningen för att visa vad eleven är stark eller svag på.</p>
          </div>
        )}

        {type !== "video" && (
          <div>
            <p className="mb-2 text-sm font-semibold text-navy">Hjälpmedel för uppgiften</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TOOL_LABELS) as ToolId[]).map((t) => (
                <label key={t} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${tools.includes(t) ? "border-navy bg-navy/5" : "border-line"}`}>
                  <input type="checkbox" className="accent-navy" checked={tools.includes(t)} onChange={() => setTools((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))} />
                  <Icon name={t} size={18} />
                  {TOOL_LABELS[t]}
                </label>
              ))}
            </div>
          </div>
        )}

        <label className="block text-sm sm:w-60">
          <span className="font-semibold text-navy">Publiceringsmånad</span>
          <input type="month" className="input mt-1" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>

        {status && (
          <p className={`rounded-xl p-3 text-sm ${status.kind === "ok" ? "bg-good/10 text-good" : "bg-bad/10 text-bad"}`}>
            {status.text}{" "}
            {status.kind === "ok" && (
              <Link href={stepHref(stepId)} className="font-semibold underline" target="_blank">
                Visa ↗
              </Link>
            )}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-accent" onClick={save} disabled={!canSave || saving} title={canSave ? "" : "Logga in som admin för att spara"}>
            {saving ? "Sparar…" : existing ? "Spara ändringar" : "Spara och publicera"}
          </button>
          {existing && canSave && (
            <button className="btn-ghost text-sm text-bad" onClick={remove}>
              Ta bort och visa platshållare
            </button>
          )}
          {!canSave && <span className="text-xs text-muted">Logga in som admin för att spara.</span>}
        </div>
      </div>
    </div>
  );
}
