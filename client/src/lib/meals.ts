import { Meal } from "@shared/schema";

type MealWithTags = Omit<Meal, "id"> & {
  tags?: ("vegetarian" | "vegan" | "high-protein" | "low-carb")[];
};

export const MEAL_DATABASE: MealWithTags[] = [
  // Breakfasts
  {
    type: "breakfast",
    name: "Oatmeal with Berries",
    description: "Rolled oats with fresh strawberries and blueberries",
    calories: 350,
    protein: 12,
    carbs: 60,
    fat: 6,
    tags: ["vegetarian", "vegan"],
  },
  {
    type: "breakfast",
    name: "Scrambled Eggs with Toast",
    description: "3 large eggs scrambled with 2 slices of whole wheat toast",
    calories: 450,
    protein: 24,
    carbs: 30,
    fat: 25,
    tags: ["vegetarian", "high-protein"],
  },
  {
    type: "breakfast",
    name: "Greek Yogurt Parfait",
    description: "Greek yogurt with granola and honey",
    calories: 300,
    protein: 20,
    carbs: 45,
    fat: 5,
    tags: ["vegetarian", "high-protein"],
  },
  {
    type: "breakfast",
    name: "Protein Pancakes",
    description: "Pancakes made with whey protein and oats",
    calories: 400,
    protein: 30,
    carbs: 40,
    fat: 10,
    tags: ["vegetarian", "high-protein"],
  },
  {
    type: "breakfast",
    name: "Avocado Toast with Poached Egg",
    description: "Sourdough toast topped with smashed avocado and a poached egg",
    calories: 420,
    protein: 15,
    carbs: 35,
    fat: 22,
    tags: ["vegetarian"],
  },

  // Morning Snacks
  {
    type: "snack_morning",
    name: "Apple and Almond Butter",
    description: "Sliced apple with 1 tbsp almond butter",
    calories: 200,
    protein: 4,
    carbs: 25,
    fat: 10,
    tags: ["vegetarian", "vegan"],
  },
  {
    type: "snack_morning",
    name: "Protein Shake",
    description: "Whey protein powder with water or almond milk",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1,
    tags: ["high-protein", "low-carb", "vegetarian"],
  },
  {
    type: "snack_morning",
    name: "Banana",
    description: "Medium sized banana",
    calories: 105,
    protein: 1,
    carbs: 27,
    fat: 0,
    tags: ["vegetarian", "vegan"],
  },
  {
    type: "snack_morning",
    name: "Hard Boiled Eggs",
    description: "2 hard boiled eggs",
    calories: 140,
    protein: 12,
    carbs: 1,
    fat: 10,
    tags: ["vegetarian", "high-protein", "low-carb"],
  },

  // Lunch
  {
    type: "lunch",
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan",
    calories: 450,
    protein: 40,
    carbs: 10,
    fat: 25,
    tags: ["high-protein", "low-carb"],
  },
  {
    type: "lunch",
    name: "Turkey Sandwich",
    description: "Turkey breast on whole wheat bread with lettuce and tomato",
    calories: 400,
    protein: 30,
    carbs: 45,
    fat: 10,
    tags: ["high-protein"],
  },
  {
    type: "lunch",
    name: "Quinoa Bowl with Tofu",
    description: "Quinoa, baked tofu, and roasted vegetables",
    calories: 500,
    protein: 25,
    carbs: 65,
    fat: 15,
    tags: ["vegetarian", "vegan"],
  },
  {
    type: "lunch",
    name: "Tuna Salad Wrap",
    description: "Tuna mixed with light mayo in a tortilla wrap",
    calories: 380,
    protein: 35,
    carbs: 30,
    fat: 12,
    tags: ["high-protein"],
  },
  {
    type: "lunch",
    name: "Beef Burrito Bowl",
    description: "Ground beef with rice, beans, and salsa",
    calories: 600,
    protein: 35,
    carbs: 70,
    fat: 20,
    tags: ["high-protein"],
  },

  // Afternoon Snacks
  {
    type: "snack_afternoon",
    name: "Greek Yogurt",
    description: "Plain low-fat greek yogurt",
    calories: 100,
    protein: 15,
    carbs: 6,
    fat: 0,
    tags: ["vegetarian", "high-protein", "low-carb"],
  },
  {
    type: "snack_afternoon",
    name: "Almonds",
    description: "Handful of raw almonds",
    calories: 160,
    protein: 6,
    carbs: 6,
    fat: 14,
    tags: ["vegetarian", "vegan", "low-carb"],
  },
  {
    type: "snack_afternoon",
    name: "Cottage Cheese",
    description: "1 cup of low-fat cottage cheese",
    calories: 180,
    protein: 28,
    carbs: 8,
    fat: 2,
    tags: ["vegetarian", "high-protein", "low-carb"],
  },
  {
    type: "snack_afternoon",
    name: "Protein Bar",
    description: "Standard protein bar",
    calories: 220,
    protein: 20,
    carbs: 25,
    fat: 8,
    tags: ["vegetarian", "high-protein"],
  },

  // Dinner
  {
    type: "dinner",
    name: "Salmon with Asparagus",
    description: "Baked salmon fillet with roasted asparagus",
    calories: 450,
    protein: 35,
    carbs: 5,
    fat: 30,
    tags: ["high-protein", "low-carb"],
  },
  {
    type: "dinner",
    name: "Chicken Stir Fry",
    description: "Chicken breast with mixed vegetables and rice",
    calories: 550,
    protein: 40,
    carbs: 60,
    fat: 15,
    tags: ["high-protein"],
  },
  {
    type: "dinner",
    name: "Lean Beef Steak with Potatoes",
    description: "Grilled sirloin steak with baked potato",
    calories: 650,
    protein: 50,
    carbs: 45,
    fat: 30,
    tags: ["high-protein"],
  },
  {
    type: "dinner",
    name: "Pasta Primavera",
    description: "Whole wheat pasta with vegetables in tomato sauce",
    calories: 400,
    protein: 15,
    carbs: 75,
    fat: 5,
    tags: ["vegetarian"],
  },
  {
    type: "dinner",
    name: "Tofu Curry",
    description: "Tofu in coconut curry sauce with rice",
    calories: 500,
    protein: 20,
    carbs: 55,
    fat: 25,
    tags: ["vegetarian", "vegan"],
  }
];

