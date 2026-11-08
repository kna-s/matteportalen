"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AREAS } from "@/lib/curriculum";
import { BRAND } from "@/lib/brand";
import { MASCOTS, useStore } from "@/lib/store";
import { TIERS, TIER_ORDER } from "@/lib/tiers";
import Icon, { IconName } from "./icons/Icon";
import Mascot, { Mood } from "./Mascot";
import { BadgeMedal } from "./Badges";
import { BADGES } from "@/lib/badges";
import { FAQ } from "./Landing";

/* ------------------------------------------------------------------ */
/* Hjälpkomponenter                                                     */
/* ------------------------------------------------------------------ */

/** Tonar in innehåll när det kommer in i bild. */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Mjuk våg mellan sektioner. */
function Wave({ from, to, flip = false }: { from: string; to: string; flip?: boolean }) {
  return (
    <div style={{ background: from }} aria-hidden>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className={`block h-12 w-full sm:h-20 ${flip ? "-scale-x-100" : ""}`}>
        <path d="M0 40 C 240 90, 480 0, 720 30 S 1200 80, 1440 20 V80 H0 Z" fill={to} />
      </svg>
    </div>
  );
}

const SYMBOLS = [
  { s: "+", x: "6%", y: "18%", size: 42, d: "7s", r: "-10deg" },
  { s: "÷", x: "88%", y: "12%", size: 38, d: "8s", r: "12deg" },
  { s: "π", x: "78%", y: "78%", size: 52, d: "9s", r: "-6deg" },
  { s: "△", x: "12%", y: "80%", size: 36, d: "6.5s", r: "8deg" },
  { s: "×", x: "46%", y: "8%", size: 30, d: "7.5s", r: "20deg" },
  { s: "½", x: "60%", y: "90%", size: 34, d: "8.5s", r: "-14deg" },
  { s: "=", x: "28%", y: "50%", size: 28, d: "10s", r: "0deg" },
];

function FloatingSymbols({ color = "rgba(255,255,255,0.12)" }: { color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {SYMBOLS.map((x, i) => (
        <span key={i} className="float-sym" style={{ left: x.x, top: x.y, fontSize: x.size, color, ["--d" as string]: x.d, ["--r" as string]: x.r }}>
          {x.s}
        </span>
      ))}
      {/* sexhörningar från skalet */}
      <svg className="absolute -right-10 top-10 opacity-[0.07]" width="260" height="260" viewBox="0 0 100 100">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <path
              key={`${r}${c}`}
              d="M10 0 L20 0 L25 9 L20 18 L10 18 L5 9 Z"
              transform={`translate(${c * 30 + (r % 2) * 15} ${r * 20})`}
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
          )),
        )}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: maskoten + prova en fråga                                      */
/* ------------------------------------------------------------------ */

const BUBBLES = ["Fastnat på bråk?", "Vi tar det steg för steg.", "Läxhjälp när du behöver den!", "Testa en fråga här bredvid!"];

const TRY_QUESTIONS = [
  { q: "Vad är 25 % av 40?", options: ["5", "10", "15", "20"], correct: 1, hint: "25 % är en fjärdedel. 40 delat med 4 är 10." },
  { q: "Hur många grader är en rät vinkel?", options: ["45°", "90°", "120°", "180°"], correct: 1, hint: "En rät vinkel ser ut som hörnet på ett papper: 90°." },
  { q: "Vad är 3/4 av 12?", options: ["6", "8", "9", "10"], correct: 2, hint: "En fjärdedel av 12 är 3. Tre fjärdedelar blir 3 × 3 = 9." },
];

