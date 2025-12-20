import { z } from "zod";

// Gym Schema
export const gymSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Gym name is required"),
  slug: z.string().min(1, "Slug is required"), // For URL or unique ID
  address: z.string().optional(),
  settings: z.string().optional(), // JSON string for settings
  createdAt: z.string().optional(),
});

export const insertGymSchema = gymSchema.omit({ id: true, createdAt: true });
export type Gym = z.infer<typeof gymSchema>;
export type InsertGym = z.infer<typeof insertGymSchema>;

// User Roles
export const UserRole = {
  SUPER_ADMIN: "super_admin",
  GYM_ADMIN: "gym_admin",
  TRAINER: "trainer",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// User Schema (Updated)
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum([UserRole.SUPER_ADMIN, UserRole.GYM_ADMIN, UserRole.TRAINER]),
  gymId: z.string().optional(), // Nullable for super_admin
  createdAt: z.string().optional(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Client Schema (Updated with gymId and trainerId)
export const clientSchema = z.object({
  id: z.string(),
  gymId: z.string(), // Belongs to a gym
  trainerId: z.string(), // Assigned to a trainer
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
