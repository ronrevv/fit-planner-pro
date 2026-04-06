// Common gym exercises categorized by muscle group with high-quality GIF URLs
export const EXERCISES_LIST = [
  {
    category: "Chest",
    items: [
      { name: "Barbell Bench Press", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0025.gif" },
      { name: "Dumbbell Bench Press", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0033.gif" },
      { name: "Incline Bench Press", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0031.gif" },
      { name: "Push-ups", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0007.gif" },
      { name: "Chest Flyes", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0333.gif" },
      { name: "Dips", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0004.gif" }
    ]
  },
  {
    category: "Back",
    items: [
      { name: "Pull-ups", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0001.gif" },
      { name: "Deadlift", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0032.gif" },
      { name: "Lat Pulldown", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0150.gif" },
      { name: "Barbell Rows", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0047.gif" },
      { name: "Seated Cable Rows", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0170.gif" }
    ]
  },
  {
    category: "Legs",
    items: [
      { name: "Barbell Squat", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0012.gif" },
      { name: "Leg Press", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0593.gif" },
      { name: "Lunges", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0015.gif" },
      { name: "Leg Extensions", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0585.gif" },
      { name: "Leg Curls", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0582.gif" }
    ]
  },
  {
    category: "Shoulders",
    items: [
      { name: "Overhead Press", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0013.gif" },
      { name: "Lateral Raises", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0010.gif" },
      { name: "Front Raises", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0009.gif" },
      { name: "Arnold Press", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0011.gif" }
    ]
  },
  {
    category: "Core",
    items: [
      { name: "Plank", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0008.gif" },
      { name: "Crunches", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0002.gif" },
      { name: "Leg Raises", videoUrl: "https://raw.githubusercontent.com/omercotkd/exercises-gifs/master/gifs/0003.gif" }
    ]
  }
];

// Flat list for easier searching
export const ALL_EXERCISES = EXERCISES_LIST.flatMap(category =>
  category.items.map(item => ({
    label: item.name,
    value: item.name,
    videoUrl: item.videoUrl,
    category: category.category
  }))
);
