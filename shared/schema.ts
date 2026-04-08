import { z } from "zod";

// Gym Schema
export const gymSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Gym name is required"),
  address: z.string().optional(),
  contactEmail: z.string().email(),
  createdAt: z.string(),
});

export const insertGymSchema = gymSchema.omit({ id: true, createdAt: true });
export type Gym = z.infer<typeof gymSchema>;
export type InsertGym = z.infer<typeof insertGymSchema>;

// Trainer Schema
export const trainerSchema = z.object({
  id: z.string(),
  gymId: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  bio: z.string().optional(),
});

export const insertTrainerSchema = trainerSchema.omit({ id: true });
export type Trainer = z.infer<typeof trainerSchema>;
export type InsertTrainer = z.infer<typeof insertTrainerSchema>;

// Client Schema
export const clientSchema = z.object({
  id: z.string(),
  trainerId: z.string().optional(), // Link to trainer
  gymId: z.string().optional(),
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
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("Global"),
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

// Session Schema (Scheduling)
export const sessionSchema = z.object({
  id: z.string(),
  trainerId: z.string(),
  clientId: z.string(),
  dateTime: z.string(), // ISO string
  durationMinutes: z.number().default(60),
  status: z.enum(["scheduled", "completed", "cancelled"]),
  notes: z.string().optional(),
});

export const insertSessionSchema = sessionSchema.omit({ id: true });
export type Session = z.infer<typeof sessionSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// Payment Schema (Tracking)
export const paymentSchema = z.object({
  id: z.string(),
  trainerId: z.string(),
  clientId: z.string(),
  amount: z.number().min(0),
  date: z.string(),
  status: z.enum(["pending", "paid", "overdue"]),
  description: z.string().optional(),
});

export const insertPaymentSchema = paymentSchema.omit({ id: true });
export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Library Item Schema (Shared Exercises/Meals)
export const libraryItemSchema = z.object({
  id: z.string(),
  gymId: z.string(),
  type: z.enum(["exercise", "meal", "workout_plan", "diet_plan"]),
  name: z.string().min(1),
  data: z.any(), // Flexible for exercise details, meal details, or plan templates
  createdAt: z.string(),
});

export const insertLibraryItemSchema = libraryItemSchema.omit({ id: true, createdAt: true });
export type LibraryItem = z.infer<typeof libraryItemSchema>;
export type InsertLibraryItem = z.infer<typeof insertLibraryItemSchema>;

// Social Profile Schema
export const socialProfileSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  displayName: z.string().min(1),
  bio: z.string().optional(),
  interests: z.array(z.string()),
  photos: z.array(z.string()),
  isDatingEnabled: z.boolean().default(false),
  gender: z.string().optional(),
  lookingFor: z.string().optional(),
});

export const insertSocialProfileSchema = socialProfileSchema.omit({ id: true });
export type SocialProfile = z.infer<typeof socialProfileSchema>;
export type InsertSocialProfile = z.infer<typeof insertSocialProfileSchema>;

// Match/Buddy Request Schema
export const matchRequestSchema = z.object({
  id: z.string(),
  fromClientId: z.string(),
  toClientId: z.string(),
  status: z.enum(["pending", "accepted", "declined"]),
  type: z.enum(["buddy", "date"]),
  createdAt: z.string(),
});

export const insertMatchRequestSchema = matchRequestSchema.omit({ id: true, createdAt: true });
export type MatchRequest = z.infer<typeof matchRequestSchema>;
export type InsertMatchRequest = z.infer<typeof insertMatchRequestSchema>;

// Chat Message Schema
export const chatMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(), // Can be clientId or trainerId
  receiverId: z.string(),
  content: z.string().min(1),
  timestamp: z.string(),
  isRead: z.boolean().default(false),
});

export const insertChatMessageSchema = chatMessageSchema.omit({ id: true, timestamp: true });
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Attendance Log Schema
export const attendanceLogSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  date: z.string(), // YYYY-MM-DD
  gymId: z.string(),
});

export const insertAttendanceLogSchema = attendanceLogSchema.omit({ id: true });
export type AttendanceLog = z.infer<typeof attendanceLogSchema>;
export type InsertAttendanceLog = z.infer<typeof insertAttendanceLogSchema>;

// User Schema
export const users = {
  id: "",
  username: "",
  password: "",
  role: "trainer", // "admin", "trainer", "gym_admin"
  gymId: "",
  trainerId: "",
};

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  role: z.enum(["admin", "trainer", "gym_admin"]).default("trainer"),
  gymId: z.string().optional(),
  trainerId: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof insertUserSchema> & { id: string };

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

// Trainer Info Schema (Legacy/Public Profile)
export const trainerProfileSchema = z.object({
  id: z.string(),
  trainerId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export const insertTrainerProfileSchema = trainerProfileSchema.omit({ id: true });
export type TrainerProfile = z.infer<typeof trainerProfileSchema>;
export type InsertTrainerProfile = z.infer<typeof insertTrainerProfileSchema>;