export function generateDailyMeals(targetCalories: number): Omit<Meal, "id">[] {
  // Simple "Smart" Logic:
  // 1. Filter by preference (todo: add preference arg). For now, just balanced.
  // 2. Try to hit within +/- 10% of target calories.

  const getRandomMeal = (type: Meal["type"]) => {
    const options = MEAL_DATABASE.filter(m => m.type === type);
    return options[Math.floor(Math.random() * options.length)];
  };

  let bestCombination: Omit<Meal, "id">[] = [];
  let bestDiff = Infinity;

  // Try 5 times to find a good calorie match
  for (let i = 0; i < 5; i++) {
    const breakfast = getRandomMeal("breakfast");
    const lunch = getRandomMeal("lunch");
    const dinner = getRandomMeal("dinner");
    const snackMorning = getRandomMeal("snack_morning");
    const snackAfternoon = getRandomMeal("snack_afternoon");

    const currentCombo = [breakfast, snackMorning, lunch, snackAfternoon, dinner];
    const totalCals = currentCombo.reduce((sum, m) => sum + m.calories, 0);
    const diff = Math.abs(targetCalories - totalCals);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestCombination = currentCombo;
    }
  }

  // Fallback if empty (shouldn't happen)
  if (bestCombination.length === 0) {
    return [
      getRandomMeal("breakfast"),
      getRandomMeal("snack_morning"),
      getRandomMeal("lunch"),
      getRandomMeal("snack_afternoon"),
      getRandomMeal("dinner")
    ];
  }

  return bestCombination;
}
