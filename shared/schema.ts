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
  token: z.string().optional(), // Public portal access token
});

export const insertClientSchema = clientSchema.omit({ id: true, token: true });
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
  videoUrl: z.string().optional(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

// Day Workout Schema
export const dayWorkoutSchema = z.object({
  day: z.number().min(1).max(31),
  isRestDay: z.boolean(),
  exercises: z.array(exerciseSchema),
  warmup: z.array(exerciseSchema).optional(),
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

// Injury Log Schema
export const injuryLogSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  date: z.string(), // ISO date string
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["Active", "Recovering", "Recovered"]),
  recoveryDate: z.string().optional(),
});

export const insertInjuryLogSchema = injuryLogSchema.omit({ id: true });
export type InjuryLog = z.infer<typeof injuryLogSchema>;
export type InsertInjuryLog = z.infer<typeof insertInjuryLogSchema>;

// Measurement Log Schema
export const measurementLogSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  date: z.string(), // ISO date string
  weight: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  chest: z.number().min(0).optional(),
  waist: z.number().min(0).optional(),
  hips: z.number().min(0).optional(),
  arms: z.number().min(0).optional(),
  thighs: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const insertMeasurementLogSchema = measurementLogSchema.omit({ id: true });
export type MeasurementLog = z.infer<typeof measurementLogSchema>;
export type InsertMeasurementLog = z.infer<typeof insertMeasurementLogSchema>;

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

// Item Completion Schema
export const itemCompletionSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  planId: z.string(), // ID of the workout or diet plan
  type: z.enum(["workout", "diet"]),
  date: z.string(), // ISO date string (YYYY-MM-DD)
  itemId: z.string(), // ID of exercise or meal
  completed: z.boolean(),
});

export const insertItemCompletionSchema = itemCompletionSchema.omit({ id: true });
export type ItemCompletion = z.infer<typeof itemCompletionSchema>;
export type InsertItemCompletion = z.infer<typeof insertItemCompletionSchema>;

// Client Resource Schema
export const clientResourceSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(["link", "file"]),
  url: z.string().min(1, "URL is required"),
  description: z.string().optional(),
  createdAt: z.string(),
});

export const insertClientResourceSchema = clientResourceSchema.omit({ id: true, createdAt: true });
export type ClientResource = z.infer<typeof clientResourceSchema>;
export type InsertClientResource = z.infer<typeof insertClientResourceSchema>;

// Trainer Info Schema (Singleton per client usually, or global)
// For now, let's keep it simple: Trainer Info can be part of Client settings or a separate object associated with a client if we want specific info per client.
// However, a global "Trainer Profile" might be better.
// Given the current architecture, let's add a `trainerInfo` field to the Client object
// OR create a separate simple store for trainer details that can be updated.
// Let's create a dedicated schema for Trainer Public Profile that can be linked to clients.
// For simplicity and since we have single trainer (implied by auth), let's store it as a key-value or single record.
// BUT, the request implies "Something client can see".
// Let's add a "trainerProfile" to the response of the portal, which comes from a new store or the user object.
// Since User schema is minimal, let's add a specific 'TrainerProfile' schema.

export const trainerProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export const insertTrainerProfileSchema = trainerProfileSchema.omit({ id: true });
export type TrainerProfile = z.infer<typeof trainerProfileSchema>;
export type InsertTrainerProfile = z.infer<typeof insertTrainerProfileSchema>;

// Exercise Library Schema
export const exerciseLibrarySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  videoUrl: z.string().optional(),
  description: z.string().optional(),
});

export const insertExerciseLibrarySchema = exerciseLibrarySchema.omit({ id: true });
export type ExerciseLibraryItem = z.infer<typeof exerciseLibrarySchema>;
export type InsertExerciseLibraryItem = z.infer<typeof insertExerciseLibrarySchema>;
