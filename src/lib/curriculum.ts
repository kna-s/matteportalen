// Kursplan för matematik åk 4–6 enligt Skolverkets centrala innehåll.
// Allt innehåll här är PLATSHÅLLARE. Riktigt innehåll läggs in av våra lärare
// (i fas 2 via databasen i stället för den här filen).

import type { IconName } from "@/components/icons/Icon";

export type Grade = 4 | 5 | 6;
export const GRADES: Grade[] = [4, 5, 6];

export type StepType = "video" | "ovning" | "quiz" | "screening";

export type ToolId = "kalkylator" | "linjal" | "gradskiva" | "koordinatsystem" | "tallinje";

export const TOOL_LABELS: Record<ToolId, string> = {
  kalkylator: "Kalkylator",
  linjal: "Linjal",
  gradskiva: "Gradskiva",
  koordinatsystem: "Koordinatsystem",
  tallinje: "Tallinje",
};

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  /** Delmoment/fokus som frågan testar, används av screeningen. */
  focus: string;
}

export interface Step {
  id: string;
  type: StepType;
  title: string;
  /** Vilka hjälpmedel som är påslagna för steget (styrs av våra lärare). */
  tools: ToolId[];
  /** Månad materialet publicerades, för framtida månadsuppdateringar/arkiv. */
  publishedMonth: string;
  version: number;
  questions?: QuizQuestion[];
  tasks?: string[];
}

export interface Chapter {
  id: string;
  grade: Grade;
  areaId: string;
  title: string;
  description: string;
  steps: Step[];
}

export interface Area {
  id: string;
  title: string;
  emoji: string;
  icon: IconName;
  color: string;
  topics: string[];
}

export const AREAS: Area[] = [
  {
    id: "taluppfattning",
    icon: "taluppfattning",
    title: "Taluppfattning och tals användning",
    emoji: "🔢",
    color: "#1f3a68",
    topics: [
      "Rationella tal och negativa tal",
      "Positionssystemet och decimaltal",
      "Talsystem genom historien",
      "Procent, bråk och decimalform",
      "Bråk och decimaler i vardagen",
      "De fyra räknesätten",
      "Huvudräkning, överslag och skriftlig räkning",
      "Rimlighetsbedömning",
    ],
  },
  {
    id: "algebra",
    icon: "algebra",
    title: "Algebra",
    emoji: "🧩",
    color: "#7a1f2b",
    topics: [
      "Likheter och likhetstecknet",
      "Variabler och uttryck",
      "Lösa enkla ekvationer",
      "Mönster i talföljder och geometriska mönster",
    ],
  },
  {
    id: "geometri",
    icon: "geometri",
    title: "Geometri",
    emoji: "📐",
    color: "#2f6b4f",
    topics: [
      "Två- och tredimensionella objekt",
      "Mäta längd, area, massa, volym, tid och vinkel",
      "Omkrets och area",
      "Skala vid förminskning och förstoring",
      "Symmetri",
    ],
  },
  {
    id: "sannolikhet",
    icon: "sannolikhet",
    title: "Sannolikhet och statistik",
    emoji: "🎲",
    color: "#8a6a12",
    topics: [
      "Slump, chans och risk",
      "Enkel kombinatorik",
      "Tabeller och diagram",
      "Medelvärde, typvärde och median",
    ],
  },
  {
    id: "samband",
    icon: "samband",
    title: "Samband och förändring",
    emoji: "📈",
    color: "#5b3a7a",
    topics: [
      "Proportionalitet",
      "Koordinatsystem och gradering av axlar",
      "Grafer för proportionella samband",
    ],
  },
  {
    id: "problemlosning",
    icon: "problemlosning",
    title: "Problemlösning",
    emoji: "💡",
    color: "#a2471c",
    topics: [
      "Strategier för problemlösning",
      "Formulera egna matematiska frågor",
    ],
  },
];

export const BABBEL =
  "Här kommer en kort introduktion som våra lärare skriver. Den förklarar vad delmomentet handlar om, varför det är bra att kunna och hur det hänger ihop med vardagen. Texten är en platshållare tills riktigt innehåll läggs in.";

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toolsFor(areaId: string, topic: string): ToolId[] {
  const t = topic.toLowerCase();
  const tools: ToolId[] = [];
  if (areaId === "taluppfattning" || areaId === "samband" || areaId === "problemlosning") tools.push("kalkylator");
  if (t.includes("negativa") || t.includes("decimal") || t.includes("bråk") || t.includes("rimlig")) tools.push("tallinje");
  if (areaId === "geometri") tools.push("linjal");
  if (t.includes("vinkel") || t.includes("objekt") || t.includes("symmetri")) tools.push("gradskiva");
  if (t.includes("koordinat") || t.includes("graf") || t.includes("proportional")) tools.push("koordinatsystem");
  if (areaId === "sannolikhet") tools.push("kalkylator");
  return Array.from(new Set(tools));
}