function TryQuestion() {
  const { state } = useStore();
  const name = MASCOTS.find((m) => m.id === state.mascot)?.name ?? "Sigge";
  const [bubble, setBubble] = useState(0);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = TRY_QUESTIONS[qi];
  const answered = picked !== null;
  const right = picked === q.correct;
  const last = qi === TRY_QUESTIONS.length - 1;

  useEffect(() => {
    if (answered) return;
    const t = setInterval(() => setBubble((b) => (b + 1) % BUBBLES.length), 2800);
    return () => clearInterval(t);
  }, [answered]);

  const mood: Mood = !answered ? "glad" : right ? "hurra" : "tanker";
  const say = !answered ? BUBBLES[bubble] : right ? "Rätt! Snyggt räknat!" : "Nästan! Kika på tipset.";

  return (
    <div className="relative">
      {/* maskoten med pratbubbla */}
      <div className="relative z-10 mb-[-28px] flex items-end gap-2 pl-4">
        <Mascot mood={mood} size={128} />
        <div key={say} className="bubble-in mb-16 max-w-[220px] rounded-2xl rounded-bl-sm bg-paper px-4 py-2.5 font-semibold text-navy shadow-lg">
          {say}
        </div>
      </div>
      <div className="relative rounded-3xl bg-paper p-6 pt-10 text-ink shadow-2xl ring-1 ring-black/5">
        <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-wine">Prova en fråga med {name}</span>
          <span className="text-muted">
            {qi + 1} / {TRY_QUESTIONS.length}
          </span>
        </div>
        <p className="font-serif text-2xl font-bold text-navy">{q.q}</p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {q.options.map((o, i) => {
            const style = answered
              ? i === q.correct
                ? "border-good bg-good/10 text-good"
                : i === picked
                  ? "border-gold bg-gold-light text-gold-ink"
                  : "border-line opacity-50"
              : "border-line hover:border-navy hover:bg-cream";
            return (
              <button
                key={o}
                disabled={answered}
                onClick={() => {
                  setPicked(i);
                  if (i === q.correct) setScore((s) => s + 1);
                }}
                className={`rounded-2xl border-2 py-3 text-xl font-bold transition-all ${style}`}
              >
                {o}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="bubble-in mt-4">
            {!right && <p className="rounded-xl bg-cream p-3 text-sm">💡 {q.hint}</p>}
            {last ? (
              <div className="mt-3 rounded-2xl bg-navy p-4 text-white">
                <p className="font-bold">
                  Du fick {score} av {TRY_QUESTIONS.length} rätt!
                </p>
                <p className="text-sm text-white/80">Vill ditt barn öva mer? Det finns hundratals uppgifter som följer kursplanen.</p>
                <Link href="/logga-in?skapa=1" className="btn mt-3 bg-gold text-navy hover:bg-gold-light">
                  Skapa gratiskonto →
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setQi((x) => x + 1);
                  setPicked(null);
                }}
                className="btn-primary mt-3 w-full"
              >
                Nästa fråga →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stigen: så funkar det                                                */
/* ------------------------------------------------------------------ */

const PATH_STEPS: { icon: IconName; title: string; text: string; mood: Mood }[] = [
  { icon: "video", title: "Titta på en kort video", text: "En av våra lärare förklarar ett delmoment i taget. Pausa och titta igen så många gånger du vill.", mood: "glad" },
  { icon: "ovning", title: "Öva i lugn och ro", text: "Uppgifter att göra efter videon, med hjälpmedel som linjal, kalkylator och en rityta.", mood: "tanker" },
  { icon: "quiz", title: "Testa dig själv", text: "En fråga i taget, med direkt och snäll återkoppling. Inget rött kryss, bara ”nästan, testa igen”.", mood: "glad" },
  { icon: "screening", title: "Se vad du kan", text: "Screeningen visar vad som sitter och vad som behöver lite mer träning, både för eleven och föräldern.", mood: "tanker" },
  { icon: "marken", title: "Samla märken", text: "Varje steg framåt syns. Märken, stjärnor och en stig som fylls i gör att man vill fortsätta.", mood: "hurra" },
];

function PathSection() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <ol className="relative mx-auto mt-12 max-w-4xl">
      {/* stigen */}
      <span className="absolute bottom-8 left-8 top-8 w-2 rounded-full bg-white/15 md:left-1/2 md:-translate-x-1/2" aria-hidden />
      <span
        className="absolute left-8 top-8 w-2 rounded-full bg-gold transition-all duration-700 md:left-1/2 md:-translate-x-1/2"
        style={{ height: `calc(${(active / (PATH_STEPS.length - 1)) * 100}% - ${active === PATH_STEPS.length - 1 ? 64 : 32}px)` }}
        aria-hidden
      />
      {PATH_STEPS.map((s, i) => {
        const on = i <= active;
        const left = i % 2 === 0;
        return (
          <li key={s.title} data-i={i} ref={(el) => void (refs.current[i] = el)} className="relative grid min-h-44 items-center py-6 md:grid-cols-2 md:gap-16">
            {/* nod */}
            <span
              className={`absolute left-8 top-1/2 z-10 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-all duration-500 md:left-1/2 ${
                on ? "scale-100 bg-gold" : "scale-90 bg-navy-light"
              }`}
            >
              <span className={on ? "" : "icon-invert"}>
                <Icon name={s.icon} size={30} />
              </span>
            </span>
            {/* maskoten går längs stigen */}
            {i === active && (
              <span className={`bubble-in absolute top-1/2 z-20 hidden -translate-y-[85%] md:block ${left ? "left-[calc(50%+2.5rem)]" : "right-[calc(50%+2.5rem)]"}`}>
                <Mascot mood={s.mood} size={84} />
              </span>
            )}
            <div className={`pl-20 md:pl-0 ${left ? "md:col-start-1 md:text-right" : "md:col-start-2"}`}>
              <p className="text-sm font-bold uppercase tracking-wider text-gold">Steg {i + 1}</p>
              <h3 className="mt-1 text-2xl font-bold !text-white">{s.title}</h3>
              <p className={`mt-2 text-white/75 ${left ? "md:ml-auto" : ""} max-w-sm`}>{s.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Sidan                                                                */
/* ------------------------------------------------------------------ */

const AREA_TEXT: Record<string, string> = {
  taluppfattning: "Bråk, decimaler, procent och huvudräkning",
  algebra: "Likheter, mönster och enkla ekvationer",
  geometri: "Former, omkrets, area och symmetri",
  sannolikhet: "Chans, diagram och medelvärde",
  samband: "Proportioner, koordinater och grafer",
  problemlosning: "Strategier för kluriga uppgifter",
};

const QUOTES = [
  { text: "Äntligen slipper vi gräla om matteläxan. Hon kollar videon själv och sen kör hon.", who: "Förälder till elev i åk 5" },
  { text: "Sigge säger nästan i stället för fel. Då vill jag testa igen.", who: "Elev i åk 4" },
  { text: "Screeningen visade exakt var det skavde. Bråk! Nu vet vi vad vi ska öva på.", who: "Förälder till elev i åk 6" },
];

export default function LandingNew() {
  const CREAM = "var(--color-cream)";
  const NAVY = "var(--color-navy)";
  const PAPER = "var(--color-paper)";

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative bg-navy px-4 pb-16 pt-12 text-white sm:pb-24 sm:pt-16">
        <FloatingSymbols />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="chip bg-white/10 text-gold">Läxhjälp i matte för åk 4–6</span>
            <h1 className="mt-4 text-4xl font-bold !text-white sm:text-5xl lg:text-6xl">
              Läxhjälpen som finns där <span className="text-gold">när du behöver den</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Ett extra stöd vid sidan av skolan. Korta videor, övningar och quiz som följer kursplanen, så att ditt barn kan öva och komma ikapp hemma, i sin egen takt.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/logga-in?skapa=1" className="btn bg-gold !px-7 !py-3.5 text-lg text-navy hover:bg-gold-light">
                Skapa gratiskonto
              </Link>
              <a href="#sa-funkar-det" className="btn border border-white/30 !px-7 !py-3.5 text-lg text-white hover:bg-white/10">
                Se hur det funkar
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
              <span>✓ Inget betalkort</span>
              <span>✓ Följer Skolverkets kursplan</span>
              <span>✓ Säg upp när du vill</span>
            </div>
          </div>
          <TryQuestion />
        </div>
      </section>
      <Wave from={NAVY} to={CREAM} />

      {/* PROBLEM + BERÄTTELSE */}
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-wider text-wine">Känner du igen dig?</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">När läxan tar stopp och ingen riktigt vet varför</h2>
            <p className="mt-4 text-lg text-muted">
              Många barn tappar tråden i matten på mellanstadiet. Det är sällan allt som är svårt, oftast är det ett par delmoment som skaver. {BRAND.name} hjälper er att hitta
              just dem och öva i lugn och ro hemma.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="rounded-3xl bg-paper p-6 shadow-lg ring-1 ring-line">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-wine text-lg font-bold text-white">L</span>
                <div>
                  <p className="font-bold text-navy">Leo, åk 4</p>
                  <p className="text-sm text-muted">Tre veckor med {BRAND.name}</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {[
                  { label: "Bråk", before: 0.33, after: 0.83 },
                  { label: "Huvudräkning", before: 0.5, after: 0.83 },
                  { label: "Omkrets och area", before: 0.5, after: 1 },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-semibold text-navy">{r.label}</span>
                      <span className="text-muted">
                        {Math.round(r.before * 100)} % → <b className="text-good">{Math.round(r.after * 100)} %</b>
                      </span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-line">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-good/80" style={{ width: `${r.after * 100}%` }} />
                      <div className="absolute inset-y-0 left-0 rounded-full bg-gold" style={{ width: `${r.before * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-3 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-gold" /> Före
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-good/80" /> Efter
                </span>
                <span className="ml-auto italic">Exempel</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STIGEN */}
      <Wave from={CREAM} to={NAVY} flip />
      <section id="sa-funkar-det" className="relative scroll-mt-16 bg-navy px-4 py-14 text-white sm:py-20">
        <FloatingSymbols color="rgba(255,255,255,0.06)" />
        <div className="relative mx-auto max-w-6xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-gold">Så funkar det</p>
          <h2 className="mt-2 text-3xl font-bold !text-white sm:text-4xl">Ett steg i taget</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">Varje kapitel följer samma enkla stig. Eleven klickar bara på ”Nästa” så leder sidan vidare.</p>
        </div>
        <div className="relative">
          <PathSection />
        </div>
      </section>
      <Wave from={NAVY} to={PAPER} />

      {/* OMRÅDEN */}
      <section id="kursplan" className="scroll-mt-16 bg-paper px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-wine">Kursplan</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Allt som ska läras i åk 4–6</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">Samma sex områden som i Skolverkets kursplan, med nytt material varje månad.</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AREAS.map((a, i) => (
              <Reveal key={a.id} delay={i * 80}>
                <div className="group relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ background: `${a.color}17` }}>
                  <span className="absolute -bottom-6 -right-6 opacity-20 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <Icon name={a.icon} size={130} />
                  </span>
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-paper shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon name={a.icon} size={40} />
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{a.title}</h3>
                  <p className="mt-1 text-muted">{AREA_TEXT[a.id]}</p>
                  <p className="mt-3 text-sm font-semibold" style={{ color: a.color }}>
                    {a.topics.length} delmoment →
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FÖR FÖRÄLDERN */}
      <section className="px-4 py-14 sm:py-20" style={{ background: "#e6f4ef" }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="rotate-[-1.5deg] rounded-3xl bg-paper p-6 shadow-xl ring-1 ring-line">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-bold text-navy">
                  <Icon name="brev" size={24} /> Veckorapport
                </p>
                <span className="text-xs text-muted">Söndag 9 nov</span>
              </div>
              <p className="mt-3 text-sm">
                Den här veckan har <b>Leo</b> gjort <b>12 steg</b> och <b>3 quiz</b>.
              </p>
              <div className="mt-4 flex h-24 items-end gap-2">
                {[3, 0, 4, 2, 0, 1, 2].map((n, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <div className={`w-full rounded-t-md ${n ? "bg-gold" : "bg-line"}`} style={{ height: n ? `${n * 20}%` : 4 }} />
                    <span className="text-[0.65rem] text-muted">{["M", "T", "O", "T", "F", "L", "S"][i]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-cream p-3 text-sm">
                <p className="flex items-center gap-2 font-semibold text-wine">
                  <Icon name="mal" size={18} /> Behöver öva på
                </p>
                <p className="mt-0.5">Bråk och decimaler i vardagen</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <BadgeMedal badge={BADGES[0]} earned size={36} />
                <BadgeMedal badge={BADGES.find((b) => b.id === "fullpott")!} earned size={36} />
                <span className="text-sm text-muted">2 nya märken</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-sm font-bold uppercase tracking-wider text-wine">För dig som förälder</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Du ser vad som händer, utan att behöva tjata</h2>
            <ul className="mt-6 space-y-3 text-lg">
              {[
                ["brev", "Veckorapport i inkorgen varje söndag"],
                ["screening", "Se exakt vad barnet behöver öva på"],
                ["aktuellt", "Välj vad som är aktuellt, till exempel skolans prov"],
                ["foraldraportal", "Flera barn på samma konto"],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper shadow-sm">
                    <Icon name={icon as IconName} size={24} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CITAT */}
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Vad familjer säger</h2>
            <p className="mt-2 text-sm italic text-muted">Exempel, byts mot riktiga omdömen</p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {QUOTES.map((q, i) => (
              <Reveal key={q.who} delay={i * 120}>
                <figure className={`h-full rounded-3xl bg-paper p-6 shadow-sm ring-1 ring-line ${i === 1 ? "md:-translate-y-4" : ""}`}>
                  <span className="font-serif text-5xl leading-none text-gold">”</span>
                  <blockquote className="mt-1 text-lg">{q.text}</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-muted">{q.who}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRISER */}
      <section id="priser" className="scroll-mt-16 bg-paper px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-wine">Priser</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Börja gratis, uppgradera när ni vill</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIER_ORDER.map((t, i) => (
              <Reveal key={t} delay={i * 80}>
                <div className={`relative flex h-full flex-col rounded-3xl p-6 ${t === "premium" ? "bg-navy text-white shadow-xl" : "bg-cream"}`}>
                  {t === "premium" && <span className="chip absolute -top-3 left-6 bg-gold text-navy">Mest populär</span>}
                  <h3 className={`text-xl font-bold ${t === "premium" ? "!text-white" : ""}`}>{TIERS[t].name}</h3>
                  <p className={`mt-1 font-serif text-2xl font-bold ${t === "premium" ? "text-gold" : "text-wine"}`}>{TIERS[t].price}</p>
                  <p className={`mt-2 text-sm ${t === "premium" ? "text-white/75" : "text-muted"}`}>{TIERS[t].tagline}</p>
                  <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                    {TIERS[t].features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className={t === "premium" ? "text-gold" : "text-good"}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/logga-in?skapa=1" className={`mt-5 ${t === "premium" ? "btn bg-gold text-navy hover:bg-gold-light" : "btn-ghost"}`}>
                    {t === "gratis" ? "Börja gratis" : `Välj ${TIERS[t].name}`}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="fragor" className="scroll-mt-16 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold">Vanliga frågor</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-paper p-5 ring-1 ring-line open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-navy">
                  {f.q}
                  <span className="ml-4 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-wine transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SLUT-CTA */}
      <section className="px-4 pb-16">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-wine px-6 py-12 text-white sm:px-12">
          <FloatingSymbols color="rgba(255,255,255,0.15)" />
          <div className="relative grid items-center gap-6 md:grid-cols-[auto_1fr]">
            <Mascot mood="hurra" size={150} className="mx-auto" />
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold !text-white sm:text-4xl">Ge ditt barn ett extra stöd i matten</h2>
              <p className="mt-2 max-w-xl text-white/85">Skapa ett gratiskonto på en minut och testa två lektioner tillsammans med ditt barn.</p>
              <Link href="/logga-in?skapa=1" className="btn mt-6 bg-gold !px-7 !py-3.5 text-lg text-navy hover:bg-gold-light">
                Kom igång gratis →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
