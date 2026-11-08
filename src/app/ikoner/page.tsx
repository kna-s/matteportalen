"use client";

import Icon, { IconName } from "@/components/icons/Icon";

/** FÖRHANDSVISNING: egna ikoner som ska ersätta emojis. Inte inkopplade på sajten än. */

const GROUPS: { title: string; items: { name: IconName; label: string; emoji: string }[] }[] = [
  {
    title: "Meny",
    items: [
      { name: "hem", label: "Startsida", emoji: "🏠" },
      { name: "arskurs", label: "Välj årskurs", emoji: "🎓" },
      { name: "video", label: "Videolektioner", emoji: "🎥" },
      { name: "ovning", label: "Övningar", emoji: "✏️" },
      { name: "quiz", label: "Quiz", emoji: "🏆" },
      { name: "screening", label: "Screening", emoji: "🧠" },
      { name: "resultat", label: "Resultat", emoji: "📊" },
      { name: "marken", label: "Märken", emoji: "🏅" },
      { name: "foraldraportal", label: "Föräldraportal", emoji: "👨‍👩‍👧" },
      { name: "kursplan", label: "Kursplan", emoji: "📚" },
      { name: "abonnemang", label: "Abonnemang", emoji: "💳" },
      { name: "admin", label: "Administration", emoji: "🛠️" },
    ],
  },
  {
    title: "Områden",
    items: [
      { name: "taluppfattning", label: "Taluppfattning", emoji: "🔢" },
      { name: "algebra", label: "Algebra", emoji: "🧩" },
      { name: "geometri", label: "Geometri", emoji: "📐" },
      { name: "sannolikhet", label: "Sannolikhet & statistik", emoji: "🎲" },
      { name: "samband", label: "Samband & förändring", emoji: "📈" },
      { name: "problemlosning", label: "Problemlösning", emoji: "💡" },
    ],
  },
  {
    title: "Hjälpmedel",
    items: [
      { name: "kalkylator", label: "Kalkylator", emoji: "🧮" },
      { name: "linjal", label: "Linjal", emoji: "📏" },
      { name: "gradskiva", label: "Gradskiva", emoji: "📐" },
      { name: "koordinatsystem", label: "Koordinatsystem", emoji: "📈" },
      { name: "tallinje", label: "Tallinje", emoji: "↔️" },
    ],
  },
  {
    title: "Övrigt",
    items: [
      { name: "aktuellt", label: "Aktuellt", emoji: "📌" },
      { name: "lyssna", label: "Lyssna", emoji: "🔊" },
      { name: "las", label: "Låst", emoji: "🔒" },
      { name: "klar", label: "Klar", emoji: "✓" },
      { name: "stjarna", label: "Stjärna", emoji: "⭐" },
      { name: "firande", label: "Firande", emoji: "🎉" },
      { name: "mal", label: "Mål", emoji: "🎯" },
      { name: "prat", label: "Kommentar", emoji: "💬" },
      { name: "kalender", label: "Kalender", emoji: "🗓️" },
      { name: "plus", label: "Lägg till", emoji: "➕" },
      { name: "brev", label: "Veckorapport", emoji: "📬" },
      { name: "elev", label: "Elev", emoji: "🧒" },
    ],
  },
];

const AREA_TILES: { name: IconName; label: string; bg: string }[] = [
  { name: "taluppfattning", label: "Taluppfattning och tals användning", bg: "#e3f1f4" },
  { name: "algebra", label: "Algebra", bg: "#fdeee4" },
  { name: "geometri", label: "Geometri", bg: "#e6f5ee" },
  { name: "sannolikhet", label: "Sannolikhet och statistik", bg: "#fff4d6" },
  { name: "samband", label: "Samband och förändring", bg: "#eeeafa" },
  { name: "problemlosning", label: "Problemlösning", bg: "#fde8ee" },
];

