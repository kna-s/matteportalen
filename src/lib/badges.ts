// Märken som eleven kan låsa upp. Samma uppsättning används i varje årskurs
// (räknas om per årskurs), men kan senare bytas ut mot egna märken per årskurs.

import { AREAS, Grade, chaptersFor } from "./curriculum";
import { StudentProgress } from "./store";
import { Tier, canAccess } from "./tiers";

export type BadgeCategory = "start" | "omrade" | "quiz" | "kampa" | "vana" | "upptackare";

export const CATEGORY_INFO: Record<BadgeCategory, { title: string; color: string }> = {
  start: { title: "Kom igång", color: "#2f8f6b" },
  omrade: { title: "Områden", color: "#0e4f61" },
  quiz: { title: "Quiz", color: "#f07c3e" },
  kampa: { title: "Kämpa på", color: "#c2417a" },
  vana: { title: "Vanor", color: "#6a4fb3" },
  upptackare: { title: "Upptäckare", color: "#b58a12" },
};

export interface BadgeCtx {
  p: StudentProgress;
  grade: Grade;
  tier: Tier;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  category: BadgeCategory;
  /** Vad man har gjort (visas när märket är upplåst). */
  description: string;
  /** Ledtråd (visas när märket är låst). */
  hint: string;
  funFact: string;
  /** Kommentar från maskoten. */
  cheer: string;
  earned: (c: BadgeCtx) => boolean;
  /** Framsteg 0–1 mot märket (valfritt, visas på låsta märken). */
  progress?: (c: BadgeCtx) => number;
}

function activeDays(p: StudentProgress) {
  return Array.from(new Set(Object.values(p.completed).map((d) => d.slice(0, 10)))).sort();
}

function areaDone(c: BadgeCtx, areaId: string) {
  return chaptersFor(c.grade, areaId).every((ch) => ch.steps.filter((s) => canAccess(c.tier, s, ch.id)).every((s) => c.p.completed[s.id]));
}

function areaRatio(c: BadgeCtx, areaId: string) {
  const chs = chaptersFor(c.grade, areaId);
  const done = chs.filter((ch) => ch.steps.filter((s) => canAccess(c.tier, s, ch.id)).every((s) => c.p.completed[s.id])).length;
  return done / chs.length;
}

function gradeSteps(c: BadgeCtx) {
  return chaptersFor(c.grade).flatMap((ch) => ch.steps.filter((s) => canAccess(c.tier, s, ch.id)));
}

const AREA_BADGES: Record<string, { name: string; icon: string; fact: string }> = {
  taluppfattning: { name: "Talmästare", icon: "🔢", fact: "Siffran noll kom till Europa från Indien via arabiska matematiker för ungefär 1 000 år sedan." },
  algebra: { name: "Algebradetektiv", icon: "🔎", fact: "Ordet algebra kommer från arabiskans ”al-jabr”, som betyder ungefär ”att sätta ihop det som är trasigt”." },
  geometri: { name: "Geometrimästare", icon: "📐", fact: "Bin bygger sina vaxkakor av sexhörningar. Det är den form som använder minst vax för mest plats." },
  sannolikhet: { name: "Slumpforskare", icon: "🎲", fact: "Om ni är 23 personer i ett rum är chansen över 50 % att två av er fyller år samma dag." },
  samband: { name: "Sambandsspanare", icon: "📈", fact: "René Descartes kom på koordinatsystemet, enligt legenden när han låg i sängen och tittade på en fluga i taket." },
  problemlosning: { name: "Problemlösaren", icon: "💡", fact: "En del matteproblem har varit olösta i hundratals år. Det finns pris på en miljon dollar för att lösa vissa av dem!" },
};

