import { Exercise, Client } from "@shared/schema";
import { ALL_EXERCISES } from "./exercises";

type WorkoutGoal = Client["goal"];

const WARMUP_EXERCISES = ["Push-ups", "Jumping Jacks", "Arm Circles", "Bodyweight Squats"];
const COOL_DOWN_EXERCISES = ["Stretching", "Walking", "Yoga Poses"];

// Helper to find an exercise object from the list or create a generic one
function createExercise(name: string, sets: number, reps: number, rest: number): Exercise {
  return {
    id: crypto.randomUUID(),
    name,
    sets,
    reps,
    restSeconds: rest,
    notes: "",
  };
}

export function generateDailyWorkout(goal: WorkoutGoal, dayNumber: number): Exercise[] {
  // Determine workout type based on goal
  // Weight Loss -> High Reps, Circuit style, Cardio mixed in
  // Muscle Gain -> Hypertrophy (8-12 reps), Split routine
  // Endurance -> High reps (15+), Low rest
  // Strength -> Low reps (1-5), High rest

  let exercises: Exercise[] = [];

  // Basic Warmup
  exercises.push(createExercise(
    WARMUP_EXERCISES[dayNumber % WARMUP_EXERCISES.length],
    2,
    15,
    30
  ));

  if (goal === "weight_loss") {
    // HIIT / Circuit
    exercises.push(createExercise("Burpees", 3, 15, 45));
    exercises.push(createExercise("Mountain Climbers", 3, 20, 45));
    exercises.push(createExercise("Jump Squats", 3, 15, 45));
    exercises.push(createExercise("Plank", 3, 1, 60)); // 1 rep = 1 hold
  } else if (goal === "muscle_gain") {
    // Split routine heuristic (Push/Pull/Legs based on day number)
    const split = dayNumber % 3;
    if (split === 1) { // Push
      exercises.push(createExercise("Bench Press", 4, 10, 90));
      exercises.push(createExercise("Overhead Press", 3, 12, 90));
      exercises.push(createExercise("Tricep Dips", 3, 12, 60));
    } else if (split === 2) { // Pull
      exercises.push(createExercise("Pull-ups", 3, 8, 90));
      exercises.push(createExercise("Barbell Rows", 4, 10, 90));
      exercises.push(createExercise("Bicep Curls", 3, 12, 60));
    } else { // Legs
      exercises.push(createExercise("Squats", 4, 10, 120));
      exercises.push(createExercise("Lunges", 3, 12, 90));
      exercises.push(createExercise("Calf Raises", 3, 15, 60));
    }
  } else if (goal === "endurance") {
    exercises.push(createExercise("Running", 1, 1, 0)); // 1 'rep' = 1 run
    exercises.push(createExercise("Cycling", 1, 1, 0));
    exercises.push(createExercise("Rowing", 3, 500, 60));
  } else {
    // Maintenance/General
    exercises.push(createExercise("Squats", 3, 10, 60));
    exercises.push(createExercise("Push-ups", 3, 10, 60));
    exercises.push(createExercise("Lunges", 3, 10, 60));
    exercises.push(createExercise("Plank", 3, 1, 60));
  }

  return exercises;
}