export default function IconPreview() {
  return (
    <div className="space-y-12">
      <div>
        <span className="chip bg-gold-light text-gold-ink">Ikonbibliotek</span>
        <h1 className="page-title mt-3">Egna ikoner</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Ett förslag på egna ikoner som ersätter emojis. Alla är ritade i samma stil: rundade linjer i sajtens primärfärg med fyllnad i gult och detaljer i orange. De
          byter färg automatiskt om paletten ändras.
        </p>
      </div>

      {/* Före / efter */}
      <section>
        <h2 className="text-2xl font-bold">Före och efter: menyn</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {[false, true].map((custom) => (
            <div key={String(custom)} className="rounded-3xl bg-paper p-4 ring-1 ring-line">
              <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-muted">{custom ? "Egna ikoner" : "Idag (emojis)"}</p>
              <ul className="space-y-0.5">
                {GROUPS[0].items.slice(0, 8).map((it, i) => (
                  <li key={it.name} className={`flex items-center gap-3 rounded-xl px-3 py-2 font-medium ${i === 0 ? "bg-navy text-white" : "text-navy"}`}>
                    {custom ? (
                      <span style={i === 0 ? ({ "--icon-stroke": "#fff" } as React.CSSProperties) : undefined}>
                        <Icon name={it.name} size={22} />
                      </span>
                    ) : (
                      <span className="w-[22px] text-center text-lg">{it.emoji}</span>
                    )}
                    {it.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Hela uppsättningen */}
      {GROUPS.map((g) => (
        <section key={g.title}>
          <h2 className="text-2xl font-bold">{g.title}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {g.items.map((it) => (
              <div key={it.name} className="flex flex-col items-center rounded-2xl bg-paper p-4 text-center ring-1 ring-line">
                <Icon name={it.name} size={48} />
                <p className="mt-2 text-sm font-semibold text-navy">{it.label}</p>
                <p className="text-xs text-muted">
                  ersätter <span className="text-base">{it.emoji}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* I sammanhang */}
      <section>
        <h2 className="text-2xl font-bold">I sammanhang: områdeskort</h2>
        <p className="mt-1 text-muted">Så kan ikonerna se ut på kursplanen och elevens startsida, med en egen ljus bakgrund per område.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREA_TILES.map((a) => (
            <div key={a.name} className="flex items-center gap-4 rounded-2xl bg-paper p-4 ring-1 ring-line">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl" style={{ background: a.bg }}>
                <Icon name={a.name} size={40} />
              </span>
              <div>
                <p className="font-bold text-navy">{a.label}</p>
                <p className="text-sm text-muted">8 kapitel</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">I sammanhang: lektionsflödet och hjälpmedel</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["video", "ovning", "quiz", "screening"] as IconName[]).map((n, i) => (
            <span key={n} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${i === 1 ? "border-navy bg-navy text-white" : "border-line bg-paper text-navy"}`}>
              <b>{i + 1}</b>
              <span style={i === 1 ? ({ "--icon-stroke": "#fff" } as React.CSSProperties) : undefined}>
                <Icon name={n} size={20} />
              </span>
              {["Videolektion", "Övning", "Quiz", "Screening"][i]}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["kalkylator", "linjal", "gradskiva", "koordinatsystem", "tallinje"] as IconName[]).map((n) => (
            <span key={n} className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-1.5 text-sm font-medium text-navy">
              <Icon name={n} size={20} />
              {n[0].toUpperCase() + n.slice(1)}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">På mörk bakgrund</h2>
        <div className="mt-4 flex flex-wrap gap-4 rounded-3xl bg-navy p-6" style={{ "--icon-stroke": "#fff" } as React.CSSProperties}>
          {(["hem", "video", "ovning", "quiz", "screening", "marken", "geometri", "firande"] as IconName[]).map((n) => (
            <Icon key={n} name={n} size={40} />
          ))}
        </div>
      </section>
    </div>
  );
}