export const BADGES: Badge[] = [
  // Kom igång
  {
    id: "forsta-steget",
    name: "Första steget",
    icon: "👣",
    category: "start",
    description: "Du gjorde ditt allra första steg på Matteportalen.",
    hint: "Gör ditt första steg, till exempel en videolektion.",
    funFact: "Alla som är bra på matte började någon gång med sitt allra första steg.",
    cheer: "Välkommen! Nu kör vi!",
    earned: ({ p }) => Object.keys(p.completed).length > 0,
  },
  {
    id: "halvvags",
    name: "Halvvägs",
    icon: "🏔️",
    category: "start",
    description: "Du har klarat hälften av allt i din årskurs.",
    hint: "Klara hälften av stegen i din årskurs.",
    funFact: "Bergsklättrare säger att andra halvan går lättare, för då vet man att man klarar det.",
    cheer: "Halva berget är bestiget!",
    earned: (c) => {
      const all = gradeSteps(c);
      return all.filter((s) => c.p.completed[s.id]).length >= all.length / 2;
    },
    progress: (c) => {
      const all = gradeSteps(c);
      return Math.min(1, all.filter((s) => c.p.completed[s.id]).length / (all.length / 2));
    },
  },
  // Områden
  ...AREAS.map(
    (a): Badge => ({
      id: `omrade-${a.id}`,
      name: AREA_BADGES[a.id].name,
      icon: AREA_BADGES[a.id].icon,
      category: "omrade",
      description: `Du har klarat alla kapitel i ${a.title}.`,
      hint: `Klara alla kapitel i ${a.title}.`,
      funFact: AREA_BADGES[a.id].fact,
      cheer: "Ett helt område! Det är riktigt stort.",
      earned: (c) => areaDone(c, a.id),
      progress: (c) => areaRatio(c, a.id),
    }),
  ),
  // Quiz
  {
    id: "forsta-quizen",
    name: "Första quizen",
    icon: "🏆",
    category: "quiz",
    description: "Du gjorde din första quiz.",
    hint: "Gör en quiz.",
    funFact: "Ordet quiz sägs ha uppfunnits som ett skämt i Dublin på 1700-talet.",
    cheer: "Första quizen avklarad!",
    earned: ({ p }) => p.quizResults.length > 0,
  },
  {
    id: "fullpott",
    name: "Fullpott",
    icon: "💯",
    category: "quiz",
    description: "Du fick alla rätt på en quiz.",
    hint: "Få alla rätt på en quiz.",
    funFact: "Inom matte är 100 % alltid lika mycket som 1 hel, oavsett vad man räknar.",
    cheer: "ALLA rätt! Wow!",
    earned: ({ p }) => p.quizResults.some((r) => r.score === r.total),
  },
  {
    id: "tre-i-rad",
    name: "Tre i rad",
    icon: "🔥",
    category: "quiz",
    description: "Du fick minst 80 % rätt på tre quiz i rad.",
    hint: "Få minst 80 % rätt på tre quiz i rad.",
    funFact: "Tre i rad kallas ”hattrick” inom fotboll. Det kommer från cricket, där man förr fick en hatt som pris!",
    cheer: "Du är het just nu!",
    earned: ({ p }) => {
      let run = 0;
      for (const r of p.quizResults) {
        run = r.score / r.total >= 0.8 ? run + 1 : 0;
        if (run >= 3) return true;
      }
      return false;
    },
  },
  {
    id: "quizexpert",
    name: "Quizexpert",
    icon: "🎓",
    category: "quiz",
    description: "Du har gjort 10 quiz.",
    hint: "Gör 10 quiz.",
    funFact: "Hjärnan blir bättre på att minnas saker när man testar sig själv, det kallas testeffekten.",
    cheer: "Tio quiz! Din hjärna tackar dig.",
    earned: ({ p }) => p.quizResults.length >= 10,
    progress: ({ p }) => Math.min(1, p.quizResults.length / 10),
  },
  // Kämpa på
  {
    id: "kampaglod",
    name: "Kämpaglöd",
    icon: "💪",
    category: "kampa",
    description: "Du gjorde om en quiz och fick fler rätt än förra gången.",
    hint: "Gör om en quiz och förbättra ditt resultat.",
    funFact: "Thomas Edison testade tusentals material innan glödlampan fungerade. Att försöka igen är en superkraft.",
    cheer: "Du gav inte upp, och det syns!",
    earned: ({ p }) => p.quizResults.some((r, i) => p.quizResults.slice(0, i).some((e) => e.stepId === r.stepId && r.score > e.score)),
  },
  {
    id: "comeback",
    name: "Comeback",
    icon: "🚀",
    category: "kampa",
    description: "Du gick från under 60 % till minst 85 % rätt på samma quiz.",
    hint: "Gör om en quiz där det gick tungt och få minst 85 % rätt.",
    funFact: "Många astronauter fick nej första gången de sökte. De sökte igen.",
    cheer: "Vilken comeback!",
    earned: ({ p }) =>
      p.quizResults.some((r, i) => r.score / r.total >= 0.85 && p.quizResults.slice(0, i).some((e) => e.stepId === r.stepId && e.score / e.total < 0.6)),
  },
  // Vanor
  {
    id: "veckans-raknare",
    name: "Veckans räknare",
    icon: "📅",
    category: "vana",
    description: "Du har räknat tre olika dagar under samma vecka.",
    hint: "Räkna tre olika dagar inom en vecka.",
    funFact: "Lite varje dag slår mycket en gång. Hjärnan bygger starkare minnen när man tränar ofta.",
    cheer: "Snyggt, du gör det till en vana!",
    earned: ({ p }) => {
      const days = activeDays(p).map((d) => new Date(d).getTime());
      return days.some((d, i) => days.filter((x, j) => j >= i && x - d < 7 * 864e5).length >= 3);
    },
  },
  {
    id: "fem-dagar",
    name: "Fem dagar",
    icon: "🌟",
    category: "vana",
    description: "Du har räknat på fem olika dagar.",
    hint: "Räkna på fem olika dagar.",
    funFact: "Det sägs ta ungefär två månader att bygga en ny vana. Fem dagar är en riktigt bra början!",
    cheer: "Fem dagar! Du är grym.",
    earned: ({ p }) => activeDays(p).length >= 5,
    progress: ({ p }) => Math.min(1, activeDays(p).length / 5),
  },
  // Upptäckare
  {
    id: "gradskiva",
    name: "Vinkelvän",
    icon: "📏",
    category: "upptackare",
    description: "Du använde gradskivan för första gången.",
    hint: "Prova gradskivan i en övning.",
    funFact: "Ett helt varv är 360 grader. Det kommer från babylonierna, som räknade med talet 60.",
    cheer: "Nu kan du mäta vinklar!",
    earned: ({ p }) => !!p.toolsUsed?.includes("gradskiva"),
  },
  {
    id: "kalkylator",
    name: "Kalkylkollen",
    icon: "🧮",
    category: "upptackare",
    description: "Du använde kalkylatorn för första gången.",
    hint: "Prova kalkylatorn i en övning.",
    funFact: "Den första mekaniska räknemaskinen byggdes av Blaise Pascal när han var 19 år gammal.",
    cheer: "Smart att använda rätt verktyg!",
    earned: ({ p }) => !!p.toolsUsed?.includes("kalkylator"),
  },
];

export function getBadge(id: string) {
  return BADGES.find((b) => b.id === id);
}

export function earnedBadges(c: BadgeCtx) {
  return BADGES.filter((b) => b.earned(c));
}
