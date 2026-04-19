import { FULL_EXERCISES_DATA } from "../../../shared/exercises-data";

export type BodyPart = string;
export type InjuryType = "Knock Knee" | "Lower Back Pain" | "Shoulder Impingement" | "Tennis Elbow" | "Plantar Fasciitis";

export interface ExerciseInfo {
  id: string;
  name: string;
  category: string;
  target: string;
  equipment: string;
  videoUrl: string;
  images: string[];
  instructions: string[];
  level: string;
  primaryMuscles: string[];
}

export const EXERCISE_DATABASE: ExerciseInfo[] = FULL_EXERCISES_DATA.map(ex => ({
  ...ex,
  images: [ex.videoUrl],
  instructions: [`Focus on engaging the ${ex.target || 'target muscles'} properly.`],
  level: "beginner",
  primaryMuscles: [ex.target || "Full Body"]
}));

export const BODY_PARTS: BodyPart[] = Array.from(new Set(EXERCISE_DATABASE.map(ex => ex.category))).filter(Boolean);

export const INJURY_TYPES: InjuryType[] = [
  "Knock Knee",
  "Lower Back Pain",
  "Shoulder Impingement",
  "Tennis Elbow",
  "Plantar Fasciitis"
];

export function getExerciseImageUrl(url: string) {
  return url;
}

export function searchExercises(query: string) {
  if (!query) return EXERCISE_DATABASE;
  const lower = query.toLowerCase();
  return EXERCISE_DATABASE.filter(ex => 
    ex.name.toLowerCase().includes(lower) || 
    ex.target?.toLowerCase().includes(lower) ||
    ex.equipment?.toLowerCase().includes(lower)
  );
}

export function getExercisesByBodyPart(part: BodyPart) {
  return EXERCISE_DATABASE.filter(ex => ex.category === part);
}

export function getExercisesByInjury(injury: InjuryType) {
  // Simplified mock mapping for injuries since FULL_EXERCISES_DATA doesn't have an 'injury' field
  const injuryTargets: Record<InjuryType, string[]> = {
    "Knock Knee": ["glutes", "abductors"],
    "Lower Back Pain": ["abs", "spine", "core"],
    "Shoulder Impingement": ["delts", "rotator cuff"],
    "Tennis Elbow": ["forearms", "triceps"],
    "Plantar Fasciitis": ["calves"]
  };
  
  const targets = injuryTargets[injury];
  return EXERCISE_DATABASE.filter(ex => targets.some(tgt => ex.target?.toLowerCase().includes(tgt))).slice(0, 30);
}

export function getWarmupExercises() {
  return EXERCISE_DATABASE.filter(ex => ex.category.toLowerCase().includes("cardio") || ex.equipment === "body weight").slice(0, 50);
}

export function getBodyPart(part: string) {
  return part;
}
