// Common gym exercises categorized by muscle group
export const EXERCISES_LIST = [
  {
    category: "Chest",
    items: [
      "Barbell Bench Press",
      "Dumbbell Bench Press",
      "Incline Bench Press",
      "Decline Bench Press",
      "Push-ups",
      "Chest Flyes",
      "Cable Crossover",
      "Dips"
    ]
  },
  {
    category: "Back",
    items: [
      "Pull-ups",
      "Chin-ups",
      "Lat Pulldown",
      "Barbell Rows",
      "Dumbbell Rows",
      "Seated Cable Rows",
      "Face Pulls",
      "Deadlift",
      "T-Bar Row"
    ]
  },
  {
    category: "Legs",
    items: [
      "Barbell Squat",
      "Leg Press",
      "Lunges",
      "Leg Extensions",
      "Leg Curls",
      "Romanian Deadlift",
      "Calf Raises",
      "Bulgarian Split Squat",
      "Goblet Squat"
    ]
  },
  {
    category: "Shoulders",
    items: [
      "Overhead Press",
      "Dumbbell Shoulder Press",
      "Lateral Raises",
      "Front Raises",
      "Reverse Flyes",
      "Upright Rows",
      "Arnold Press",
      "Shrugs"
    ]
  },
  {
    category: "Arms",
    items: [
      "Barbell Curl",
      "Dumbbell Curl",
      "Hammer Curl",
      "Tricep Pushdowns",
      "Skull Crushers",
      "Overhead Tricep Extension",
      "Preacher Curl",
      "Concentration Curl"
    ]
  },
  {
    category: "Core",
    items: [
      "Crunches",
      "Plank",
      "Leg Raises",
      "Russian Twists",
      "Ab Wheel Rollout",
      "Mountain Climbers",
      "Bicycle Crunches",
      "Hanging Leg Raise"
    ]
  },
  {
    category: "Cardio",
    items: [
      "Treadmill Run",
      "Cycling",
      "Elliptical",
      "Rowing Machine",
      "Jump Rope",
      "Stair Climber",
      "Burpees"
    ]
  }
];

// Flat list for easier searching
export const ALL_EXERCISES = EXERCISES_LIST.flatMap(category =>
  category.items.map(item => ({
    label: item,
    value: item,
    category: category.category
  }))
);
