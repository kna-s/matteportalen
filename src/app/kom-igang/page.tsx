"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/icons/Icon";
import Mascot, { MascotSays } from "@/components/Mascot";
import { RequireLogin } from "@/components/ui";
import { GRADES, Grade } from "@/lib/curriculum";
import { useStore } from "@/lib/store";
import { TIERS, TIER_ORDER } from "@/lib/tiers";

const STEPS = ["Välkommen", "Lägg till barn", "Välj nivå", "Klart"];

/** Guide för nya föräldrar: lägg till barn, välj nivå och få inloggningsuppgifter. */
export default function OnboardingPage() {
  return (
    <RequireLogin roles={["foralder"]}>
      <Wizard />
    </RequireLogin>
  );
}

function Wizard() {
  const router = useRouter();
  const { state, update, addStudent, tier } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade>(4);
  const first = state.parent.name.split(" ")[0];

  const finish = () => {
    update((s) => ({ ...s, parent: { ...s.parent, onboarded: true } }));
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* stegindikator */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((t, i) => (
          <li key={t} className="flex flex-1 items-center gap-2">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${i < step ? "bg-good text-white" : i === step ? "bg-navy text-white" : "bg-line text-muted"}`}>
              {i < step ? "✓" : i + 1}
            </span>
            <span className={`hidden text-sm font-medium sm:inline ${i === step ? "text-navy" : "text-muted"}`}>{t}</span>
            {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 rounded ${i < step ? "bg-good" : "bg-line"}`} />}
          </li>
        ))}
      </ol>

      <div key={step} className="pop-in rounded-3xl bg-paper p-6 shadow-sm ring-1 ring-line sm:p-8">
        {step === 0 && (
          <div className="text-center">
            <div className="flex justify-center">
              <Mascot mood="glad" size={120} />
            </div>
            <h1 className="mt-2 text-3xl font-bold">Välkommen, {first}!</h1>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Jag heter Sigge och hjälper ditt barn genom matten, ett steg i taget. Det tar bara en minut att komma igång.
            </p>
            <button onClick={() => setStep(1)} className="btn-accent mt-6 !px-8 !py-3 text-lg">
              Kom igång →
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold">Lägg till ditt barn</h1>
            <p className="mt-1 text-muted">Barnet får ett eget användarnamn. Ingen e-post behövs.</p>
            {state.students.length > 0 && (
              <ul className="mt-4 space-y-2">
                {state.students.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-navy font-bold text-gold">{s.name[0]}</span>
                    <span className="flex-1">
                      <b className="text-navy">{s.name}</b>
                      <span className="block text-sm text-muted">Årskurs {s.grade}</span>
                    </span>
                    <Icon name="klar" size={24} />
                  </li>
                ))}
              </ul>
            )}
            <form
              className="mt-4 space-y-4 rounded-2xl border-2 border-dashed border-line p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                addStudent(name, grade);
                setName("");
              }}
            >
              <label className="block text-sm">
                <span className="font-semibold text-navy">Barnets förnamn</span>
                <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="T.ex. Leo" autoFocus />
              </label>
              <div className="text-sm">
                <span className="font-semibold text-navy">Årskurs</span>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {GRADES.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setGrade(g)}
                      className={`rounded-xl border-2 py-3 font-serif text-2xl font-bold ${grade === g ? "border-navy bg-navy text-white" : "border-line text-navy hover:bg-cream"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-ghost w-full" disabled={!name.trim()}>
                <Icon name="plus" size={20} /> {state.students.length ? "Lägg till ett barn till" : "Lägg till barn"}
              </button>
            </form>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(0)} className="text-sm text-muted hover:text-navy">
                ← Tillbaka
              </button>
              <button onClick={() => setStep(2)} className="btn-primary" disabled={state.students.length === 0}>
                Fortsätt →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold">Välj nivå</h1>
            <p className="mt-1 text-muted">Börja gratis och uppgradera när ni vill. Nivån gäller alla barn på kontot.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TIER_ORDER.map((t) => (
                <button
                  key={t}
                  onClick={() => update((s) => ({ ...s, parent: { ...s.parent, tier: t } }))}
                  className={`rounded-2xl border-2 p-4 text-left transition-colors ${tier === t ? "border-navy bg-navy/5" : "border-line hover:bg-cream"}`}
                >
                  <span className="flex items-center justify-between">
                    <b className="text-lg text-navy">{TIERS[t].name}</b>
                    <span className="text-sm font-semibold text-wine">{TIERS[t].price}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">{TIERS[t].tagline}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Demo: ingen betalning görs. Betalning kopplas på i en senare fas.</p>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-muted hover:text-navy">
                ← Tillbaka
              </button>
              <button onClick={() => setStep(3)} className="btn-primary">
                Fortsätt →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="text-center">
              <div className="flex justify-center">
                <Mascot mood="hurra" size={96} />
              </div>
              <h1 className="mt-2 text-2xl font-bold">Allt är klart!</h1>
              <p className="mt-1 text-muted">Här är inloggningsuppgifterna. Spara dem eller skriv ut sidan.</p>
            </div>
            <ul className="mt-5 space-y-3">
              {state.students.map((s) => (
                <li key={s.id} className="rounded-2xl bg-gold-light/50 p-4">
                  <p className="font-bold text-navy">
                    {s.name} · åk {s.grade}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <span className="rounded-xl bg-paper px-3 py-2">
                      <span className="block text-xs text-muted">Användarnamn</span>
                      <b className="font-mono">{s.username}</b>
                    </span>
                    <span className="rounded-xl bg-paper px-3 py-2">
                      <span className="block text-xs text-muted">Lösenord</span>
                      <b className="font-mono">sigge-{s.username.length * 7}</b>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <MascotSays mood="pekar" size={48}>
                Tips: välj vad som är aktuellt för ditt barn i Föräldraportalen, till exempel det de jobbar med i skolan just nu.
              </MascotSays>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link href="/foraldraportal" onClick={() => update((s) => ({ ...s, parent: { ...s.parent, onboarded: true } }))} className="btn-ghost">
                Öppna Föräldraportalen
              </Link>
              <button onClick={finish} className="btn-accent">
                Till översikten →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
