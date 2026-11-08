// Uppmuntran efter en paus. Aldrig skuldbeläggande, alltid ett litet och
// konkret nästa steg.

import { StudentProgress } from "./store";

/** Antal hela dagar sedan eleven senast gjorde något (null = aldrig). */
export function daysSinceActive(p: StudentProgress): number | null {
  const dates = [...Object.values(p.completed), ...p.quizResults.map((r) => r.date)];
  if (!dates.length) return null;
  const last = dates.sort().at(-1)!;
  return Math.floor((Date.now() - new Date(last).getTime()) / 864e5);
}

const BACK_SHORT = [
  "Välkommen tillbaka! Kul att se dig igen.",
  "Hej igen! Jag har sparat precis där du slutade.",
  "Där är du ju! Ska vi köra ett litet steg idag?",
];
const BACK_LONG = [
  "Välkommen tillbaka! Det var ett tag sedan, men det gör ingenting. Vi börjar lugnt där du slutade.",
  "Hej igen! Jag har saknat dig. Ett enda litet steg idag är en bra start.",
  "Kul att du är här! Pauser är helt okej. Vi tar det i din takt.",
];

/** Väljer ett meddelande som byts per dag men är stabilt under dagen. */
function daily<T>(list: T[]) {
  return list[new Date().getDate() % list.length];
}

/** Returnerar en välkomsthälsning om eleven har haft en paus, annars null. */
export function welcomeBack(p: StudentProgress): string | null {
  const d = daysSinceActive(p);
  if (d === null) return "Hej och välkommen! Vi börjar med första steget. Det är kort och lätt, jag lovar.";
  if (d >= 7) return daily(BACK_LONG);
  if (d >= 3) return daily(BACK_SHORT);
  return null;
}
