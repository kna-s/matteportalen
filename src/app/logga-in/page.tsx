"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { state, login } = useStore();
  const router = useRouter();
  const [mode, setMode] = useState<"logga-in" | "skapa">("logga-in");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("skapa")) setMode("skapa");
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="page-title text-center">Välkommen till Matteportalen</h1>
      <p className="mt-2 text-center text-muted">
        Det här är en demoversion. Välj vem du vill logga in som för att se hur sidan ser ut för olika användare.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card flex flex-col">
          <div className="text-3xl">🧒</div>
          <h2 className="mt-2 text-xl font-bold">Elev</h2>
          <p className="flex-1 text-sm text-muted">Logga in med användarnamnet som din förälder skapade.</p>
          <div className="mt-3 flex flex-col gap-2">
            {state.students.map((s) => (
              <button
                key={s.id}
                className="btn-primary"
                onClick={() => {
                  login("elev", s.id);
                  router.push("/");
                }}
              >
                {s.name} (åk {s.grade})
              </button>
            ))}
          </div>
        </div>
        <div className="card flex flex-col">
          <div className="text-3xl">👨‍👩‍👧</div>
          <h2 className="mt-2 text-xl font-bold">Förälder</h2>
          <p className="flex-1 text-sm text-muted">Hantera barnens konton, följ deras resultat och sköt abonnemanget.</p>
          <button
            className="btn-accent mt-3"
            onClick={() => {
              login("foralder");
              router.push("/foraldraportal");
            }}
          >
            {state.parent.name}
          </button>
        </div>
        <div className="card flex flex-col">
          <div className="text-3xl">🧑‍🏫</div>
          <h2 className="mt-2 text-xl font-bold">Lärare</h2>
          <p className="flex-1 text-sm text-muted">För våra lärare: lägg upp innehåll och välj vad som är aktuellt.</p>
          <button
            className="btn-ghost mt-3"
            onClick={() => {
              login("admin");
              router.push("/larare");
            }}
          >
            Logga in som lärare
          </button>
        </div>
      </div>

      <div className="card mt-8">
        <div className="flex gap-2">
          <button onClick={() => setMode("logga-in")} className={mode === "logga-in" ? "btn-primary" : "btn-ghost"}>
            Logga in
          </button>
          <button onClick={() => setMode("skapa")} className={mode === "skapa" ? "btn-primary" : "btn-ghost"}>
            Skapa föräldrakonto
          </button>
        </div>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            login("foralder");
            router.push("/foraldraportal");
          }}
        >
          {mode === "skapa" && <input className="input" placeholder="Ditt namn" />}
          <input className="input" type="email" placeholder="E-post" />
          <input className="input" type="password" placeholder="Lösenord" />
          <button className="btn-primary">{mode === "skapa" ? "Skapa konto (gratis)" : "Logga in"}</button>
          <p className="text-xs text-muted">
            Riktig inloggning kopplas på i nästa fas. Alla nya konton börjar på gratisnivån. Elevkonton skapas av föräldern i Föräldraportalen.
          </p>
        </form>
      </div>
    </div>
  );
}
