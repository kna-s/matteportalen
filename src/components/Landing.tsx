"use client";

import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { AREAS, STEP_ICON, STEP_LABELS } from "@/lib/curriculum";
import Icon, { IconName } from "./icons/Icon";
import { TIERS, TIER_ORDER } from "@/lib/tiers";
import { ReadAloud } from "./ui";

const HERO_TEXT =
  "Ett extra stöd vid sidan av skolan. Korta videolektioner, övningar och quiz som följer kursplanen, så att ditt barn kan repetera, öva och komma ikapp hemma, i sin egen takt.";

function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-20 px-4 py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-wider text-wine">{children}</p>;
}

/** Förenklad bild av elevens vy, byggd i HTML så att den alltid matchar designen. */
function AppPreview() {
  const path = [
    { t: "Omkrets", s: "done" },
    { t: "Area", s: "done" },
    { t: "Skala", s: "current" },
    { t: "Symmetri", s: "todo" },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gold-light/60 blur-2xl" />
      <div className="overflow-hidden rounded-3xl border border-line bg-paper shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-line bg-cream px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-bad/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-good/60" />
          <span className="ml-3 text-xs text-muted">{BRAND.domain}</span>
        </div>
        <div className="space-y-4 p-5">
          <p className="font-serif text-xl font-bold text-navy">Hej Leo!</p>
          <div className="rounded-2xl bg-navy p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-gold">Nästa steg</p>
            <p className="icon-invert mt-1 flex items-center gap-2 font-semibold"><Icon name="video" size={22} /> Skala vid förstoring</p>
            <span className="mt-3 inline-block rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold text-navy">Fortsätt →</span>
          </div>
          <div className="flex items-center justify-between px-2">
            {path.map((p, i) => (
              <div key={p.t} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${
                      p.s === "done" ? "bg-good text-white" : p.s === "current" ? "bg-gold text-navy ring-4 ring-gold/30" : "bg-line text-muted"
                    }`}
                  >
                    {p.s === "done" ? "✓" : i + 1}
                  </span>
                  <span className="text-[0.65rem] text-muted">{p.t}</span>
                </div>
                {i < path.length - 1 && <span className={`mx-1 mb-4 h-1 flex-1 rounded ${p.s === "done" ? "bg-good" : "bg-line"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-line bg-paper p-3 shadow-lg sm:block">
        <p className="text-xs text-muted">Screening: Geometri</p>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-good"><Icon name="stjarna" size={16} /> Stark på omkrets</p>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-wine"><Icon name="mal" size={16} /> Öva mer på skala</p>
      </div>
    </div>
  );
}

export const FAQ = [
  {
    q: `Ersätter ${BRAND.name} skolans undervisning?`,
    a: "Nej. Vi är ett extra stöd vid sidan av skolan, som läxhjälp hemma. Eleven kan repetera det som gås igenom i klassrummet, öva mer på det som är svårt och komma ikapp i egen takt.",
  },
  {
    q: `Vilka årskurser passar ${BRAND.name} för?`,
    a: "Årskurs 4, 5 och 6. Allt innehåll följer Skolverkets centrala innehåll för matematik på mellanstadiet.",
  },
  {
    q: "Vem har gjort innehållet?",
    a: "Alla videolektioner, övningar och quiz är gjorda av våra egna lärare. Nytt material läggs upp varje månad.",
  },
  {
    q: "Behöver mitt barn en egen e-postadress?",
    a: "Nej. Du skapar ett föräldrakonto och lägger sedan till dina barn. De loggar in med ett användarnamn som du väljer.",
  },
  {
    q: "Kan vi prova innan vi betalar?",
    a: "Ja. Gratiskontot ger tillgång till två videolektioner och två övningar, så att ni kan känna efter om det passar.",
  },
  {
    q: "Kan jag byta eller säga upp abonnemanget?",
    a: "Ja, när som helst. Abonnemanget betalas månadsvis och gäller för alla barn på kontot.",
  },
];

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <Section className="!pt-10 sm:!pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="chip bg-gold-light text-gold-ink">Läxhjälp i matte för åk 4–6</span>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-[3.4rem]">
              Läxhjälpen som finns där <span className="text-wine">när du behöver den</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              {HERO_TEXT} <ReadAloud text={HERO_TEXT} />
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/logga-in?skapa=1" className="btn-accent !px-6 !py-3 text-lg">
                Skapa gratiskonto
              </Link>
              <Link href="#sa-funkar-det" className="btn-ghost !px-6 !py-3 text-lg">
                Se hur det funkar
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">Inget betalkort krävs · Säg upp när du vill</p>
          </div>
          <AppPreview />
        </div>
      </Section>

      {/* Förtroende */}
      <div className="border-y border-line bg-paper px-4 py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 text-center text-sm sm:grid-cols-4">
          {[
            ["kursplan", "Följer Skolverkets kursplan"],
            ["arskurs", "Skapat av behöriga lärare"],
            ["kalender", "Nytt material varje månad"],
            ["foraldraportal", "Föräldraportal ingår"],
          ].map(([i, t]) => (
            <div key={t} className="flex flex-col items-center gap-1.5 text-navy">
              <Icon name={i as IconName} size={36} />
              <span className="font-medium">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Problem */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Känner du igen dig?</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">När läxan tar stopp och ingen riktigt vet varför</h2>
          <p className="mt-4 text-lg text-muted">
            Många barn tappar tråden i matten på mellanstadiet. Det är sällan allt som är svårt, oftast är det ett par delmoment som skaver. {BRAND.name} är ett stöd vid sidan av skolan som hjälper er att hitta just
            dem och öva i lugn och ro hemma, utan stress och tidspress.
          </p>
        </div>
      </Section>

      {/* Så funkar det */}
      <Section id="sa-funkar-det" className="bg-navy text-white">
        <Eyebrow>
          <span className="text-gold">Så funkar det</span>
        </Eyebrow>
        <h2 className="mt-2 text-3xl font-bold !text-white sm:text-4xl">Fyra steg, ett klick i taget</h2>
        <p className="mt-3 max-w-2xl text-white/70">Varje kapitel har samma enkla upplägg. Eleven klickar bara på ”Nästa” så leder sidan vidare.</p>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(["video", "ovning", "quiz", "screening"] as const).map((t, i) => (
            <li key={t} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 icon-invert"><Icon name={STEP_ICON[t]} size={36} /></span>
                <span className="font-serif text-4xl font-bold text-white/15">{i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold !text-white">{STEP_LABELS[t]}</h3>
              <p className="mt-1 text-sm text-white/70">
                {
                  {
                    video: "En kort lektion där en av våra lärare förklarar ett delmoment i taget.",
                    ovning: "Uppgifter att göra efter kapitlet, med hjälpmedel som linjal och kalkylator.",
                    quiz: "Självrättande frågor som visar direkt hur det gick.",
                    screening: "En kartläggning av vad eleven är stark på och vad som behöver övas mer.",
                  }[t]
                }
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* För elev och förälder */}
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card !p-8">
            <Icon name="elev" size={52} />
            <h3 className="mt-3 text-2xl font-bold">För eleven</h3>
            <ul className="mt-4 space-y-2 text-muted">
              <li>✓ Alltid tydligt vad nästa steg är</li>
              <li>✓ Korta lektioner i egen takt</li>
              <li>✓ Hjälpmedel som kalkylator, linjal och tallinje</li>
              <li>✓ Uppmuntran i stället för stress</li>
            </ul>
          </div>
          <div className="card !p-8">
            <Icon name="foraldraportal" size={52} />
            <h3 className="mt-3 text-2xl font-bold">För dig som förälder</h3>
            <ul className="mt-4 space-y-2 text-muted">
              <li>✓ Se hur det går och vad som behöver övas</li>
              <li>✓ Veckorapport direkt i inkorgen</li>
              <li>✓ Flera barn på samma konto</li>
              <li>✓ Inga bindningstider</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Kursplan */}
      <Section id="kursplan" className="bg-paper">
        <Eyebrow>Kursplan</Eyebrow>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Allt som ska läras i åk 4–6</h2>
        <p className="mt-3 max-w-2xl text-muted">Innehållet är uppdelat på samma sex områden som i Skolverkets kursplan.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <div key={a.id} className="rounded-2xl border border-line bg-cream p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: `${a.color}18` }}>
                  <Icon name={a.icon} size={32} />
                </span>
                <h3 className="font-bold">{a.title}</h3>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {a.topics.slice(0, 4).map((t) => (
                  <li key={t}>· {t}</li>
                ))}
                {a.topics.length > 4 && <li className="text-xs">+ {a.topics.length - 4} till</li>}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Priser */}
      <Section id="priser">
        <div className="text-center">
          <Eyebrow>Priser</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Börja gratis, uppgradera när ni vill</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIER_ORDER.map((t) => (
            <div key={t} className={`card relative flex flex-col !p-6 ${t === "premium" ? "border-gold ring-2 ring-gold/50" : ""}`}>
              {t === "premium" && <span className="chip absolute -top-3 left-6 bg-gold text-navy">Mest populär</span>}
              <h3 className="text-xl font-bold">{TIERS[t].name}</h3>
              <p className="mt-1 font-serif text-2xl font-bold text-wine">{TIERS[t].price}</p>
              <p className="mt-2 text-sm text-muted">{TIERS[t].tagline}</p>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                {TIERS[t].features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-good">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/logga-in?skapa=1" className={`mt-5 ${t === "premium" ? "btn-accent" : "btn-ghost"}`}>
                {t === "gratis" ? "Skapa gratiskonto" : `Välj ${TIERS[t].name}`}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="fragor" className="bg-paper">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Vanliga frågor</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold">Bra att veta</h2>
          <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-cream">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-navy">
                  {f.q}
                  <span className="ml-4 text-wine transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* Slut-CTA */}
      <Section>
        <div className="rounded-3xl bg-wine px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold !text-white sm:text-4xl">Ge ditt barn ett extra stöd i matten</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Skapa ett gratiskonto på en minut och testa två lektioner tillsammans med ditt barn.</p>
          <Link href="/logga-in?skapa=1" className="btn mt-6 bg-gold !px-6 !py-3 text-lg text-navy hover:bg-gold-light">
            Kom igång gratis
          </Link>
        </div>
      </Section>
    </>
  );
}
