import { z } from "zod";

// Client Schema
export const clientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number required"),
  age: z.number().min(10).max(100),
  weight: z.number().min(20).max(300),
  height: z.number().min(100).max(250),
  goal: z.enum(["weight_loss", "muscle_gain", "maintenance", "endurance", "flexibility"]),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  notes: z.string().optional(),
  portalKey: z.string().optional(),
});

export const insertClientSchema = clientSchema.omit({ id: true, portalKey: true });
export type Client = z.infer<typeof clientSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;

// Exercise Schema
export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sets: z.number().min(1).max(10),
  reps: z.number().min(1).max(100),
  restSeconds: z.number().min(0).max(600),
  notes: z.string().optional(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

// Day Workout Schema
export const dayWorkoutSchema = z.object({
  day: z.number().min(1).max(31),
  isRestDay: z.boolean(),
  exercises: z.array(exerciseSchema),
  notes: z.string().optional(),
});

export type DayWorkout = z.infer<typeof dayWorkoutSchema>;

// Workout Plan Schema
export const workoutPlanSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number().min(2024).max(2030),
  days: z.array(dayWorkoutSchema),
});

export const insertWorkoutPlanSchema = workoutPlanSchema.omit({ id: true });
export type WorkoutPlan = z.infer<typeof workoutPlanSchema>;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;

// Meal Schema
export const mealSchema = z.object({
  id: z.string(),
  type: z.enum(["breakfast", "snack_morning", "lunch", "snack_afternoon", "dinner"]),
  name: z.string().min(1),
  description: z.string().optional(),
  calories: z.number().min(0).max(3000),
  protein: z.number().min(0).max(300),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(200),
});

export type Meal = z.infer<typeof mealSchema>;

// Day Diet Schema
export const dayDietSchema = z.object({
  day: z.number().min(1).max(31),
  meals: z.array(mealSchema),
  waterIntake: z.number().min(0).max(10),
  notes: z.string().optional(),
});

export type DayDiet = z.infer<typeof dayDietSchema>;

// Diet Plan Schema
export const dietPlanSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  name: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number().min(2024).max(2030),
  targetCalories: z.number().min(1000).max(5000),
  days: z.array(dayDietSchema),
});

export const insertDietPlanSchema = dietPlanSchema.omit({ id: true });
export type DietPlan = z.infer<typeof dietPlanSchema>;
export type InsertDietPlan = z.infer<typeof insertDietPlanSchema>;

// Progress Schema
export const progressSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  date: z.number(), // timestamp
  weight: z.number().min(20).max(300),
  notes: z.string().optional(),
});

export const insertProgressSchema = progressSchema.omit({ id: true });
export type Progress = z.infer<typeof progressSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;

// Daily Log Schema (Client Check-in)
export const dailyLogSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  date: z.number(), // timestamp
  completedExercises: z.array(z.string()), // exercise IDs
  completedMeals: z.array(z.string()), // meal IDs
  mood: z.enum(["great", "good", "neutral", "tired", "bad"]).optional(),
  notes: z.string().optional(),
});

export const insertDailyLogSchema = dailyLogSchema.omit({ id: true });
export type DailyLog = z.infer<typeof dailyLogSchema>;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;

// User Schema (for trainers)
export const users = {
  id: "",
  username: "",
  password: "",
};

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: string;
  username: string;
  password: string;
};

// Goal display names
export const goalLabels: Record<Client["goal"], string> = {
  weight_loss: "Weight Loss",
  muscle_gain: "Muscle Gain",
  maintenance: "Maintenance",
  endurance: "Endurance",
  flexibility: "Flexibility",
};

// Fitness level display names
export const fitnessLevelLabels: Record<Client["fitnessLevel"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// Meal type display names
export const mealTypeLabels: Record<Meal["type"], string> = {
  breakfast: "Breakfast",
  snack_morning: "Morning Snack",
  lunch: "Lunch",
  snack_afternoon: "Afternoon Snack",
  dinner: "Dinner",
};