// Enkel deterministisk slump så att platshållarfrågor blir samma varje gång.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function placeholderQuestions(chapterId: string, grade: Grade, topic: string, n: number): QuizQuestion[] {
  const rand = seeded(chapterId.split("").reduce((a, c) => a + c.charCodeAt(0), grade * 7));
  const focuses = ["Begrepp", "Metod", "Tillämpning"];
  return Array.from({ length: n }, (_, i) => {
    const a = Math.floor(rand() * 10 * grade) + 2;
    const b = Math.floor(rand() * 10) + 1;
    const correct = a + b;
    const opts = [correct, correct + 1, correct - 2, correct + 3].sort(() => rand() - 0.5);
    return {
      id: `${chapterId}-q${i + 1}`,
      prompt: `Platshållarfråga ${i + 1} om ${topic.toLowerCase()}: Vad är ${a} + ${b}?`,
      options: opts.map(String),
      correctIndex: opts.indexOf(correct),
      focus: focuses[i % focuses.length],
    };
  });
}

function buildChapters(): Chapter[] {
  const chapters: Chapter[] = [];
  for (const grade of GRADES) {
    for (const area of AREAS) {
      for (const topic of area.topics) {
        const id = `ak${grade}-${slug(topic)}`;
        const tools = toolsFor(area.id, topic);
        chapters.push({
          id,
          grade,
          areaId: area.id,
          title: topic,
          description: `Åk ${grade}: ${BABBEL}`,
          steps: [
            { id: `${id}-video`, type: "video", title: `Videolektion: ${topic}`, tools: [], publishedMonth: "2026-11", version: 1 },
            {
              id: `${id}-ovning`,
              type: "ovning",
              title: `Övning: ${topic}`,
              tools,
              publishedMonth: "2026-11",
              version: 1,
              tasks: [
                `Gör uppgift 1 om ${topic.toLowerCase()} och skriv ner hur du tänkte.`,
                "Rita en bild som visar din lösning.",
                "Hitta ett exempel från din vardag där du kan använda det här.",
              ],
            },
            {
              id: `${id}-quiz`,
              type: "quiz",
              title: `Quiz: ${topic}`,
              tools,
              publishedMonth: "2026-11",
              version: 1,
              questions: placeholderQuestions(id, grade, topic, 6),
            },
            { id: `${id}-screening`, type: "screening", title: `Screening: ${topic}`, tools: [], publishedMonth: "2026-11", version: 1 },
          ],
        });
      }
    }
  }
  return chapters;
}

export const CHAPTERS: Chapter[] = buildChapters();

export function getChapter(id: string) {
  return CHAPTERS.find((c) => c.id === id);
}

export function getArea(id: string) {
  return AREAS.find((a) => a.id === id)!;
}

export function chaptersFor(grade: Grade, areaId?: string) {
  return CHAPTERS.filter((c) => c.grade === grade && (!areaId || c.areaId === areaId));
}

export function findStep(stepId: string) {
  for (const c of CHAPTERS) {
    const s = c.steps.find((x) => x.id === stepId);
    if (s) return { chapter: c, step: s };
  }
  return undefined;
}

/** Hela kursplanen i ordning som en lista av steg (för "Nästa"-flödet). */
export function linearSteps(grade: Grade) {
  return chaptersFor(grade).flatMap((c) => c.steps.map((s) => ({ chapter: c, step: s })));
}

export const STEP_LABELS: Record<StepType, string> = {
  video: "Videolektion",
  ovning: "Övning",
  quiz: "Quiz",
  screening: "Screening",
};

export const STEP_ICON: Record<StepType, IconName> = {
  video: "video",
  ovning: "ovning",
  quiz: "quiz",
  screening: "screening",
};

export const STEP_ICONS: Record<StepType, string> = {
  video: "🎥",
  ovning: "✏️",
  quiz: "🏆",
  screening: "🧠",
};
