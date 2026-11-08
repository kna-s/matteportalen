// Små roliga saker som Sigge säger på elevens startsida när eleven stannar
// en stund. Kontrollera att varje fakta stämmer innan nya läggs till.

export interface SiggeLine {
  kind: "fakta" | "tips" | "pepp";
  text: string;
}

export const SIGGE_LINES: SiggeLine[] = [
  { kind: "fakta", text: "Ett dygn har 86 400 sekunder. Det är 24 · 60 · 60." },
  { kind: "fakta", text: "Om du viker ett papper dubbelt blir det dubbelt så tjockt. Efter 7 vikningar är det 128 lager!" },
  { kind: "fakta", text: "Alla tal som slutar på 0 eller 5 går att dela med 5." },
  { kind: "fakta", text: "Är siffersumman delbar med 3 så är hela talet det också. Testa med 123: 1 + 2 + 3 = 6." },
  { kind: "fakta", text: "Bin bygger sina vaxkakor som sexhörningar. Formen sparar både plats och vax." },
  { kind: "fakta", text: "Vinklarna i en triangel blir alltid 180 grader tillsammans, hur triangeln än ser ut." },
  { kind: "fakta", text: "Pi börjar med 3,14 och tar aldrig slut. Decimalerna fortsätter i all oändlighet." },
  { kind: "fakta", text: "1 + 2 + 3 + … + 100 = 5050. Knepet: 1 + 100, 2 + 99 och så vidare blir 50 par som alla är 101." },
  { kind: "fakta", text: "11 · 11 = 121 och 111 · 111 = 12 321. Ser du mönstret?" },
  { kind: "fakta", text: "Romarna skrev 10 som X, 50 som L och 100 som C. De hade ingen siffra för noll." },
  { kind: "fakta", text: "En snöflinga har nästan alltid sex armar. Den är symmetrisk!" },
  { kind: "fakta", text: "En kub har 6 sidor, 8 hörn och 12 kanter." },
  { kind: "fakta", text: "Ett år har 52 veckor och en eller två dagar till." },
  { kind: "fakta", text: "−5 grader är kallare än −2 grader. Ju längre från noll på minussidan, desto kallare." },
  { kind: "fakta", text: "När du gångrar med 10 flyttar varje siffra ett steg åt vänster: 34 blir 340." },
  { kind: "fakta", text: "Många sköldpaddor har 13 stora plattor mitt på skalet. Jag har räknat mina!" },
  { kind: "tips", text: "Fastnar du? Rita! En bild gör ofta ett klurigt problem mycket enklare." },
  { kind: "tips", text: "Gör ett överslag först, så märker du direkt om svaret verkar rimligt." },
  { kind: "tips", text: "Läs frågan två gånger. Ofta gömmer sig en ledtråd i texten." },
  { kind: "pepp", text: "Hjärnan blir starkare när du övar på något som känns svårt. Precis som en muskel!" },
  { kind: "pepp", text: "Att göra fel är en del av att lära sig. Varje fel visar vad vi ska öva på." },
  { kind: "pepp", text: "Lite varje dag slår mycket en gång. Ett steg i taget!" },
];

export const LINE_LABEL: Record<SiggeLine["kind"], string> = { fakta: "Visste du?", tips: "Tips!", pepp: "Kom ihåg:" };

/** Blandar listan så att Sigge inte säger samma sak i samma ordning varje gång. */
export function shuffledLines() {
  const a = [...SIGGE_LINES];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
