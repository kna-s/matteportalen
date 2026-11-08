"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Tier, TIERS } from "@/lib/tiers";
import { Level, LEVEL_TEXT } from "@/lib/screening";
import Mascot from "./Mascot";
import Icon, { IconName } from "./icons/Icon";

export function PageHeader({ icon, title, intro }: { icon: IconName; title: string; intro?: string }) {
  return (
    <div className="mb-6">
      <h1 className="page-title flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-paper shadow-sm ring-1 ring-line">
          <Icon name={icon} size={32} />
        </span>
        {title}
      </h1>
      {intro && (
        <p className="mt-2 max-w-3xl text-muted">
          {intro} <ReadAloud text={`${title}. ${intro}`} />
        </p>
      )}
    </div>
  );
}

/**
 * Väljer den bästa svenska rösten som finns i webbläsaren.
 * Microsoft Edge på Windows har naturliga röster (t.ex. "Sofie Online (Natural)"),
 * Chrome har "Google svenska", annars tas Windows egen röst (t.ex. "Bengt").
 */
function bestSwedishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("sv"));
  const score = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    if (n.includes("natural")) return 4;
    if (n.includes("online")) return 3;
    if (n.includes("google")) return 2;
    return 1;
  };
  return voices.sort((a, b) => score(b) - score(a))[0];
}

/** Läser upp text med bästa svenska rösten. Döljs om det inte finns någon svensk röst. */
export function ReadAloud({ text, label = "Lyssna" }: { text: string; label?: string }) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice>();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => setVoice(bestSwedishVoice());
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  if (!voice) return null;
  return (
    <button
      type="button"
      onClick={() => {
        const synth = window.speechSynthesis;
        if (speaking) {
          synth.cancel();
          setSpeaking(false);
          return;
        }
        const u = new SpeechSynthesisUtterance(text);
        u.voice = voice;
        u.lang = voice.lang;
        u.rate = 0.95;
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        synth.cancel();
        synth.speak(u);
        setSpeaking(true);
      }}
      className="ml-1 inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2 py-0.5 align-middle text-xs font-semibold text-navy hover:bg-gold-light"
      aria-label={speaking ? "Sluta läsa upp" : "Läs upp texten"}
      title={`Röst: ${voice.name}`}
    >
      {speaking ? "⏹ Stoppa" : (
        <>
          <Icon name="lyssna" size={14} /> {label}
        </>
      )}
    </button>
  );
}

export function LockedNotice({ need, what }: { need: Tier; what: string }) {
  const { state } = useStore();
  const isParent = state.session?.role !== "elev";
  return (
    <div className="card border-gold bg-gold-light/40 text-center">
      <div className="flex justify-center">{isParent ? <Icon name="las" size={48} /> : <Mascot mood="tanker" size={64} />}</div>
      <h3 className="mt-2 text-xl font-bold">{what} ingår i {TIERS[need].name}</h3>
      <p className="mx-auto mt-1 max-w-md text-muted">
        {isParent
          ? `Uppgradera till ${TIERS[need].name} för att låsa upp det här.`
          : `Fråga en förälder om ni vill låsa upp ${TIERS[need].name}. Du kan fortsätta med nästa steg så länge.`}
      </p>
      {isParent && (
        <Link href="/abonnemang" className="btn-accent mt-4">
          Se abonnemang
        </Link>
      )}
    </div>
  );
}

export function TierChip({ tier }: { tier: Tier }) {
  const colors: Record<Tier, string> = {
    gratis: "bg-good/15 text-good",
    start: "bg-navy/10 text-navy",
    plus: "bg-wine/10 text-wine",
    premium: "bg-gold-light text-gold-ink",
  };
  return <span className={`chip ${colors[tier]}`}>{TIERS[tier].name}</span>;
}

export function LevelChip({ level }: { level: Level }) {
  const colors: Record<Level, string> = {
    stark: "bg-good/15 text-good",
    okej: "bg-warn/15 text-warn",
    ova: "bg-bad/15 text-bad",
    "ingen-data": "bg-line text-muted",
  };
  return <span className={`chip ${colors[level]}`}>{LEVEL_TEXT[level]}</span>;
}

export function ProgressBar({ value, color = "var(--color-navy)" }: { value: number; color?: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(value * 100)}%`, background: color }} />
    </div>
  );
}

/** Visar innehåll bara om man är inloggad, annars en uppmaning att logga in. */
export function RequireLogin({ children, roles }: { children: React.ReactNode; roles?: ("elev" | "foralder" | "admin")[] }) {
  const { state, ready } = useStore();
  if (!ready) return <div className="card animate-pulse text-muted">Laddar…</div>;
  if (!state.session)
    return (
      <div className="card text-center">
        <p className="text-lg">Du behöver logga in för att se den här sidan.</p>
        <Link href="/logga-in" className="btn-primary mt-4">
          Logga in eller skapa konto
        </Link>
      </div>
    );
  if (roles && !roles.includes(state.session.role))
    return <div className="card text-center text-muted">Den här sidan är inte tillgänglig för din roll.</div>;
  return <>{children}</>;
}

/** Låter förälder/lärare välja vilket barn som visas. */
export function StudentPicker() {
  const { state, update } = useStore();
  if (!state.session || state.session.role === "elev" || state.students.length === 0) return null;
  return (
    <label className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold text-navy">Visar elev:</span>
      <select
        className="input !w-auto !py-1"
        value={state.session.studentId}
        onChange={(e) => update((s) => ({ ...s, session: { ...s.session!, studentId: e.target.value } }))}
      >
        {state.students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} (åk {s.grade})
          </option>
        ))}
      </select>
    </label>
  );
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line bg-cream p-3 text-sm italic text-muted">{children}</p>;
}
