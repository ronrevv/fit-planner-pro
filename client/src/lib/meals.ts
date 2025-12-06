import { Meal } from "@shared/schema";

export const MEAL_DATABASE: Omit<Meal, "id">[] = [
  // Breakfasts
  {
    type: "breakfast",
    name: "Oatmeal with Berries",
    description: "Rolled oats with fresh strawberries and blueberries",
    calories: 350,
    protein: 12,
    carbs: 60,
    fat: 6,
  },
  {
    type: "breakfast",
    name: "Scrambled Eggs with Toast",
    description: "3 large eggs scrambled with 2 slices of whole wheat toast",
    calories: 450,
    protein: 24,
    carbs: 30,
    fat: 25,
  },
  {
    type: "breakfast",
    name: "Greek Yogurt Parfait",
    description: "Greek yogurt with granola and honey",
    calories: 300,
    protein: 20,
    carbs: 45,
    fat: 5,
  },
  {
    type: "breakfast",
    name: "Protein Pancakes",
    description: "Pancakes made with whey protein and oats",
    calories: 400,
    protein: 30,
    carbs: 40,
    fat: 10,
  },
  {
    type: "breakfast",
    name: "Avocado Toast with Poached Egg",
    description: "Sourdough toast topped with smashed avocado and a poached egg",
    calories: 420,
    protein: 15,
    carbs: 35,
    fat: 22,
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
  },
  {
    type: "snack_morning",
    name: "Protein Shake",
    description: "Whey protein powder with water or almond milk",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1,
  },
  {
    type: "snack_morning",
    name: "Banana",
    description: "Medium sized banana",
    calories: 105,
    protein: 1,
    carbs: 27,
    fat: 0,
  },
  {
    type: "snack_morning",
    name: "Hard Boiled Eggs",
    description: "2 hard boiled eggs",
    calories: 140,
    protein: 12,
    carbs: 1,
    fat: 10,
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
  },
  {
    type: "lunch",
    name: "Turkey Sandwich",
    description: "Turkey breast on whole wheat bread with lettuce and tomato",
    calories: 400,
    protein: 30,
    carbs: 45,
    fat: 10,
  },
  {
    type: "lunch",
    name: "Quinoa Bowl with Tofu",
    description: "Quinoa, baked tofu, and roasted vegetables",
    calories: 500,
    protein: 25,
    carbs: 65,
    fat: 15,
  },
  {
    type: "lunch",
    name: "Tuna Salad Wrap",
    description: "Tuna mixed with light mayo in a tortilla wrap",
    calories: 380,
    protein: 35,
    carbs: 30,
    fat: 12,
  },
  {
    type: "lunch",
    name: "Beef Burrito Bowl",
    description: "Ground beef with rice, beans, and salsa",
    calories: 600,
    protein: 35,
    carbs: 70,
    fat: 20,
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
  },
  {
    type: "snack_afternoon",
    name: "Almonds",
    description: "Handful of raw almonds",
    calories: 160,
    protein: 6,
    carbs: 6,
    fat: 14,
  },
  {
    type: "snack_afternoon",
    name: "Cottage Cheese",
    description: "1 cup of low-fat cottage cheese",
    calories: 180,
    protein: 28,
    carbs: 8,
    fat: 2,
  },
  {
    type: "snack_afternoon",
    name: "Protein Bar",
    description: "Standard protein bar",
    calories: 220,
    protein: 20,
    carbs: 25,
    fat: 8,
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
  },
  {
    type: "dinner",
    name: "Chicken Stir Fry",
    description: "Chicken breast with mixed vegetables and rice",
    calories: 550,
    protein: 40,
    carbs: 60,
    fat: 15,
  },
  {
    type: "dinner",
    name: "Lean Beef Steak with Potatoes",
    description: "Grilled sirloin steak with baked potato",
    calories: 650,
    protein: 50,
    carbs: 45,
    fat: 30,
  },
  {
    type: "dinner",
    name: "Pasta Primavera",
    description: "Whole wheat pasta with vegetables in tomato sauce",
    calories: 400,
    protein: 15,
    carbs: 75,
    fat: 5,
  },
  {
    type: "dinner",
    name: "Tofu Curry",
    description: "Tofu in coconut curry sauce with rice",
    calories: 500,
    protein: 20,
    carbs: 55,
    fat: 25,
  }
];

export function generateDailyMeals(targetCalories: number): Omit<Meal, "id">[] {
  // Approximate distribution: Breakfast 25%, Lunch 35%, Dinner 30%, Snacks 10%
  // But we'll just pick randoms for now and maybe scale or pick best fit later.
  // For simplicity, we just pick one random meal for each category.

  const getRandomMeal = (type: Meal["type"]) => {
    const options = MEAL_DATABASE.filter(m => m.type === type);
    return options[Math.floor(Math.random() * options.length)];
  };

  const breakfast = getRandomMeal("breakfast");
  const lunch = getRandomMeal("lunch");
  const dinner = getRandomMeal("dinner");
  const snackMorning = getRandomMeal("snack_morning");
  const snackAfternoon = getRandomMeal("snack_afternoon");

  return [breakfast, snackMorning, lunch, snackAfternoon, dinner];
}
