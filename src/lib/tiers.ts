import { CHAPTERS, Step, StepType } from "./curriculum";

export type Tier = "gratis" | "start" | "plus" | "premium";

export const TIER_ORDER: Tier[] = ["gratis", "start", "plus", "premium"];

export interface TierInfo {
  id: Tier;
  name: string;
  price: string;
  tagline: string;
  features: string[];
}

export const TIERS: Record<Tier, TierInfo> = {
  gratis: {
    id: "gratis",
    name: "Gratis",
    price: "0 kr",
    tagline: "Ett smakprov för att se hur det fungerar.",
    features: ["2 videolektioner", "2 övningar", "Föräldraportal"],
  },
  start: {
    id: "start",
    name: "Start",
    price: "XX kr/mån",
    tagline: "Lektioner och övningar för hela kursplanen.",
    features: ["Alla videolektioner", "Alla övningar efter varje kapitel", "Hjälpmedel som kalkylator och linjal", "Föräldraportal"],
  },
  plus: {
    id: "plus",
    name: "Plus",
    price: "XX kr/mån",
    tagline: "Testa dina kunskaper med självrättande quiz.",
    features: ["Allt i Start", "Självrättande quiz efter varje kapitel", "Rätt svar och tips från Sigge direkt", "Resultathistorik"],
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: "XX kr/mån",
    tagline: "Allt, plus full screening och egen träningsplan.",
    features: [
      "Allt i Plus",
      "Screening: se exakt vad barnet behöver öva på",
      "Styrkor och svagheter per kapitel, område och årskurs",
      "Individuell träningsplan",
      "Veckorapport med det som behöver övas",
    ],
  },
};

/** De två första kapitlen i åk 4 är gratis smakprov (video + övning). */
export const FREE_CHAPTER_IDS = CHAPTERS.filter((c) => c.grade === 4).slice(0, 2).map((c) => c.id);

const TYPE_MIN_TIER: Record<StepType, Tier> = {
  video: "start",
  ovning: "start",
  quiz: "plus",
  screening: "premium",
};

export function tierAtLeast(tier: Tier, min: Tier) {
  return TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(min);
}

export function requiredTier(step: Step, chapterId: string): Tier {
  if ((step.type === "video" || step.type === "ovning") && FREE_CHAPTER_IDS.includes(chapterId)) return "gratis";
  return TYPE_MIN_TIER[step.type];
}

export function canAccess(tier: Tier, step: Step, chapterId: string) {
  return tierAtLeast(tier, requiredTier(step, chapterId));
}

/** Plus får rätt svar och uppmuntran efter quizen, Premium får dessutom full screening. */
export function quizFeedbackLevel(tier: Tier): "none" | "kort" | "full" {
  if (tierAtLeast(tier, "premium")) return "full";
  if (tierAtLeast(tier, "plus")) return "kort";
  return "none";
}
