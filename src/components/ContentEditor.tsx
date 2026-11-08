"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Icon from "./icons/Icon";
import Mascot from "./Mascot";
import { AREAS, GRADES, Grade, STEP_ICON, STEP_LABELS, TOOL_LABELS, ToolId, chaptersFor, getArea, getChapter } from "@/lib/curriculum";
import { ContentItem, monthLabel, useContent, youtubeId } from "@/lib/content";
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
const thisMonth = () => new Date().toISOString().slice(0, 7);

/* ------------------------------------------------------------------ */
/* Inloggning                                                           */
/* ------------------------------------------------------------------ */

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
      <h3 className="text-center text-lg font-bold">Logga in för att lägga upp material</h3>
      <input className="input" type="email" placeholder="E-post" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="input" type="password" placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-sm text-bad">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? "Loggar in…" : "Logga in"}
      </button>
    </form>
  );
}

/** Visar inloggningsstatus och släpper bara fram innehållet för admins. */
export function AdminGate({ children }: { children: (session: Session | null, canSave: boolean) => React.ReactNode }) {
  const { session, isAdmin, checking } = useAdminSession();
  const { legacy } = useContent();
  return (
    <div className="space-y-4">
      {!supabaseConfigured ? (
        <div className="rounded-2xl bg-gold-light/60 p-4 text-sm">
          <b>Databasen är inte kopplad.</b> Lägg in nycklarna i <code>.env.local</code> och på Vercel. Du kan testa guiden, men inget sparas.
        </div>
      ) : checking ? (
        <div className="card animate-pulse text-muted">Kollar inloggning…</div>
      ) : !session ? (
        <div className="card">
          <AdminLogin />
        </div>
      ) : !isAdmin ? (
        <div className="rounded-2xl bg-bad/10 p-4 text-sm">
          <b>{session.user.email}</b> är inte admin än. Kör <code>supabase/gor-mig-till-admin.sql</code> med din e-post.{" "}
          <button className="font-semibold underline" onClick={() => supabase!.auth.signOut()}>
            Logga ut
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-good/10 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2">
            <Icon name="klar" size={20} /> Inloggad som <b>{session.user.email}</b>
          </span>
          <button className="font-semibold text-navy underline" onClick={() => supabase!.auth.signOut()}>
            Logga ut
          </button>
        </div>
      )}
      {legacy && (
        <div className="rounded-2xl bg-gold-light/60 p-4 text-sm">
          <b>Ett steg kvar i databasen:</b> kör <code>supabase/migrations/002_versioner.sql</code> i Supabase SQL Editor för att kunna spara flera versioner per kapitel.
        </div>
      )}
      {children(session, supabaseConfigured && isAdmin && !legacy)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Guiden                                                               */
/* ------------------------------------------------------------------ */

const STEPS = ["Vad", "Var", "Innehåll", "Förhandsvisa", "Klart"];
const TIPS = [
  "Vad vill du lägga upp idag?",
  "Välj var materialet hör hemma i kursplanen.",
  "Fyll i materialet. Håll det kort och tydligt!",
  "Så här kommer eleverna att se det. Ser det bra ut?",
  "Snyggt jobbat! Materialet är publicerat.",
];

export function ContentWizard({ editItem, onDone }: { editItem?: ContentItem | null; onDone?: () => void }) {
  const { items, reload } = useContent();
  const [step, setStep] = useState(editItem ? 2 : 0);
  const [type, setType] = useState<EditType>(editItem?.type ?? "video");
  const editChapter = editItem ? getChapter(editItem.chapter_id) : undefined;
  const [grade, setGrade] = useState<Grade>((editChapter?.grade as Grade) ?? 4);
  const [areaId, setAreaId] = useState(editChapter?.areaId ?? AREAS[0].id);
  const [chapterId, setChapterId] = useState(editItem?.chapter_id ?? chaptersFor(4, AREAS[0].id)[0].id);

  const [title, setTitle] = useState(editItem?.title ?? "");
  const [videoUrl, setVideoUrl] = useState(editItem?.video_url ?? "");
  const [description, setDescription] = useState(editItem?.description ?? "");
  const [tasks, setTasks] = useState((editItem?.tasks ?? []).join("\n"));
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    editItem?.questions?.length ? editItem.questions.map((q) => ({ prompt: q.prompt, options: [...q.options], correctIndex: q.correctIndex, focus: q.focus || "Metod" })) : [emptyQuestion()],
  );
  const [tools, setTools] = useState<ToolId[]>(editItem?.tools ?? []);
  const [month, setMonth] = useState(editItem?.published_month ?? thisMonth());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const chapter = getChapter(chapterId)!;
  const area = getArea(chapter.areaId);
  const yt = youtubeId(videoUrl);
  const existingCount = (items[`${chapterId}-${type}`] ?? []).length;

  // Föreslå hjälpmedel från platshållaren när kapitel eller typ byts.
  useEffect(() => {
    if (!editItem && type !== "video") setTools(chapter.steps.find((s) => s.type === type)?.tools ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, type]);

  const validate = (): string | null => {
    if (type === "video" && !yt) return "Klistra in en giltig YouTube-länk.";
    if (type === "ovning" && !tasks.trim()) return "Skriv minst en uppgift.";
    if (type === "quiz") {
      for (const [i, q] of questions.entries()) {
        if (!q.prompt.trim()) return `Fråga ${i + 1} saknar text.`;
        if (q.options.some((o) => !o.trim())) return `Fråga ${i + 1} har tomma svarsalternativ.`;
      }
    }
    return null;
  };

  const publish = async (canSave: boolean, session: Session | null) => {
    if (!canSave) return setError("Logga in som admin för att publicera.");
    setSaving(true);
    setError(null);
    const row = {
      chapter_id: chapterId,
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
    const res = editItem ? await supabase!.from("content_items").update(row).eq("id", editItem.id) : await supabase!.from("content_items").insert(row);
    setSaving(false);
    if (res.error) return setError(`Kunde inte spara: ${res.error.message}`);
    await reload();
    setStep(4);
  };

  const next = () => {
    if (step === 2) {
      const err = validate();
      if (err) return setError(err);
    }
    setError(null);
    setStep((s) => s + 1);
  };

  const restart = () => {
    setStep(0);
    setTitle("");
    setVideoUrl("");
    setDescription("");
    setTasks("");
    setQuestions([emptyQuestion()]);
    setError(null);
    onDone?.();
  };

  return (
    <AdminGate>
      {(session, canSave) => (
        <div className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-8">
          {/* stegindikator */}
          <ol className="mb-6 flex items-center gap-1.5">
            {STEPS.map((t, i) => (
              <li key={t} className="flex flex-1 items-center gap-1.5">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${i < step ? "bg-good text-white" : i === step ? "bg-navy text-white" : "bg-line text-muted"}`}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className={`hidden text-sm sm:inline ${i === step ? "font-semibold text-navy" : "text-muted"}`}>{t}</span>
                {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 rounded ${i < step ? "bg-good" : "bg-line"}`} />}
              </li>
            ))}
          </ol>

          <div className="mb-6 flex items-center gap-3">
            <Mascot mood={step === 4 ? "hurra" : "glad"} size={52} />
            <p className="rounded-2xl rounded-bl-sm bg-cream px-4 py-2 font-medium">{editItem && step === 2 ? "Ändra materialet och spara." : TIPS[step]}</p>
          </div>

          {/* 1. Vad */}
          {step === 0 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["video", "Videolektion", "En olistad YouTube-video"],
                  ["ovning", "Övning", "Uppgifter att göra efter videon"],
                  ["quiz", "Quiz", "Frågor med rätt svar"],
                ] as [EditType, string, string][]
              ).map(([t, name, desc]) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    setStep(1);
                  }}
                  className="flex flex-col items-center rounded-3xl bg-cream p-6 text-center ring-2 ring-transparent transition-all hover:-translate-y-0.5 hover:ring-navy"
                >
                  <Icon name={STEP_ICON[t]} size={56} />
                  <span className="mt-3 text-lg font-bold text-navy">{name}</span>
                  <span className="text-sm text-muted">{desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* 2. Var */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold text-navy">Årskurs</p>
                <div className="flex gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGrade(g);
                        setChapterId(chaptersFor(g, areaId)[0].id);
                      }}
                      className={`h-12 w-16 rounded-xl font-serif text-xl font-bold ${grade === g ? "bg-navy text-white" : "bg-cream text-navy hover:bg-gold-light"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-navy">Område</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AREAS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setAreaId(a.id);
                        setChapterId(chaptersFor(grade, a.id)[0].id);
                      }}
                      className={`flex items-center gap-2 rounded-xl p-3 text-left text-sm font-semibold ring-2 ${areaId === a.id ? "ring-navy" : "ring-transparent"}`}
                      style={{ background: `${a.color}17` }}
                    >
                      <Icon name={a.icon} size={26} /> {a.title}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-navy">Kapitel</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {chaptersFor(grade, areaId).map((c) => {
                    const n = (items[`${c.id}-${type}`] ?? []).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setChapterId(c.id)}
                        className={`flex items-center justify-between gap-2 rounded-xl bg-cream px-4 py-3 text-left ring-2 ${chapterId === c.id ? "ring-navy" : "ring-transparent hover:bg-gold-light"}`}
                      >
                        <span className="font-medium text-navy">{c.title}</span>
                        <span className="shrink-0 text-xs text-muted">{n ? `${n} uppladdad${n > 1 ? "e" : ""}` : "Inget än"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. Innehåll */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm text-muted">
                <Icon name={STEP_ICON[type]} size={20} /> {STEP_LABELS[type]} · Åk {chapter.grade} · {area.title} · <b className="text-navy">{chapter.title}</b>
                {!editItem && existingCount > 0 && <span className="chip bg-gold-light text-gold-ink">Blir version {existingCount + 1}, den äldre sparas</span>}
              </p>
              <label className="block text-sm">
                <span className="font-semibold text-navy">Titel</span> <span className="text-muted">(valfritt)</span>
                <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`T.ex. ${chapter.title} på 5 minuter`} />
              </label>

              {type === "video" && (
                <>
                  <label className="block text-sm">
                    <span className="font-semibold text-navy">Länk till YouTube-videon</span>
                    <input className="input mt-1" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtu.be/…" autoFocus />
                    <span className={`mt-1 block text-xs ${videoUrl && !yt ? "text-bad" : "text-muted"}`}>
                      {videoUrl && !yt ? "Det där ser inte ut som en YouTube-länk." : "Tips: ladda upp videon som ”Olistad” på YouTube och kopiera länken."}
                    </span>
                  </label>
                  <label className="block text-sm">
                    <span className="font-semibold text-navy">Kort text om lektionen</span> <span className="text-muted">(valfritt)</span>
                    <textarea className="input mt-1 min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="T.ex. Här lär du dig räkna ut arean av en rektangel." />
                  </label>
                </>
              )}

              {type === "ovning" && (
                <label className="block text-sm">
                  <span className="font-semibold text-navy">Uppgifter</span> <span className="text-muted">(en per rad)</span>
                  <textarea
                    className="input mt-1 min-h-36"
                    value={tasks}
                    onChange={(e) => setTasks(e.target.value)}
                    placeholder={"Rita en rektangel som är 4 cm lång och 3 cm bred.\nRäkna ut omkretsen.\nRäkna ut arean."}
                    autoFocus
                  />
                </label>
              )}

              {type === "quiz" && (
                <div className="space-y-3">
                  {questions.map((q, qi) => (
                    <div key={qi} className="rounded-2xl bg-cream p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-navy">Fråga {qi + 1}</p>
                        {questions.length > 1 && (
                          <button className="text-sm text-bad" onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))}>
                            Ta bort
                          </button>
                        )}
                      </div>
                      <input
                        className="input mt-2"
                        value={q.prompt}
                        onChange={(e) => setQuestions((qs) => qs.map((x, i) => (i === qi ? { ...x, prompt: e.target.value } : x)))}
                        placeholder="T.ex. Vad är 25 % av 40?"
                      />
                      <p className="mt-3 text-xs text-muted">Skriv fyra svar och klicka på det som är rätt:</p>
                      <div className="mt-1 grid gap-2 sm:grid-cols-2">
                        {q.options.map((o, oi) => (
                          <div key={oi} className={`flex items-center gap-2 rounded-xl p-1 ring-2 ${q.correctIndex === oi ? "bg-good/15 ring-good" : "ring-transparent"}`}>
                            <button
                              type="button"
                              onClick={() => setQuestions((qs) => qs.map((x, i) => (i === qi ? { ...x, correctIndex: oi } : x)))}
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold ${q.correctIndex === oi ? "bg-good text-white" : "bg-paper text-muted"}`}
                              aria-label={`Svar ${oi + 1} är rätt`}
                              title="Markera som rätt svar"
                            >
                              {q.correctIndex === oi ? "✓" : String.fromCharCode(65 + oi)}
                            </button>
                            <input
                              className="input"
                              value={o}
                              onChange={(e) => setQuestions((qs) => qs.map((x, i) => (i === qi ? { ...x, options: x.options.map((y, yi) => (yi === oi ? e.target.value : y)) } : x)))}
                              placeholder={`Svar ${String.fromCharCode(65 + oi)}`}
                            />
                          </div>
                        ))}
                      </div>
                      <details className="mt-2 text-xs text-muted">
                        <summary className="cursor-pointer">Fler inställningar</summary>
                        <label className="mt-2 flex items-center gap-2">
                          Fokus för screeningen:
                          <select
                            className="input !w-auto !py-1 text-xs"
                            value={q.focus}
                            onChange={(e) => setQuestions((qs) => qs.map((x, i) => (i === qi ? { ...x, focus: e.target.value } : x)))}
                          >
                            {FOCUS.map((f) => (
                              <option key={f}>{f}</option>
                            ))}
                          </select>
                        </label>
                      </details>
                    </div>
                  ))}
                  <button className="btn-ghost text-sm" onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}>
                    <Icon name="plus" size={18} /> Lägg till fråga
                  </button>
                </div>
              )}

              <details className="rounded-2xl bg-cream p-4 text-sm">
                <summary className="cursor-pointer font-semibold text-navy">Fler inställningar (hjälpmedel och månad)</summary>
                {type !== "video" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Object.keys(TOOL_LABELS) as ToolId[]).map((t) => (
                      <label key={t} className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-paper px-3 py-1.5 ${tools.includes(t) ? "border-navy" : "border-line"}`}>
                        <input type="checkbox" className="accent-navy" checked={tools.includes(t)} onChange={() => setTools((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]))} />
                        <Icon name={t} size={18} />
                        {TOOL_LABELS[t]}
                      </label>
                    ))}
                  </div>
                )}
                <label className="mt-3 flex items-center gap-2">
                  Publiceras:
                  <input type="month" className="input !w-auto !py-1" value={month} onChange={(e) => setMonth(e.target.value)} />
                </label>
              </details>
            </div>
          )}

          {/* 4. Förhandsvisa */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-cream p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Så ser eleven det</p>
                <h3 className="mt-1 flex items-center gap-2 text-xl font-bold">
                  <Icon name={STEP_ICON[type]} size={28} /> {title.trim() || `${STEP_LABELS[type]}: ${chapter.title}`}
                </h3>
                {type === "video" && yt && (
                  <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-ink">
                    <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`} title="Förhandsvisning" allowFullScreen />
                  </div>
                )}
                {type === "video" && description && <p className="mt-3 text-sm">{description}</p>}
                {type === "ovning" && (
                  <ol className="mt-3 space-y-2">
                    {tasks
                      .split("\n")
                      .filter((t) => t.trim())
                      .map((t, i) => (
                        <li key={i} className="flex gap-3 rounded-xl bg-paper p-3">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                  </ol>
                )}
                {type === "quiz" && (
                  <div className="mt-3 space-y-3">
                    {questions.map((q, i) => (
                      <div key={i} className="rounded-xl bg-paper p-4">
                        <p className="font-serif text-lg font-bold text-navy">
                          {i + 1}. {q.prompt}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {q.options.map((o, oi) => (
                            <span key={oi} className={`rounded-xl border-2 px-3 py-2 text-center font-bold ${oi === q.correctIndex ? "border-good bg-good/10 text-good" : "border-line"}`}>
                              {o}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted">
                Publiceras i <b>{monthLabel(month)}</b> under <b>{chapter.title}</b> (åk {chapter.grade}).
                {!editItem && existingCount > 0 && " Den blir nyaste versionen och den tidigare finns kvar som historik."}
              </p>
            </div>
          )}

          {/* 5. Klart */}
          {step === 4 && (
            <div className="text-center">
              <p className="text-lg">
                <b>{STEP_LABELS[type]}</b> för <b>{chapter.title}</b> är {editItem ? "uppdaterad" : "publicerad"}.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href={stepHref(`${chapterId}-${type}`)} target="_blank" className="btn-ghost">
                  Visa på sajten ↗
                </Link>
                <button className="btn-accent" onClick={restart}>
                  <Icon name="plus" size={20} className="icon-invert" /> Lägg upp något mer
                </button>
              </div>
            </div>
          )}

          {error && <p className="mt-4 rounded-xl bg-bad/10 p-3 text-sm text-bad">{error}</p>}

          {/* navigering */}
          {step > 0 && step < 4 && (
            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <button onClick={() => (editItem && step === 2 ? onDone?.() : setStep((s) => s - 1))} className="text-sm font-semibold text-muted hover:text-navy">
                ← {editItem && step === 2 ? "Avbryt" : "Tillbaka"}
              </button>
              {step < 3 ? (
                <button onClick={next} className="btn-primary">
                  Nästa →
                </button>
              ) : (
                <button onClick={() => publish(canSave, session)} disabled={saving} className="btn-accent">
                  {saving ? "Publicerar…" : editItem ? "Spara ändringar" : "Publicera"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </AdminGate>
  );
}

/* ------------------------------------------------------------------ */
/* Mitt material                                                        */
/* ------------------------------------------------------------------ */

export function MyMaterial({ onEdit }: { onEdit: (item: ContentItem) => void }) {
  const { all, items, reload } = useContent();
  const [filter, setFilter] = useState<"alla" | EditType>("alla");
  const list = all.filter((i) => filter === "alla" || i.type === filter);

  return (
    <AdminGate>
      {(_session, canSave) => (
        <div className="rounded-3xl bg-paper p-5 ring-1 ring-line sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Mitt material ({all.length})</h2>
            <div className="flex gap-1">
              {(["alla", "video", "ovning", "quiz"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1 text-sm font-semibold ${filter === f ? "bg-navy text-white" : "text-navy hover:bg-cream"}`}>
                  {f === "alla" ? "Allt" : STEP_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
          {list.length === 0 ? (
            <div className="py-10 text-center text-muted">
              <Mascot mood="glad" size={80} className="mx-auto" />
              <p className="mt-2">Inget uppladdat än. Börja under ”Lägg upp nytt”.</p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {list.map((it) => {
                const ch = getChapter(it.chapter_id);
                const versions = items[`${it.chapter_id}-${it.type}`] ?? [];
                const isNewest = versions[0]?.id === it.id;
                return (
                  <li key={it.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream">
                      <Icon name={STEP_ICON[it.type]} size={24} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-tight text-navy">{it.title || `${STEP_LABELS[it.type]}: ${ch?.title}`}</p>
                      <p className="text-xs text-muted">
                        Åk {ch?.grade} · {ch?.title} · {monthLabel(it.published_month)}
                        {versions.length > 1 && (isNewest ? " · Nyaste" : " · Tidigare version")}
                      </p>
                    </div>
                    <Link href={stepHref(`${it.chapter_id}-${it.type}`)} target="_blank" className="text-sm text-navy underline">
                      Visa
                    </Link>
                    <button className="btn-ghost !px-3 !py-1 text-sm" onClick={() => onEdit(it)} disabled={!canSave}>
                      Ändra
                    </button>
                    <button
                      className="text-sm text-bad disabled:opacity-40"
                      disabled={!canSave}
                      onClick={async () => {
                        if (!confirm("Ta bort det här materialet?")) return;
                        await supabase!.from("content_items").delete().eq("id", it.id);
                        await reload();
                      }}
                    >
                      Ta bort
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </AdminGate>
  );
}

export default ContentWizard;
